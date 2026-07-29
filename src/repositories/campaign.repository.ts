import { CampaignModel, ICampaign } from "../models/campaign.model";

export interface ICampaignRepository {
  create(campaign: Partial<ICampaign>): Promise<ICampaign>;
  getAll(): Promise<ICampaign[]>;
  getById(id: string): Promise<ICampaign | null>;
  update(id: string, updateData: Partial<ICampaign>): Promise<ICampaign | null>;
  delete(id: string): Promise<boolean>;
}

export class CampaignMongoRepository implements ICampaignRepository {
  async create(campaign: Partial<ICampaign>): Promise<ICampaign> {
    return await CampaignModel.create(campaign);
  }

  async getAll(): Promise<ICampaign[]> {
    return await CampaignModel.find().sort({ createdAt: -1 });
  }

  async getById(id: string): Promise<ICampaign | null> {
    return await CampaignModel.findById(id).populate({
      path: "interestedUsers.user",
      select: "fullName email contactNumber gender"
    });
  }

  async update(id: string, updateData: Partial<ICampaign>): Promise<ICampaign | null> {
    return await CampaignModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await CampaignModel.findByIdAndDelete(id);
    return !!result;
  }
}
