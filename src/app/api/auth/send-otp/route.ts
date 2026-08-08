import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

import { apiError, readJson } from "@/lib/api";
import { storeOtp } from "@/lib/otp-store";

export async function POST(request: Request) {
  try {
    const { email } = (await readJson(request)) as { email?: string };

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Generate secure 4-digit OTP
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    storeOtp(normalizedEmail, otpCode);

    const hasRealSmtp = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
    let isEmailSent = false;

    if (hasRealSmtp) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: Number(process.env.SMTP_PORT) || 587,
          secure: Boolean(process.env.SMTP_SECURE === "true"),
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: `"FoodBridge AI Auth" <${process.env.SMTP_USER}>`,
          to: normalizedEmail,
          subject: `🔐 Your FoodBridge AI Verification Code: ${otpCode}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #16a34a; margin: 0;">FoodBridge AI</h2>
                <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Surplus Food Rescue Network</p>
              </div>
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 10px; text-align: center; border: 1px dashed #cbd5e1;">
                <p style="margin: 0; color: #475569; font-size: 14px;">Your 4-Digit Sign-In Verification Code:</p>
                <h1 style="font-size: 36px; letter-spacing: 10px; color: #0f172a; margin: 15px 0; font-family: monospace; font-weight: 800;">${otpCode}</h1>
                <p style="margin: 0; color: #94a3b8; font-size: 12px;">This code is valid for 5 minutes. Do not share it with anyone.</p>
              </div>
            </div>
          `,
        });
        isEmailSent = true;
        console.log(`[REAL EMAIL DISPATCH] ✉️ Sent 4-digit OTP email to: ${normalizedEmail}`);
      } catch (mailErr) {
        console.error("[SMTP ERROR] Could not dispatch email via SMTP:", mailErr);
      }
    }

    console.log(`====================================================`);
    console.log(`[FOODBRIDGE EMAIL INBOX DISPATCH]`);
    console.log(`To: ${normalizedEmail}`);
    console.log(`Subject: Your FoodBridge AI Verification Code: ${otpCode}`);
    console.log(`====================================================`);

    return NextResponse.json({
      success: true,
      hasRealSmtp,
      isEmailSent,
      // For local testing without SMTP credentials, provide the simulated inbox preview
      simulatedInbox: !isEmailSent ? {
        to: normalizedEmail,
        subject: `Your FoodBridge AI Verification Code: ${otpCode}`,
        code: otpCode,
      } : null,
      message: isEmailSent
        ? `4-Digit verification code sent directly to ${normalizedEmail}. Please check your email inbox.`
        : `Verification code generated for ${normalizedEmail}. Check server console or simulated inbox below.`,
    });
  } catch (error) {
    return apiError(error);
  }
}
