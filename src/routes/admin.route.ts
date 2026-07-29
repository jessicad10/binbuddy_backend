import { Router } from "express";
import { AdminUserController } from "../controllers/admin-user.controller";
import { authorizedMiddleware, adminMiddleware } from "../middlewares/authorized_middlewares";

const adminRouter = Router();
const adminController = new AdminUserController();

// Expose 5 core admin endpoints under the base path /api/v1/admin/users/
adminRouter.get(
  "/",
  authorizedMiddleware,
  adminMiddleware,
  adminController.getUsers.bind(adminController)
);

adminRouter.get(
  "/:id",
  authorizedMiddleware,
  adminMiddleware,
  adminController.getUserById.bind(adminController)
);

adminRouter.post(
  "/",
  authorizedMiddleware,
  adminMiddleware,
  adminController.createUser.bind(adminController)
);

adminRouter.put(
  "/:id",
  authorizedMiddleware,
  adminMiddleware,
  adminController.updateUser.bind(adminController)
);

adminRouter.patch(
  "/:id",
  authorizedMiddleware,
  adminMiddleware,
  adminController.updateUser.bind(adminController)
);

adminRouter.delete(
  "/:id",
  authorizedMiddleware,
  adminMiddleware,
  adminController.deleteUser.bind(adminController)
);

export default adminRouter;
