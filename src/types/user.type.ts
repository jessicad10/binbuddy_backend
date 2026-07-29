import { z } from "zod";

export const UserSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),

  email: z.email("Invalid email address"),

  contactNumber: z.string().optional(),

  gender: z.enum(["Male", "Female", "Other"]).optional(),

  password: z.string().min(
    6,
    "Password must be at least 6 characters long"
  ),

  role: z.enum(["admin", "user"]).default("user"),

  profileImage: z.string().optional(),
});

export type UserType = z.infer<typeof UserSchema>;