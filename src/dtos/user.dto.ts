import { z } from "zod";
import { UserSchema } from "../types/user.type";

// Create User DTO
export const CreateUserDTO = UserSchema.pick({
  fullName: true,
  email: true,
  contactNumber: true,
  gender: true,
  password: true,
});

export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

// Login DTO
export const LoginUserDTO = UserSchema.pick({
  email: true,
  password: true,
});

export type LoginUserDTO = z.infer<typeof LoginUserDTO>;

// Update User DTO
export const UpdateUserDTO = z.object({
  fullName: z.string().min(1, "Full name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  contactNumber: z.string().optional().nullable(),
  gender: z.enum(["Male", "Female", "Other"]).optional().nullable(),
  password: z.string().min(6, "Password must be at least 6 characters long").optional().or(z.literal("")),
});

export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;

// Admin Create User DTO
export const AdminCreateUserDTO = UserSchema.pick({
  fullName: true,
  email: true,
  contactNumber: true,
  gender: true,
  password: true,
  role: true,
});

export type AdminCreateUserDTO = z.infer<typeof AdminCreateUserDTO>;

// Admin Update User DTO
export const AdminUpdateUserDTO = z.object({
  fullName: z.string().min(1, "Full name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  contactNumber: z.string().optional().nullable(),
  gender: z.enum(["Male", "Female", "Other"]).optional().nullable(),
  password: z.string().min(6, "Password must be at least 6 characters long").optional().or(z.literal("")),
  role: z.enum(["admin", "user"]).optional(),
});

export type AdminUpdateUserDTO = z.infer<typeof AdminUpdateUserDTO>;

export const ChangePasswordDTO = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters long"),
});

export type ChangePasswordDTO = z.infer<typeof ChangePasswordDTO>;