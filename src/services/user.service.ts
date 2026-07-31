import { UserMongoRepository } from "../repositories/user.repository";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { IUser } from "../models/user.model";
import { HttpException } from "../exception/http-exception";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../configs/constant";
import fs from "fs";
import path from "path";
import { sanitizeUser } from "../utils/user.util";
import { v4 as uuidv4 } from "uuid";
import { sendResetPasswordEmail } from "../utils/mail.util";

const userRepository = new UserMongoRepository();

export class UserService {
  async createUser(userData: CreateUserDTO) {
    // Check existing email
    const existingEmail = await userRepository.getUserByEmail(
      userData.email
    );

    if (existingEmail) {
      throw new HttpException(400, "Email already exists");
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(
      userData.password,
      10
    );

    userData.password = hashedPassword;

    const user = await userRepository.createUser(userData);

    return sanitizeUser(user);
  }

  async loginUser(loginData: LoginUserDTO) {
    const user = await userRepository.getUserByEmail(
      loginData.email
    );

    if (!user) {
      throw new HttpException(400, "Invalid email");
    }

    const isPasswordValid = await bcryptjs.compare(
      loginData.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new HttpException(400, "Invalid password");
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      SECRET_KEY,
      {
        expiresIn: "30d",
      }
    );

    return {
      user: sanitizeUser(user),
      token,
    };
  }

  async getProfile(userId: string) {
    const user = await userRepository.getUserById(userId);

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    return sanitizeUser(user);
  }

  async updateProfileImage(userId: string, filename: string) {
    const user = await userRepository.getUserById(userId);

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    if (user.profileImage) {
      const oldImagePath = path.join(
        process.cwd(),
        user.profileImage.replace(/^\//, "")
      );

      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    const profileImage = `/uploads/profile/${filename}`;
    const updatedUser = await userRepository.update(userId, { profileImage });

    if (!updatedUser) {
      throw new HttpException(500, "Failed to update profile photo");
    }

    return sanitizeUser(updatedUser);
  }

  async updateProfile(userId: string, updateData: any, filename?: string) {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    const dataToUpdate: any = {};

    if (updateData.fullName !== undefined) {
      dataToUpdate.fullName = updateData.fullName;
    }
    if (updateData.email !== undefined && updateData.email !== user.email) {
      const existingEmail = await userRepository.getUserByEmail(updateData.email);
      if (existingEmail) {
        throw new HttpException(400, "Email already in use");
      }
      dataToUpdate.email = updateData.email;
    }
    if (updateData.contactNumber !== undefined) {
      dataToUpdate.contactNumber = updateData.contactNumber || null;
    }
    if (updateData.gender !== undefined) {
      dataToUpdate.gender = updateData.gender || null;
    }
    if (updateData.password !== undefined && updateData.password.trim() !== "") {
      const hashedPassword = await bcryptjs.hash(updateData.password, 10);
      dataToUpdate.password = hashedPassword;
    }

    if (filename) {
      if (user.profileImage) {
        const oldImagePath = path.join(
          process.cwd(),
          user.profileImage.replace(/^\//, "")
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      dataToUpdate.profileImage = `/uploads/profile/${filename}`;
    }

    const updatedUser = await userRepository.update(userId, dataToUpdate);
    if (!updatedUser) {
      throw new HttpException(500, "Failed to update profile");
    }

    return sanitizeUser(updatedUser);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    const isCurrentPasswordValid = await bcryptjs.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new HttpException(400, "Current password is incorrect");
    }

    const hashedNewPassword = await bcryptjs.hash(newPassword, 10);
    await userRepository.update(userId, { password: hashedNewPassword });

    return { message: "Password changed successfully" };
  }

  async forgotPassword(email: string) {
    const user = await userRepository.getUserByEmail(email);
    if (!user) {
      throw new HttpException(404, "No account with that email exists");
    }

    const token = uuidv4();
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    await userRepository.update(user._id.toString(), {
      resetPasswordToken: token,
      resetPasswordExpires: expiry,
    });

    await sendResetPasswordEmail(email, token);
    return { message: "Reset link sent to your email" };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await userRepository.getUserByResetToken(token);
    if (!user) {
      throw new HttpException(400, "Password reset token is invalid or has expired");
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    await userRepository.update(user._id.toString(), {
      password: hashedPassword,
      resetPasswordToken: null as any,
      resetPasswordExpires: null as any,
    });

    return { message: "Password updated successfully" };
  }
}