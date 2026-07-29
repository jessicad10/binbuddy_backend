import { Request, Response } from "express";
import { RecycleCenterService } from "../services/recycle-center.service";
import { ApiResponseHelper } from "../utils/apihelper.util";

const centerService = new RecycleCenterService();

export class RecycleCenterController {
  async createCenter(req: Request, res: Response) {
    try {
      const result = await centerService.createCenter(req.body);
      return ApiResponseHelper.success(res, result, "Recycling center created successfully", 201);
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }

  async getCenters(req: Request, res: Response) {
    try {
      const status = req.query.status as string;
      const filters: any = {};
      if (status) {
        filters.status = status;
      }
      const result = await centerService.getAllCenters(filters);
      return ApiResponseHelper.success(res, result, "Recycling centers fetched successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }

  async getCenterById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await centerService.getCenterById(id);
      return ApiResponseHelper.success(res, result, "Recycling center fetched successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }

  async updateCenter(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await centerService.updateCenter(id, req.body);
      return ApiResponseHelper.success(res, result, "Recycling center updated successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }

  async deleteCenter(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await centerService.deleteCenter(id);
      return ApiResponseHelper.success(res, null, "Recycling center deleted successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }
}
