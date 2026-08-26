import crypto from "crypto";

export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const hashVerificationToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
