import "dotenv/config";
import { sendVerificationEmail } from "./src/services/emailService.js";

export const handler = async (event) => {
  console.log("USER_CREATED event received:");
  console.log(JSON.stringify(event, null, 2));

  const { email, verificationToken } = event.detail;

  await sendVerificationEmail({
    to: email,
    verificationToken,
  });

  console.log(`Verification email sent successfully to ${email}`);
};
