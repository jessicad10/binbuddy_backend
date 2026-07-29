import { PickupModel, IPickup } from "../models/pickup.model";

export class PickupMongoRepository {
  async create(pickupData: Partial<IPickup>): Promise<IPickup> {
    return await PickupModel.create(pickupData);
  }

  async getAll(): Promise<IPickup[]> {
    return await PickupModel.find()
      .populate("user", "fullName email contactNumber")
      .sort({ createdAt: -1 });
  }

  async getById(id: string): Promise<IPickup | null> {
    return await PickupModel.findById(id).populate("user", "fullName email");
  }

  async updateStatus(id: string, status: string): Promise<IPickup | null> {
    return await PickupModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
  }
}
