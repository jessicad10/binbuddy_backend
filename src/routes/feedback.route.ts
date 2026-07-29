import { Router } from "express";
import { FeedbackController } from "../controllers/feedback.controller";
import { authorizedMiddleware } from "../middlewares/authorized_middlewares";

const feedbackRouter = Router();
const feedbackController = new FeedbackController();

feedbackRouter.post(
  "/submit",
  authorizedMiddleware,
  feedbackController.submitFeedback.bind(feedbackController)
);

feedbackRouter.get(
  "/list",
  authorizedMiddleware,
  feedbackController.getFeedbacks.bind(feedbackController)
);

export default feedbackRouter;
