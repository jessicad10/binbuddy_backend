import { Router } from "express";
import { CampaignController } from "../controllers/campaign.controller";
import { authorizedMiddleware } from "../middlewares/authorized_middlewares";

const campaignRouter = Router();
const campaignController = new CampaignController();

campaignRouter.get(
  "/list",
  authorizedMiddleware,
  campaignController.getCampaigns.bind(campaignController)
);

campaignRouter.post(
  "/create",
  authorizedMiddleware,
  campaignController.createCampaign.bind(campaignController)
);

campaignRouter.post(
  "/:id/toggle-interest",
  authorizedMiddleware,
  campaignController.toggleInterest.bind(campaignController)
);

campaignRouter.get(
  "/:id/interested-users",
  authorizedMiddleware,
  campaignController.getInterestedUsers.bind(campaignController)
);

campaignRouter.post(
  "/:id/respondent-status",
  authorizedMiddleware,
  campaignController.updateRespondentStatus.bind(campaignController)
);

export default campaignRouter;
