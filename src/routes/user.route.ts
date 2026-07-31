import { UserController } from "../controllers/user.controller";
import { Router } from "express";
import { authorizedMiddleware } from "../middlewares/authorized_middlewares";
import { uploadProfileImage } from "../middlewares/upload_middleware";

const userRouter = Router();
const userController = new UserController();

userRouter.post("/register", userController.createUser.bind(userController));
userRouter.post("/login", userController.loginUser.bind(userController));
userRouter.post("/forgot-password", userController.forgotPassword.bind(userController));
userRouter.post("/reset-password", userController.resetPassword.bind(userController));
userRouter.get(
    "/profile",
    authorizedMiddleware,
    userController.getProfile.bind(userController)
);
userRouter.patch(
    "/profile/photo",
    authorizedMiddleware,
    uploadProfileImage.single("profileImage"),
    userController.updateProfilePhoto.bind(userController)
);
userRouter.patch(
    "/change-password",
    authorizedMiddleware,
    userController.changePassword.bind(userController)
);
userRouter.get(
    "/whoami",
    authorizedMiddleware,
    userController.whoami.bind(userController)
);
userRouter.patch(
    "/update",
    authorizedMiddleware,
    uploadProfileImage.single("profileImage"),
    userController.updateProfile.bind(userController)
);
userRouter.put(
    "/update",
    authorizedMiddleware,
    uploadProfileImage.single("profileImage"),
    userController.updateProfile.bind(userController)
);

export default userRouter;
