import mongoose, { Schema, Document } from "mongoose";

export interface IRecycleCenter extends Document {
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  acceptedWaste: string[];
  description: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const RecycleCenterSchema = new Schema<IRecycleCenter>(
  {
    name: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    hours: {
      type: String,
      required: true,
    },
    acceptedWaste: {
      type: [String],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const RecycleCenterModel = mongoose.model<IRecycleCenter>(
  "RecycleCenter",
  RecycleCenterSchema
);
