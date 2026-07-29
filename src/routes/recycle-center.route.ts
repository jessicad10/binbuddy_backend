import { Router } from "express";
import { RecycleCenterController } from "../controllers/recycle-center.controller";
import { authorizedMiddleware, adminMiddleware } from "../middlewares/authorized_middlewares";

const recycleCenterRouter = Router();
const centerController = new RecycleCenterController();

// Retrieve centers (filtering supported)
recycleCenterRouter.get(
  "/",
  authorizedMiddleware,
  centerController.getCenters.bind(centerController)
);

// Retrieve single center details
recycleCenterRouter.get(
  "/:id",
  authorizedMiddleware,
  centerController.getCenterById.bind(centerController)
);

// Admin-only creation
recycleCenterRouter.post(
  "/",
  authorizedMiddleware,
  adminMiddleware,
  centerController.createCenter.bind(centerController)
);

// Admin-only updates
recycleCenterRouter.put(
  "/:id",
  authorizedMiddleware,
  adminMiddleware,
  centerController.updateCenter.bind(centerController)
);

// Admin-only deletion
recycleCenterRouter.delete(
  "/:id",
  authorizedMiddleware,
  adminMiddleware,
  centerController.deleteCenter.bind(centerController)
);

export default recycleCenterRouter;
