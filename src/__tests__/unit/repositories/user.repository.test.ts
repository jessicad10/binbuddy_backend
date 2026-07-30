import { UserMongoRepository } from "../../../repositories/user.repository";
import { UserModel } from "../../../models/user.model";

jest.mock("../../../models/user.model");

describe("UserMongoRepository Unit Tests", () => {
  let repository: UserMongoRepository;

  beforeEach(() => {
    repository = new UserMongoRepository();
    jest.clearAllMocks();
  });

  describe("getUserById", () => {
    it("should call UserModel.findOne with _id query and return the user", async () => {
      const mockUser = { _id: "123", fullName: "Test User" };
      (UserModel.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await repository.getUserById("123");

      expect(UserModel.findOne).toHaveBeenCalledWith({ _id: "123" });
      expect(result).toEqual(mockUser);
    });

    it("should return null if user is not found by id", async () => {
      (UserModel.findOne as jest.Mock).mockResolvedValue(null);

      const result = await repository.getUserById("123");

      expect(UserModel.findOne).toHaveBeenCalledWith({ _id: "123" });
      expect(result).toBeNull();
    });
  });

  describe("getUserByEmail", () => {
    it("should call UserModel.findOne with email and return the user", async () => {
      const mockUser = { _id: "123", email: "test@example.com" };
      (UserModel.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await repository.getUserByEmail("test@example.com");

      expect(UserModel.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(result).toEqual(mockUser);
    });

    it("should return null if email is not found in database", async () => {
      (UserModel.findOne as jest.Mock).mockResolvedValue(null);

      const result = await repository.getUserByEmail("missing@test.com");

      expect(UserModel.findOne).toHaveBeenCalledWith({ email: "missing@test.com" });
      expect(result).toBeNull();
    });
  });

  describe("createUser", () => {
    it("should call UserModel.create and return the created user", async () => {
      const mockUserPayload = { fullName: "New User", email: "new@example.com" };
      const mockCreatedUser = { _id: "456", ...mockUserPayload };
      (UserModel.create as jest.Mock).mockResolvedValue(mockCreatedUser);

      const result = await repository.createUser(mockUserPayload);

      expect(UserModel.create).toHaveBeenCalledWith(mockUserPayload);
      expect(result).toEqual(mockCreatedUser);
    });
  });

  describe("update", () => {
    it("should call UserModel.findByIdAndUpdate with new: true and return updated user", async () => {
      const mockUpdate = { fullName: "Updated Name" };
      const mockUpdatedUser = { _id: "123", fullName: "Updated Name" };
      (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedUser);

      const result = await repository.update("123", mockUpdate);

      expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith("123", mockUpdate, { new: true });
      expect(result).toEqual(mockUpdatedUser);
    });

    it("should return null if user to update does not exist", async () => {
      (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      const result = await repository.update("123", { fullName: "Updated Name" });

      expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith("123", { fullName: "Updated Name" }, { new: true });
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("should call UserModel.findByIdAndDelete and return true if user was deleted", async () => {
      (UserModel.findByIdAndDelete as jest.Mock).mockResolvedValue({ _id: "123" });

      const result = await repository.delete("123");

      expect(UserModel.findByIdAndDelete).toHaveBeenCalledWith("123");
      expect(result).toBe(true);
    });

    it("should return false if user was not found or deleted", async () => {
      (UserModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      const result = await repository.delete("123");

      expect(UserModel.findByIdAndDelete).toHaveBeenCalledWith("123");
      expect(result).toBe(false);
    });
  });

  describe("getPaginatedUsers", () => {
    it("should return paginated list of users and total count without search query", async () => {
      const mockUsers = [{ fullName: "User 1" }, { fullName: "User 2" }];
      (UserModel.countDocuments as jest.Mock).mockResolvedValue(2);

      const mockFindChain = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockUsers),
      };
      (UserModel.find as jest.Mock).mockReturnValue(mockFindChain);

      const result = await repository.getPaginatedUsers(1, 10);

      expect(UserModel.countDocuments).toHaveBeenCalledWith({});
      expect(UserModel.find).toHaveBeenCalledWith({});
      expect(mockFindChain.skip).toHaveBeenCalledWith(0);
      expect(mockFindChain.limit).toHaveBeenCalledWith(10);
      expect(mockFindChain.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(result).toEqual({ users: mockUsers, total: 2 });
    });

    it("should return paginated list of users filtering by search query", async () => {
      const mockUsers = [{ fullName: "Search User" }];
      (UserModel.countDocuments as jest.Mock).mockResolvedValue(1);

      const mockFindChain = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockUsers),
      };
      (UserModel.find as jest.Mock).mockReturnValue(mockFindChain);

      const result = await repository.getPaginatedUsers(2, 5, "searchterm");

      const expectedQuery = {
        $or: [
          { fullName: expect.any(RegExp) },
          { email: expect.any(RegExp) },
        ],
      };

      expect(UserModel.countDocuments).toHaveBeenCalledWith(expectedQuery);
      expect(UserModel.find).toHaveBeenCalledWith(expectedQuery);
      expect(mockFindChain.skip).toHaveBeenCalledWith(5);
      expect(mockFindChain.limit).toHaveBeenCalledWith(5);
      expect(result).toEqual({ users: mockUsers, total: 1 });
    });
  });

  describe("Repository Error Handling & Edge Cases", () => {
    it("should return false if findOneAndUpdate returns null during update", async () => {
      (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);
      const result = await repository.update("invalid-id", { fullName: "Test" });
      expect(result).toBeNull();
    });

    it("should handle empty search term in getPaginatedUsers", async () => {
      (UserModel.countDocuments as jest.Mock).mockResolvedValue(0);
      const mockFindChain = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([]),
      };
      (UserModel.find as jest.Mock).mockReturnValue(mockFindChain);
      const result = await repository.getPaginatedUsers(1, 10, "");
      expect(UserModel.countDocuments).toHaveBeenCalledWith({});
      expect(result.users).toEqual([]);
    });

    it("should calculate correct skip offset for page 1", async () => {
      (UserModel.countDocuments as jest.Mock).mockResolvedValue(0);
      const mockFindChain = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([]),
      };
      (UserModel.find as jest.Mock).mockReturnValue(mockFindChain);
      await repository.getPaginatedUsers(1, 10);
      expect(mockFindChain.skip).toHaveBeenCalledWith(0);
    });

    it("should return false if findOneAndDelete returns null during delete", async () => {
      (UserModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);
      const result = await repository.delete("non-existent");
      expect(result).toBe(false);
    });
  });
});
