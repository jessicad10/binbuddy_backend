import { PickupMongoRepository } from "../repositories/pickup.repository";
import { IPickup } from "../models/pickup.model";
import { HttpException } from "../exception/http-exception";
import { NotificationMongoRepository } from "../repositories/notification.repository";

const pickupRepository = new PickupMongoRepository();
const notificationRepository = new NotificationMongoRepository();

export class PickupService {
  async createPickup(userId: string, pickupData: any): Promise<IPickup> {
    const { fullName, email, phone, pickupAddress, centerName, wasteType, quantity, preferredDate, notes } = pickupData;

    if (!fullName || !email || !phone || !pickupAddress || !centerName || !wasteType || !quantity || !preferredDate) {
      throw new HttpException(400, "Required fields are missing");
    }

    const payload = {
      user: userId as any,
      fullName,
      email,
      phone,
      pickupAddress,
      centerName,
      wasteType,
      quantity,
      preferredDate,
      notes,
      status: "pending" as const
    };

    return await pickupRepository.create(payload);
  }

  async getAllPickups(): Promise<IPickup[]> {
    return await pickupRepository.getAll();
  }

  async updatePickupStatus(id: string, status: string): Promise<IPickup> {
    const validStatuses = ["pending", "approved", "scheduled", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      throw new HttpException(400, "Invalid status value");
    }

    const pickup = await pickupRepository.getById(id);
    if (!pickup) {
      throw new HttpException(404, "Pickup request not found");
    }

    const updated = await pickupRepository.updateStatus(id, status);
    if (!updated) {
      throw new HttpException(500, "Failed to update pickup status");
    }

    // Create a status notification for the user
    try {
      const targetUserId = (pickup.user as any)?._id || pickup.user;
      if (targetUserId) {
        await notificationRepository.create({
          user: targetUserId,
          title: status === "approved" ? "Pickup Request Approved" : "Pickup Status Updated",
          message: status === "approved"
            ? `Good news! Your pickup request for ${pickup.wasteType} (${pickup.quantity}) at ${pickup.centerName} has been approved.`
            : `Your pickup request for ${pickup.wasteType} at ${pickup.centerName} has been updated to "${status.toUpperCase()}".`,
          category: "milestone", // Displays green recycle milestone icon on frontend
          read: false
        });
      }
    } catch (notifError) {
      console.error("Failed to create pickup status notification", notifError);
    }

    return updated;
  }
}
