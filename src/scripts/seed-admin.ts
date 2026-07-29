import mongoose from "mongoose";
import { UserModel } from "../models/user.model";
import { RecycleCenterModel } from "../models/recycle-center.model";
import { MONGODB_URL } from "../configs/constant";
import bcryptjs from "bcryptjs";

async function run() {
  try {
    console.log("Connecting to MongoDB at:", MONGODB_URL);
    await mongoose.connect(MONGODB_URL);
    console.log("Connected successfully!");

    await UserModel.deleteMany({});
    console.log("Cleared existing users.");
    const users: any[] = [];

    let admin = users.find((u) => u.role === "admin");
    if (!admin) {
      console.log("No admin user found. Seeding an admin user...");
      const hashedPassword = await bcryptjs.hash("password123", 10);
      admin = await UserModel.create({
        fullName: "Admin User",
        email: "admin@binbuddy.com",
        password: hashedPassword,
        role: "admin",
        contactNumber: "1234567890",
        gender: "Other",
      });
      console.log("Admin user seeded successfully:", admin.email);
    } else {
      console.log("Admin user already exists:", admin.email);
    }

    let normalUser = users.find((u) => u.role === "user");
    if (!normalUser) {
      console.log("No standard user found. Seeding a standard user...");
      const hashedPassword = await bcryptjs.hash("password123", 10);
      normalUser = await UserModel.create({
        fullName: "Test User",
        email: "user@binbuddy.com",
        password: hashedPassword,
        role: "user",
        contactNumber: "0987654321",
        gender: "Male",
      });
      console.log("Standard user seeded successfully:", normalUser.email);
    } else {
      console.log("Standard user already exists:", normalUser.email);
    }

    const centersCount = await RecycleCenterModel.countDocuments();
    if (centersCount === 0) {
      console.log("No recycling centers found. Seeding default centers...");
      await RecycleCenterModel.create([
        {
          name: "Kathmandu Recycling Hub",
          city: "Kathmandu",
          address: "Chabahil, Kathmandu",
          phone: "9801234567",
          email: "chabahil@binbuddy.com",
          hours: "8:00 AM - 6:00 PM",
          acceptedWaste: ["Plastic", "Paper", "Metal", "E-Waste"],
          description: "A leading waste processing facility in Kathmandu focused on circular recycling of household electronics and plastics.",
          status: "active"
        },
        {
          name: "Lalitpur Green Station",
          city: "Lalitpur",
          address: "Pulchowk, Lalitpur",
          phone: "9812345678",
          email: "pulchowk@binbuddy.com",
          hours: "9:00 AM - 5:00 PM",
          acceptedWaste: ["Paper", "Cardboard", "Glass", "Batteries"],
          description: "Community-driven recycling center centered around organic materials, glass, and household batteries.",
          status: "active"
        },
        {
          name: "Kapan Eco Center",
          city: "Kathmandu",
          address: "Kapan, Kathmandu",
          phone: "9845678901",
          email: "kapan@binbuddy.com",
          hours: "7:00 AM - 7:00 PM",
          acceptedWaste: ["Plastic", "Cardboard", "Metal"],
          description: "Reliable neighborhood collection center offering quick turnarounds and high sorting efficiency.",
          status: "active"
        },
        {
          name: "Bhaktapur Resource Recovery",
          city: "Bhaktapur",
          address: "Suryabinayak, Bhaktapur",
          phone: "9867890123",
          email: "bhaktapur@binbuddy.com",
          hours: "8:30 AM - 5:30 PM",
          acceptedWaste: ["Plastic", "Paper", "Glass", "Metal", "E-Waste", "Batteries"],
          description: "Comprehensive reclamation plant servicing Bhaktapur municipality with sorting lines and industrial recyclers.",
          status: "active"
        }
      ]);
      console.log("Seeded default recycling centers successfully!");
    } else {
      console.log("Recycling centers already exist inside database.");
    }

  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

run();
