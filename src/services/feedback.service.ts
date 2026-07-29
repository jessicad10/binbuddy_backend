import { FeedbackMongoRepository } from "../repositories/feedback.repository";
import { CreateFeedbackDTO } from "../dtos/feedback.dto";
import { IFeedback } from "../models/feedback.model";
import { HttpException } from "../exception/http-exception";

const feedbackRepository = new FeedbackMongoRepository();

export class FeedbackService {
  async createFeedback(userId: string, feedbackData: CreateFeedbackDTO): Promise<IFeedback> {
    const feedback = await feedbackRepository.create({
      user: userId as any,
      type: feedbackData.type,
      subject: feedbackData.subject,
      message: feedbackData.message,
    });

    if (!feedback) {
      throw new HttpException(500, "Failed to submit feedback");
    }

    return feedback;
  }

  async getAllFeedbacks(): Promise<IFeedback[]> {
    return await feedbackRepository.getAll();
  }

  async getUserFeedbacks(userId: string): Promise<IFeedback[]> {
    return await feedbackRepository.getByUserId(userId);
  }
}
