import { FeedbackModel, IFeedback } from "../models/feedback.model";

export interface IFeedbackRepository {
  create(feedback: Partial<IFeedback>): Promise<IFeedback>;
  getAll(): Promise<IFeedback[]>;
  getByUserId(userId: string): Promise<IFeedback[]>;
}

export class FeedbackMongoRepository implements IFeedbackRepository {
  async create(feedback: Partial<IFeedback>): Promise<IFeedback> {
    return await FeedbackModel.create(feedback);
  }

  async getAll(): Promise<IFeedback[]> {
    return await FeedbackModel.find().populate("user", "fullName email");
  }

  async getByUserId(userId: string): Promise<IFeedback[]> {
    return await FeedbackModel.find({ user: userId });
  }
}
