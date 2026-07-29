import { Request, Response } from "express";
import { PickupService } from "../services/pickup.service";
import { ApiResponseHelper } from "../utils/apihelper.util";

const pickupService = new PickupService();

export class PickupController {
  async createPickup(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?._id || (req.user as any)?.id;
      if (!userId) {
        return ApiResponseHelper.error(res, "Unauthorized request user not loaded", 401);
      }

      const result = await pickupService.createPickup(userId.toString(), req.body);
      return ApiResponseHelper.success(res, result, "Pickup request submitted successfully", 201);
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }

  async getPickups(req: Request, res: Response) {
    try {
      const result = await pickupService.getAllPickups();
      return ApiResponseHelper.success(res, result, "Pickup requests fetched successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { status } = req.body;

      if (!status) {
        return ApiResponseHelper.error(res, "Status value is required", 400);
      }

      const result = await pickupService.updatePickupStatus(id, status);
      return ApiResponseHelper.success(res, result, "Pickup status updated successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }
}
