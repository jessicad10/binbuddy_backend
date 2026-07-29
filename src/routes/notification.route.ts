import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { authorizedMiddleware } from "../middlewares/authorized_middlewares";

const notificationRouter = Router();
const notificationController = new NotificationController();

notificationRouter.get(
  "/list",
  authorizedMiddleware,
  notificationController.getNotifications.bind(notificationController)
);

notificationRouter.patch(
  "/:id/read",
  authorizedMiddleware,
  notificationController.markAsRead.bind(notificationController)
);

notificationRouter.post(
  "/mark-all-read",
  authorizedMiddleware,
  notificationController.markAllAsRead.bind(notificationController)
);

notificationRouter.delete(
  "/:id",
  authorizedMiddleware,
  notificationController.deleteNotification.bind(notificationController)
);

export default notificationRouter;
