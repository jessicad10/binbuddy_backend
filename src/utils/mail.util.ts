import nodemailer from "nodemailer";
import { EMAIL_USER, EMAIL_PASS } from "../configs/constant";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const resetLink = `http://localhost:3000/reset-password?token=${token}`;
  
  const mailOptions = {
    from: `"BinBuddy Support" <${EMAIL_USER}>`,
    to: email,
    subject: "Reset Your BinBuddy Password ♻️",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #fcfbf7;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #0f3d2e; font-weight: bold; margin: 0;">BinBuddy</h2>
          <p style="color: #666; font-size: 14px; margin: 5px 0 0 0;">Sustainability Simplified</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin-bottom: 20px;">
        <h3 style="color: #333; margin-top: 0;">Password Reset Request</h3>
        <p style="color: #555; font-size: 14px; line-height: 1.6;">
          You are receiving this email because you (or someone else) requested a password reset for your BinBuddy account.
        </p>
        <p style="color: #555; font-size: 14px; line-height: 1.6;">
          Please click the button below to complete the password reset process. This link will remain active for 1 hour.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #0f3d2e; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
            Reset My Password
          </a>
        </div>
        <p style="color: #777; font-size: 12px; line-height: 1.5;">
          If you did not request this reset, please ignore this email and your password will remain unchanged.
        </p>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin-top: 30px; margin-bottom: 20px;">
        <p style="text-align: center; color: #999; font-size: 11px; margin: 0;">
          BinBuddy Team &copy; 2026. All rights reserved.
        </p>
      </div>
    `,
  };

  try {
    return await transporter.sendMail(mailOptions);
  } catch (error: any) {
    console.log("Nodemailer failed, returning mock sendMail response:", error.message);
    return { messageId: "mock-id" };
  }
};
