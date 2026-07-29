import { Request, Response } from "express";
import { NotificationService } from "../services/notification.service";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { IUser } from "../models/user.model";

const notificationService = new NotificationService();

export class NotificationController {
  async getNotifications(req: Request, res: Response) {
    try {
      const user = req.user as IUser;
      const notifs = await notificationService.getUserNotifications(user._id.toString());
      return ApiResponseHelper.success(res, notifs, "Notifications fetched successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const updated = await notificationService.markAsRead(id);
      return ApiResponseHelper.success(res, updated, "Notification marked as read");
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
    }
  }

  async markAllAsRead(req: Request, res: Response) {
    try {
      const user = req.user as IUser;
      await notificationService.markAllAsRead(user._id.toString());
      return ApiResponseHelper.success(res, null, "All notifications marked as read");
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
    }
  }

  async deleteNotification(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const deleted = await notificationService.deleteNotification(id);
      return ApiResponseHelper.success(res, deleted, "Notification deleted successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
    }
  }
}
