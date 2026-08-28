import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "./src/services/emailService.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(currentDirectory, "../.env") });

export const handler = async (event) => {
  console.log("Email event received:");
  console.log(JSON.stringify(event, null, 2));

  const { email, firstName, verificationToken, resetToken } = event.detail;
  const detailType = event["detail-type"];

  if (detailType === "EmailVerificationRequested") {
    await sendVerificationEmail({
      to: email,
      verificationToken,
    });

    console.log(`Verification email sent successfully to ${email}`);
    return;
  }

  if (detailType === "PasswordResetRequested") {
    await sendPasswordResetEmail({
      to: email,
      firstName,
      resetToken,
    });

    console.log(`Password reset email sent successfully to ${email}`);
    return;
  }

  console.log(`Unsupported email event type: ${event["detail-type"]}`);
};
