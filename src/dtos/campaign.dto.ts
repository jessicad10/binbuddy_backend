import { z } from "zod";

export const CreateCampaignDTO = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  location: z.string().min(3, "Location must be at least 3 characters long"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  organizer: z.string().optional(),
});

export type CreateCampaignDTO = z.infer<typeof CreateCampaignDTO>;
