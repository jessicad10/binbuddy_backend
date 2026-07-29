import mongoose, { Schema, Document } from "mongoose";

export interface IPickup extends Document {
  user: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  phone: string;
  pickupAddress: string;
  centerName: string;
  wasteType: string;
  quantity: string;
  preferredDate: string;
  notes?: string;
  status: "pending" | "approved" | "scheduled" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const PickupSchema = new Schema<IPickup>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    pickupAddress: {
      type: String,
      required: true,
    },
    centerName: {
      type: String,
      required: true,
    },
    wasteType: {
      type: String,
      required: true,
    },
    quantity: {
      type: String,
      required: true,
    },
    preferredDate: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "scheduled", "completed", "cancelled"],
      default: "pending",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const PickupModel = mongoose.model<IPickup>("Pickup", PickupSchema);
