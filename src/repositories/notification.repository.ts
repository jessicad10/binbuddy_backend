import { NotificationModel, INotification } from "../models/notification.model";

export interface INotificationRepository {
  create(notif: Partial<INotification>): Promise<INotification>;
  getByUserId(userId: string): Promise<INotification[]>;
  markAsRead(id: string): Promise<INotification | null>;
  markAllAsRead(userId: string): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}

export class NotificationMongoRepository implements INotificationRepository {
  async create(notif: Partial<INotification>): Promise<INotification> {
    return await NotificationModel.create(notif);
  }

  async getByUserId(userId: string): Promise<INotification[]> {
    return await NotificationModel.find({ user: userId }).sort({ createdAt: -1 });
  }

  async markAsRead(id: string): Promise<INotification | null> {
    return await NotificationModel.findByIdAndUpdate(id, { read: true }, { new: true });
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    const result = await NotificationModel.updateMany({ user: userId, read: false }, { read: true });
    return !!result;
  }

  async delete(id: string): Promise<boolean> {
    const result = await NotificationModel.findByIdAndDelete(id);
    return !!result;
  }
}
