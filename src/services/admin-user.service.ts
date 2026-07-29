import { UserMongoRepository } from "../repositories/user.repository";
import { AdminCreateUserDTO, AdminUpdateUserDTO } from "../dtos/user.dto";
import { HttpException } from "../exception/http-exception";
import bcryptjs from "bcryptjs";
import { sanitizeUser } from "../utils/user.util";
import { FeedbackModel } from "../models/feedback.model";
import { NotificationModel } from "../models/notification.model";
import { CampaignModel } from "../models/campaign.model";

const userRepository = new UserMongoRepository();

export class AdminUserService {
  async getUsers(page: number, limit: number, search?: string) {
    const { users, total } = await userRepository.getPaginatedUsers(
      page,
      limit,
      search
    );

    const sanitizedUsers = users.map((user) => sanitizeUser(user));
    const totalPages = Math.ceil(total / limit);

    return {
      users: sanitizedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getUserById(id: string) {
    const user = await userRepository.getUserById(id);
    if (!user) {
      throw new HttpException(404, "User not found");
    }
    return sanitizeUser(user);
  }

  async createUser(userData: AdminCreateUserDTO) {
    const existingEmail = await userRepository.getUserByEmail(userData.email);
    if (existingEmail) {
      throw new HttpException(400, "Email already exists");
    }

    const hashedPassword = await bcryptjs.hash(userData.password, 10);
    const userPayload = {
      ...userData,
      password: hashedPassword,
    };

    const user = await userRepository.createUser(userPayload);
    return sanitizeUser(user);
  }

  async updateUser(id: string, updateData: AdminUpdateUserDTO) {
    const user = await userRepository.getUserById(id);
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

    if (updateData.role !== undefined) {
      dataToUpdate.role = updateData.role;
    }

    const updatedUser = await userRepository.update(id, dataToUpdate);
    if (!updatedUser) {
      throw new HttpException(500, "Failed to update user");
    }

    return sanitizeUser(updatedUser);
  }

  async deleteUser(id: string) {
    const user = await userRepository.getUserById(id);
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    // Cascade deletes / cleaning up references
    await FeedbackModel.deleteMany({ user: id });
    await NotificationModel.deleteMany({ user: id });
    await CampaignModel.updateMany({}, { $pull: { interestedUsers: { user: id } } } as any);

    const success = await userRepository.delete(id);
    if (!success) {
      throw new HttpException(500, "Failed to delete user");
    }

    return true;
  }
}
