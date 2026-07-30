import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../../configs/constant";

jest.mock("../../models/user.model");
jest.mock("../../utils/mail.util", () => ({
  sendResetPasswordEmail: jest.fn().mockResolvedValue({ messageId: "mock-id" }),
}));

describe("Auth Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockUser = (id: string, email: string, role: string, fullName: string) => ({
    _id: id,
    email: email,
    role: role,
    fullName: fullName,
    password: "hashedpassword",
    toObject: function () {
      return {
        _id: this._id,
        email: this.email,
        role: this.role,
        fullName: this.fullName,
      };
    },
  });

  describe("POST /api/v1/auth/register", () => {
    it("should successfully register a new user", async () => {
      (UserModel.findOne as jest.Mock).mockResolvedValue(null);
      const mockUser = createMockUser("user-1", "jessica@example.com", "user", "Jessica Dhamala");
      (UserModel.create as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          fullName: "Jessica Dhamala",
          username: "jessica",
          email: "jessica@example.com",
          password: "password123",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("User created successfully");
    });

    it("should fail if email already exists", async () => {
      const mockUser = createMockUser("existing-id", "jessica@example.com", "user", "Existing User");
      (UserModel.findOne as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          fullName: "Jessica Dhamala",
          username: "jessica",
          email: "jessica@example.com",
          password: "password123",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Email already exists");
    });

    it("should fail if email format is invalid", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          fullName: "Jessica Dhamala",
          username: "jessica",
          email: "invalid-email",
          password: "password123",
        });

      expect(res.status).toBe(400);
    });

    it("should fail if required fields are missing", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          fullName: "Jessica Dhamala",
          email: "jessica@example.com",
        });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("should successfully log in admin user", async () => {
      const mockAdmin = createMockUser("admin-1", "admin@binbuddy.com", "admin", "Admin User");
      (UserModel.findOne as jest.Mock).mockResolvedValue(mockAdmin);
      jest.spyOn(require("bcryptjs"), "compare").mockResolvedValue(true);

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "admin@binbuddy.com",
          password: "password123",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe("admin");
    });

    it("should successfully log in standard user", async () => {
      const mockUser = createMockUser("user-2", "user@example.com", "user", "Standard User");
      (UserModel.findOne as jest.Mock).mockResolvedValue(mockUser);
      jest.spyOn(require("bcryptjs"), "compare").mockResolvedValue(true);

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "user@example.com",
          password: "password123",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe("user");
    });

    it("should fail if user email does not exist", async () => {
      (UserModel.findOne as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "password123",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid email");
    });

    it("should fail if password does not match", async () => {
      const mockUser = createMockUser("user-2", "user@example.com", "user", "Standard User");
      (UserModel.findOne as jest.Mock).mockResolvedValue(mockUser);
      jest.spyOn(require("bcryptjs"), "compare").mockResolvedValue(false);

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "user@example.com",
          password: "wrongpassword",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid password");
    });
  });

  describe("GET /api/v1/auth/whoami", () => {
    it("should authorize request and return user profile", async () => {
      const mockUser = createMockUser("user-1", "user@example.com", "user", "Test User");
      (UserModel.findOne as jest.Mock).mockResolvedValue(mockUser);
      const token = jwt.sign({ id: "user-1", email: "user@example.com" }, SECRET_KEY);

      const res = await request(app)
        .get("/api/v1/auth/whoami")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.fullName).toBe("Test User");
    });

    it("should fail if authorization token is missing", async () => {
      const res = await request(app)
        .get("/api/v1/auth/whoami");

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/v1/auth/forgot-password", () => {
    it("should initiate forgot password request successfully", async () => {
      const mockUser = createMockUser("user-1", "user@example.com", "user", "Test User");
      (UserModel.findOne as jest.Mock).mockResolvedValue(mockUser);
      (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email: "user@example.com" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should fail if no account with that email exists", async () => {
      (UserModel.findOne as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email: "unregistered@example.com" });

      expect(res.status).toBe(404);
    });
  });
});
