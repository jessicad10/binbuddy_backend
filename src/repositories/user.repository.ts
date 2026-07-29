import { UserModel, IUser } from "../models/user.model";

export interface IUserRepository {
  getUserByEmail(email: string): Promise<IUser | null>;
  getUserByResetToken(token: string): Promise<IUser | null>;

  createUser(user: Partial<IUser>): Promise<IUser>;

  getUserById(id: string): Promise<IUser | null>;

  getAll(): Promise<IUser[]>;

  update(id: string, user: Partial<IUser>): Promise<IUser | null>;

  delete(id: string): Promise<boolean>;

  getPaginatedUsers(
    page: number,
    limit: number,
    search?: string
  ): Promise<{ users: IUser[]; total: number }>;
}

export class UserMongoRepository implements IUserRepository {
  async getPaginatedUsers(
    page: number,
    limit: number,
    search?: string
  ): Promise<{ users: IUser[]; total: number }> {
    const query: any = {};
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { fullName: searchRegex },
        { email: searchRegex }
      ];
    }

    const total = await UserModel.countDocuments(query);
    const users = await UserModel.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return { users, total };
  }

  async getUserById(id: string): Promise<IUser | null> {
    return await UserModel.findOne({ _id: id });
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email });
  }

  async getUserByResetToken(token: string): Promise<IUser | null> {
    return await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });
  }

  async createUser(user: Partial<IUser>): Promise<IUser> {
    return await UserModel.create(user);
  }

  async getAll(): Promise<IUser[]> {
    return await UserModel.find();
  }

  async update(
    id: string,
    user: Partial<IUser>
  ): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(
      id,
      user,
      { new: true }
    );
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await UserModel.findByIdAndDelete(id);
    return !!deleted;
  }
}