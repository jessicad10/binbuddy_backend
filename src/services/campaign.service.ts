import { CampaignMongoRepository } from "../repositories/campaign.repository";
import { CreateCampaignDTO } from "../dtos/campaign.dto";
import { ICampaign } from "../models/campaign.model";
import { HttpException } from "../exception/http-exception";
import { NotificationService } from "./notification.service";
import mongoose from "mongoose";

const campaignRepository = new CampaignMongoRepository();

const SEED_CAMPAIGNS = [
  {
    title: "Bagmati River Cleanliness Drive 🌊",
    description: "Join us for the weekly Bagmati Clean-up Campaign! We will gather near Thapathali bridge to extract non-biodegradable waste, sort plastics for recycling, and clean the riverbanks. Gloves, bags, and masks will be provided.",
    location: "Thapathali River Bank, Kathmandu",
    date: "2026-08-01",
    time: "07:00 AM - 10:00 AM",
    organizer: "BinBuddy Kathmandu & Bagmati Board",
  },
  {
    title: "Kirtipur Community Tree Plantation 🌱",
    description: "Help us restore green cover on the hills of Kirtipur. We are planting 500 native trees (Bar, Pipal, Sami, and Jacaranda) to fight soil erosion and enhance local biodiversity. Bring your family and tools if you have them!",
    location: "Kirtipur Hillside Park, Kathmandu Valley",
    date: "2026-08-08",
    time: "08:00 AM - 12:00 PM",
    organizer: "Green Kathmandu Initiative",
  },
  {
    title: "New Road E-Waste Collection Hub 🔋",
    description: "Got old mobile phones, dead chargers, broken laptops, or expired batteries? Drop them off at our collection hub in New Road. We will ensure all parts are certified and safely recycled without polluting soil.",
    location: "New Road Gateway, Kathmandu",
    date: "2026-08-15",
    time: "10:00 AM - 04:00 PM",
    organizer: "BinBuddy E-Recyclers",
  },
  {
    title: "Lalitpur Composting & Organic Waste Seminar 🍂",
    description: "Learn how to convert home food scraps into nutrient-rich compost. Our specialists will demonstrate Bokashi and aerobic bin techniques. Attendees will receive a free compost starter kit!",
    location: "Patan Durbar Square Community Hall, Lalitpur",
    date: "2026-08-22",
    time: "11:00 AM - 01:30 PM",
    organizer: "Lalitpur Municipality Eco-Unit",
  }
];

export class CampaignService {
  async getAllCampaigns(): Promise<ICampaign[]> {
    let campaigns = await campaignRepository.getAll();
    
    // Seed default campaigns if none exist
    if (campaigns.length === 0) {
      for (const item of SEED_CAMPAIGNS) {
        await campaignRepository.create(item);
      }
      campaigns = await campaignRepository.getAll();
    }
    
    return campaigns;
  }

  async getCampaignById(id: string): Promise<ICampaign> {
    const campaign = await campaignRepository.getById(id);
    if (!campaign) {
      throw new HttpException(404, "Campaign not found");
    }
    return campaign;
  }

  async createCampaign(campaignData: CreateCampaignDTO): Promise<ICampaign> {
    return await campaignRepository.create(campaignData);
  }

  async toggleInterest(campaignId: string, userId: string): Promise<ICampaign> {
    const campaign = await campaignRepository.getById(campaignId);
    if (!campaign) {
      throw new HttpException(404, "Campaign not found");
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const index = campaign.interestedUsers.findIndex((item: any) => item.user.toString() === userId);

    if (index === -1) {
      // Add interest with pending status
      campaign.interestedUsers.push({
        user: userObjectId,
        status: "pending"
      });
    } else {
      // Remove interest
      campaign.interestedUsers.splice(index, 1);
    }

    const updated = await campaignRepository.update(campaignId, {
      interestedUsers: campaign.interestedUsers
    });

    if (!updated) {
      throw new HttpException(500, "Failed to update interest status");
    }

    // Refresh to return populated interested users
    const populated = await campaignRepository.getById(campaignId);
    if (!populated) {
      throw new HttpException(404, "Campaign not found after updating");
    }
    return populated;
  }

  async getInterestedUsers(campaignId: string): Promise<any[]> {
    const campaign = await campaignRepository.getById(campaignId);
    if (!campaign) {
      throw new HttpException(404, "Campaign not found");
    }
    // Return array of populated user objects with their campaign status injected
    return campaign.interestedUsers.map((item: any) => {
      if (item.user && typeof item.user === "object") {
        return {
          ...item.user.toObject(),
          campaignStatus: item.status,
        };
      }
      return item;
    });
  }

  async updateRespondentStatus(
    campaignId: string,
    userId: string,
    status: "approved" | "denied"
  ): Promise<ICampaign> {
    const campaign = await campaignRepository.getById(campaignId);
    if (!campaign) {
      throw new HttpException(404, "Campaign not found");
    }

    const index = campaign.interestedUsers.findIndex(
      (item: any) => item.user._id.toString() === userId || item.user.toString() === userId
    );

    if (index === -1) {
      throw new HttpException(404, "Respondent not found in this campaign");
    }

    campaign.interestedUsers[index].status = status;

    const updated = await campaignRepository.update(campaignId, {
      interestedUsers: campaign.interestedUsers,
    });

    if (!updated) {
      throw new HttpException(500, "Failed to update respondent status");
    }

    // Trigger notification to the user
    const title = status === "approved"
      ? "Campaign Approved! 🎉"
      : "Campaign Request Denied 😔";
      
    const message = status === "approved"
      ? `Your interest in the campaign "${campaign.title}" has been approved by the administrator.`
      : `Your request to join "${campaign.title}" was denied.`;

    await NotificationService.createNotification(userId, title, message, "campaign");

    // Return updated campaign with populated fields
    const populated = await campaignRepository.getById(campaignId);
    if (!populated) {
      throw new HttpException(404, "Campaign not found after updating");
    }
    return populated;
  }
}
