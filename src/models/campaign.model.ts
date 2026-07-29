import mongoose, { Schema, Document } from "mongoose";

export interface ICampaignRespondent {
  user: mongoose.Types.ObjectId;
  status: "pending" | "approved" | "denied";
}

export interface ICampaign extends Document {
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  organizer: string;
  interestedUsers: ICampaignRespondent[];
  createdAt: Date;
  updatedAt: Date;
}

const CampaignRespondentSchema = new Schema<ICampaignRespondent>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "denied"],
      default: "pending",
      required: true,
    },
  },
  { _id: false }
);

const CampaignSchema = new Schema<ICampaign>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    organizer: {
      type: String,
      required: true,
      default: "BinBuddy Team",
    },
    interestedUsers: [CampaignRespondentSchema],
  },
  {
    timestamps: true,
  }
);

export const CampaignModel = mongoose.model<ICampaign>("Campaign", CampaignSchema);
