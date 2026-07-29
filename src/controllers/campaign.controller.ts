import { Request, Response } from "express";
import { CampaignService } from "../services/campaign.service";
import { CreateCampaignDTO } from "../dtos/campaign.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { z } from "zod";
import { IUser } from "../models/user.model";

const campaignService = new CampaignService();

export class CampaignController {
  async getCampaigns(req: Request, res: Response) {
    try {
      const campaigns = await campaignService.getAllCampaigns();
      return ApiResponseHelper.success(res, campaigns, "Campaigns fetched successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
    }
  }

  async createCampaign(req: Request, res: Response) {
    try {
      const user = req.user as IUser;
      if (user.role !== "admin") {
        return ApiResponseHelper.error(res, "Forbidden: Only system admins can create campaigns", 403);
      }

      const parsedData = CreateCampaignDTO.safeParse(req.body);
      if (!parsedData.success) {
        return ApiResponseHelper.error(res, z.prettifyError(parsedData.error), 400);
      }

      const campaign = await campaignService.createCampaign(parsedData.data);
      return ApiResponseHelper.success(res, campaign, "Campaign created successfully", 201);
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
    }
  }

  async toggleInterest(req: Request, res: Response) {
    try {
      const user = req.user as IUser;
      const id = req.params.id as string;

      const campaign = await campaignService.toggleInterest(id, user._id.toString());
      return ApiResponseHelper.success(res, campaign, "Interest status toggled successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
    }
  }

  async getInterestedUsers(req: Request, res: Response) {
    try {
      const user = req.user as IUser;
      if (user.role !== "admin") {
        return ApiResponseHelper.error(res, "Forbidden: Only admins can view respondent lists", 403);
      }

      const id = req.params.id as string;
      const users = await campaignService.getInterestedUsers(id);
      return ApiResponseHelper.success(res, users, "Respondent list fetched successfully");
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
    }
  }

  async updateRespondentStatus(req: Request, res: Response) {
    try {
      const user = req.user as IUser;
      if (user.role !== "admin") {
        return ApiResponseHelper.error(res, "Forbidden: Only admins can manage respondent statuses", 403);
      }

      const campaignId = req.params.id as string;
      const { userId, status } = req.body;

      if (!userId || !status || (status !== "approved" && status !== "denied")) {
        return ApiResponseHelper.error(
          res,
          "Invalid body parameters: userId and status (approved/denied) are required",
          400
        );
      }

      const campaign = await campaignService.updateRespondentStatus(campaignId, userId, status);
      return ApiResponseHelper.success(res, campaign, `Respondent status updated to ${status}`);
    } catch (error: any) {
      return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
    }
  }
}
