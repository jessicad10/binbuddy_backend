import { z } from "zod";

export const CreateFeedbackDTO = z.object({
  type: z.enum(["website", "waste-management", "general", "praise"]),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type CreateFeedbackDTO = z.infer<typeof CreateFeedbackDTO>;
