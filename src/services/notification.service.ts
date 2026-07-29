import { NotificationMongoRepository } from "../repositories/notification.repository";
import { INotification } from "../models/notification.model";
import { HttpException } from "../exception/http-exception";

const notificationRepository = new NotificationMongoRepository();

export class NotificationService {
  static async createNotification(
    userId: string,
    title: string,
    message: string,
    category: "blog" | "tip" | "milestone" | "password" | "campaign"
  ): Promise<INotification> {
    return await notificationRepository.create({
      user: userId as any,
      title,
      message,
      category,
      read: false,
    });
  }

  async getUserNotifications(userId: string): Promise<INotification[]> {
    let list = await notificationRepository.getByUserId(userId);
    
    // Seed initial notifications for demonstration if empty
    if (list.length === 0) {
      await notificationRepository.create({
        user: userId as any,
        title: "Welcome to BinBuddy! 🎉",
        message: "Your eco-account is active. Start using Smart Sort to classify waste and earn points!",
        category: "milestone",
        read: false,
      });
      await notificationRepository.create({
        user: userId as any,
        title: "New Blog Added 📚",
        message: "A new blog post, 'Composting 101: Turn Your Kitchen Scraps Into Black Gold,' has been added! Explore how you can fertilize naturally.",
        category: "blog",
        read: false,
      });
      await notificationRepository.create({
        user: userId as any,
        title: "New Sustainability Guide 💡",
        message: "A new tip 'Decode the Plastic Numbers on Packaging' was added to the Sort Smart guides directory. Check it out!",
        category: "tip",
        read: false,
      });
      list = await notificationRepository.getByUserId(userId);
    }
    
    return list;
  }

  async markAsRead(id: string): Promise<INotification> {
    const updated = await notificationRepository.markAsRead(id);
    if (!updated) {
      throw new HttpException(404, "Notification not found");
    }
    return updated;
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    return await notificationRepository.markAllAsRead(userId);
  }

  async deleteNotification(id: string): Promise<boolean> {
    return await notificationRepository.delete(id);
  }
}
