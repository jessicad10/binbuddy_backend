import { Request, Response } from "express";
import { FeedbackService } from "../services/feedback.service";
import { CreateFeedbackDTO } from "../dtos/feedback.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { z } from "zod";
import { IUser } from "../models/user.model";

const feedbackService = new FeedbackService();

export class FeedbackController {
  async submitFeedback(req: Request, res: Response) {
    try {
      const user = req.user as IUser;
      const parsedData = CreateFeedbackDTO.safeParse(req.body);

      if (!parsedData.success) {
        return ApiResponseHelper.error(
          res,
          z.prettifyError(parsedData.error),
          400
        );
      }

      const feedback = await feedbackService.createFeedback(
        user._id.toString(),
        parsedData.data
      );

      return ApiResponseHelper.success(
        res,
        feedback,
        "Feedback submitted successfully"
      );
    } catch (error: any) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500
      );
    }
  }

  async getFeedbacks(req: Request, res: Response) {
    try {
      const user = req.user as IUser;
      let feedbacks;

      if (user.role === "admin") {
        feedbacks = await feedbackService.getAllFeedbacks();
      } else {
        feedbacks = await feedbackService.getUserFeedbacks(user._id.toString());
      }

      return ApiResponseHelper.success(
        res,
        feedbacks,
        "Feedbacks fetched successfully"
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
