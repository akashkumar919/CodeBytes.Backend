import crypto from "crypto";

export function generateSecureOTP() {
  // 6-digit OTP using crypto
  return crypto.randomInt(100000, 999999).toString();
}
