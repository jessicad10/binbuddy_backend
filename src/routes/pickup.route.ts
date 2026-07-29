import { Router } from "express";
import { PickupController } from "../controllers/pickup.controller";
import { authorizedMiddleware, adminMiddleware } from "../middlewares/authorized_middlewares";

const pickupRouter = Router();
const pickupController = new PickupController();

// Citizens create pickup request
pickupRouter.post(
  "/",
  authorizedMiddleware,
  pickupController.createPickup.bind(pickupController)
);

// Admin view all pickup requests
pickupRouter.get(
  "/",
  authorizedMiddleware,
  adminMiddleware,
  pickupController.getPickups.bind(pickupController)
);

// Admin update status of a request
pickupRouter.patch(
  "/:id/status",
  authorizedMiddleware,
  adminMiddleware,
  pickupController.updateStatus.bind(pickupController)
);

export default pickupRouter;
