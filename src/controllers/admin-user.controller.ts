import { Request, Response } from "express";
import { AdminUserService } from "../services/admin-user.service";
import { AdminCreateUserDTO, AdminUpdateUserDTO } from "../dtos/user.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { z } from "zod";

const adminUserService = new AdminUserService();

export class AdminUserController {
  async getUsers(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = req.query.search as string | undefined;

      const result = await adminUserService.getUsers(page, limit, search);

      return ApiResponseHelper.success(
        res,
        result.users,
        "Users fetched successfully",
        200,
        result.pagination
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const user = await adminUserService.getUserById(id);

      return ApiResponseHelper.success(
        res,
        user,
        "User fetched successfully"
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const validated = AdminCreateUserDTO.safeParse(req.body);

      if (!validated.success) {
        return ApiResponseHelper.error(
          res,
          z.prettifyError(validated.error),
          400
        );
      }

      const user = await adminUserService.createUser(validated.data);

      return ApiResponseHelper.success(
        res,
        user,
        "User created successfully",
        201
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const validated = AdminUpdateUserDTO.safeParse(req.body);

      if (!validated.success) {
        return ApiResponseHelper.error(
          res,
          z.prettifyError(validated.error),
          400
        );
      }

      const user = await adminUserService.updateUser(id, validated.data);

      return ApiResponseHelper.success(
        res,
        user,
        "User updated successfully"
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await adminUserService.deleteUser(id);

      return ApiResponseHelper.success(
        res,
        null,
        "User deleted successfully"
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }
}
