import { UserService } from "../services/user.service";
import { z } from "zod";
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO, ChangePasswordDTO } from "../dtos/user.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { Request, Response } from "express";
import { IUser } from "../models/user.model";

const userService = new UserService();

export class UserController {

    async createUser(req: Request, res: Response) {
        try {
            const userData = CreateUserDTO.safeParse(req.body);

            if (!userData.success) {
                return ApiResponseHelper.error(
                    res,
                    z.prettifyError(userData.error),
                    400
                );
            }

            const user = await userService.createUser(userData.data);

            return ApiResponseHelper.success(
                res,
                user,
                "User created successfully"
            );

        } catch (error: any) {
            console.log("REGISTER ERROR:", error);

            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async loginUser(req: Request, res: Response) {

        console.log("==================================");
        console.log("LOGIN API HIT");
        console.log("REQUEST BODY:", req.body);
        console.log("==================================");

        try {
            const parsedData = LoginUserDTO.safeParse(req.body);

            if (!parsedData.success) {

                console.log("LOGIN VALIDATION FAILED");

                return ApiResponseHelper.error(
                    res,
                    z.prettifyError(parsedData.error),
                    400
                );
            }

            const { user, token } =
                await userService.loginUser(parsedData.data);

            console.log("LOGIN SUCCESS");
            console.log("USER:", user.email);
            console.log("TOKEN:", token);

            return ApiResponseHelper.success(
                res,
                {
                    user,
                    token,
                },
                "Login successful"
            );

        } catch (error: any) {

            console.log("LOGIN ERROR:", error.message);

            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async getProfile(req: Request, res: Response) {
        try {
            const user = req.user as IUser;
            const profile = await userService.getProfile(user._id.toString());

            return ApiResponseHelper.success(
                res,
                profile,
                "Profile fetched successfully"
            );
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async updateProfilePhoto(req: Request, res: Response) {
        try {
            if (!req.file) {
                return ApiResponseHelper.error(
                    res,
                    "Profile image is required",
                    400
                );
            }

            const user = req.user as IUser;
            const updatedUser = await userService.updateProfileImage(
                user._id.toString(),
                req.file.filename
            );

            return ApiResponseHelper.success(
                res,
                updatedUser,
                "Profile photo updated successfully"
            );
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async whoami(req: Request, res: Response) {
        try {
            const user = req.user as IUser;
            const profile = await userService.getProfile(user._id.toString());

            return ApiResponseHelper.success(
                res,
                profile,
                "User detail fetched successfully"
            );
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async updateProfile(req: Request, res: Response) {
        try {
            const user = req.user as IUser;
            const parsedData = UpdateUserDTO.safeParse(req.body);

            if (!parsedData.success) {
                return ApiResponseHelper.error(
                    res,
                    z.prettifyError(parsedData.error),
                    400
                );
            }

            const filename = req.file?.filename;
            const updatedUser = await userService.updateProfile(
                user._id.toString(),
                parsedData.data,
                filename
            );

            return ApiResponseHelper.success(
                res,
                updatedUser,
                "Profile updated successfully"
            );
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async changePassword(req: Request, res: Response) {
        try {
            const user = req.user as IUser;
            const parsedData = ChangePasswordDTO.safeParse(req.body);

            if (!parsedData.success) {
                return ApiResponseHelper.error(
                    res,
                    z.prettifyError(parsedData.error),
                    400
                );
            }

            const response = await userService.changePassword(
                user._id.toString(),
                parsedData.data.currentPassword,
                parsedData.data.newPassword
            );

            return ApiResponseHelper.success(res, response, "Password changed successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async forgotPassword(req: Request, res: Response) {
        try {
            const { email } = req.body;
            if (!email) {
                return ApiResponseHelper.error(res, "Email is required", 400);
            }

            const response = await userService.forgotPassword(email);
            return ApiResponseHelper.success(res, response, "Reset email sent successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async resetPassword(req: Request, res: Response) {
        try {
            const { token, password } = req.body;
            if (!token || !password) {
                return ApiResponseHelper.error(res, "Token and password are required", 400);
            }

            const response = await userService.resetPassword(token, password);
            return ApiResponseHelper.success(res, response, "Password reset successful");
        } catch (error: any) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }
}