import { Request, Response } from "express";
import { AdminUserController } from "../../../controllers/admin-user.controller";
import { AdminUserService } from "../../../services/admin-user.service";
import { ApiResponseHelper } from "../../../utils/apihelper.util";

jest.mock("../../../services/admin-user.service");
jest.mock("../../../utils/apihelper.util");

describe("AdminUserController Unit Tests", () => {
  let controller: AdminUserController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    controller = new AdminUserController();
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe("getUsers", () => {
    it("should parse query params and call adminUserService.getUsers", async () => {
      mockReq = {
        query: { page: "2", limit: "5", search: "alice" },
      };

      const mockResult = {
        users: [{ fullName: "Alice" }],
        pagination: { page: 2, limit: 5, total: 1, totalPages: 1 },
      };

      (AdminUserService.prototype.getUsers as jest.Mock).mockResolvedValue(mockResult);

      await controller.getUsers(mockReq as Request, mockRes as Response);

      expect(AdminUserService.prototype.getUsers).toHaveBeenCalledWith(2, 5, "alice");
      expect(ApiResponseHelper.success).toHaveBeenCalledWith(
        mockRes,
        mockResult.users,
        "Users fetched successfully",
        200,
        mockResult.pagination
      );
    });

    it("should default query params when missing", async () => {
      mockReq = { query: {} };
      const mockResult = { users: [], pagination: {} };
      (AdminUserService.prototype.getUsers as jest.Mock).mockResolvedValue(mockResult);

      await controller.getUsers(mockReq as Request, mockRes as Response);

      expect(AdminUserService.prototype.getUsers).toHaveBeenCalledWith(1, 10, undefined);
    });

    it("should handle service exceptions and return error", async () => {
      mockReq = { query: {} };
      const testError = { message: "DB Error", status: 500 };
      (AdminUserService.prototype.getUsers as jest.Mock).mockRejectedValue(testError);

      await controller.getUsers(mockReq as Request, mockRes as Response);

      expect(ApiResponseHelper.error).toHaveBeenCalledWith(mockRes, "DB Error", 500);
    });
  });

  describe("getUserById", () => {
    it("should call adminUserService.getUserById with req.params.id", async () => {
      mockReq = { params: { id: "user123" } };
      const mockUser = { fullName: "Bob", email: "bob@example.com" };
      (AdminUserService.prototype.getUserById as jest.Mock).mockResolvedValue(mockUser);

      await controller.getUserById(mockReq as Request, mockRes as Response);

      expect(AdminUserService.prototype.getUserById).toHaveBeenCalledWith("user123");
      expect(ApiResponseHelper.success).toHaveBeenCalledWith(
        mockRes,
        mockUser,
        "User fetched successfully"
      );
    });

    it("should handle error if user is not found", async () => {
      mockReq = { params: { id: "nonexistent" } };
      const testError = { message: "User not found", status: 404 };
      (AdminUserService.prototype.getUserById as jest.Mock).mockRejectedValue(testError);

      await controller.getUserById(mockReq as Request, mockRes as Response);

      expect(ApiResponseHelper.error).toHaveBeenCalledWith(mockRes, "User not found", 404);
    });
  });

  describe("createUser", () => {
    it("should validate and create a user", async () => {
      const mockBody = {
        fullName: "Charlie",
        email: "charlie@example.com",
        password: "securepassword",
        role: "user",
      };
      mockReq = { body: mockBody };

      const mockCreatedUser = { _id: "newid", ...mockBody };
      (AdminUserService.prototype.createUser as jest.Mock).mockResolvedValue(mockCreatedUser);

      await controller.createUser(mockReq as Request, mockRes as Response);

      expect(AdminUserService.prototype.createUser).toHaveBeenCalledWith(expect.objectContaining({
        fullName: "Charlie",
        email: "charlie@example.com",
      }));
      expect(ApiResponseHelper.success).toHaveBeenCalledWith(
        mockRes,
        mockCreatedUser,
        "User created successfully",
        201
      );
    });

    it("should fail validation if email is invalid and return 400", async () => {
      mockReq = {
        body: {
          fullName: "Charlie",
          email: "invalid-email",
          password: "securepassword",
          role: "user",
        },
      };

      await controller.createUser(mockReq as Request, mockRes as Response);

      expect(AdminUserService.prototype.createUser).not.toHaveBeenCalled();
      expect(ApiResponseHelper.error).toHaveBeenCalledWith(
        mockRes,
        expect.any(String),
        400
      );
    });

    it("should fail validation if password is too short", async () => {
      mockReq = {
        body: {
          fullName: "Charlie",
          email: "charlie@example.com",
          password: "123",
          role: "user",
        },
      };

      await controller.createUser(mockReq as Request, mockRes as Response);

      expect(AdminUserService.prototype.createUser).not.toHaveBeenCalled();
      expect(ApiResponseHelper.error).toHaveBeenCalledWith(
        mockRes,
        expect.any(String),
        400
      );
    });
  });

  describe("updateUser", () => {
    it("should validate and update user properties", async () => {
      mockReq = {
        params: { id: "user123" },
        body: { fullName: "Bob Updated", role: "admin" },
      };

      const mockUpdatedUser = { _id: "user123", fullName: "Bob Updated", role: "admin" };
      (AdminUserService.prototype.updateUser as jest.Mock).mockResolvedValue(mockUpdatedUser);

      await controller.updateUser(mockReq as Request, mockRes as Response);

      expect(AdminUserService.prototype.updateUser).toHaveBeenCalledWith("user123", expect.objectContaining({
        fullName: "Bob Updated",
        role: "admin",
      }));
      expect(ApiResponseHelper.success).toHaveBeenCalledWith(
        mockRes,
        mockUpdatedUser,
        "User updated successfully"
      );
    });

    it("should fail validation for incorrect role option", async () => {
      mockReq = {
        params: { id: "user123" },
        body: { role: "superadmin" },
      };

      await controller.updateUser(mockReq as Request, mockRes as Response);

      expect(ApiResponseHelper.error).toHaveBeenCalledWith(
        mockRes,
        expect.any(String),
        400
      );
    });

    it("should handle service error and return 500", async () => {
      mockReq = {
        params: { id: "user123" },
        body: { fullName: "Bob Updated" },
      };
      const testError = { message: "Internal server error", status: 500 };
      (AdminUserService.prototype.updateUser as jest.Mock).mockRejectedValue(testError);

      await controller.updateUser(mockReq as Request, mockRes as Response);

      expect(ApiResponseHelper.error).toHaveBeenCalledWith(
        mockRes,
        "Internal server error",
        500
      );
    });
  });

  describe("deleteUser", () => {
    it("should call deleteUser in service with key id", async () => {
      mockReq = { params: { id: "user123" } };
      (AdminUserService.prototype.deleteUser as jest.Mock).mockResolvedValue(true);

      await controller.deleteUser(mockReq as Request, mockRes as Response);

      expect(AdminUserService.prototype.deleteUser).toHaveBeenCalledWith("user123");
      expect(ApiResponseHelper.success).toHaveBeenCalledWith(
        mockRes,
        null,
        "User deleted successfully"
      );
    });

    it("should return 404 error if service fails with not found", async () => {
      mockReq = { params: { id: "nonexistent" } };
      (AdminUserService.prototype.deleteUser as jest.Mock).mockRejectedValue({ message: "User not found", status: 404 });

      await controller.deleteUser(mockReq as Request, mockRes as Response);

      expect(ApiResponseHelper.error).toHaveBeenCalledWith(
        mockRes,
        "User not found",
        404
      );
    });
  });
});
