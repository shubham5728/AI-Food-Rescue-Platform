// In-memory OTP storage with 5 minute expiration
interface OtpEntry {
  code: string;
  expiresAt: number;
}

const otpMap = new Map<string, OtpEntry>();

export function storeOtp(email: string, code: string) {
  const normalizedEmail = email.trim().toLowerCase();
  otpMap.set(normalizedEmail, {
    code,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes validity
  });
}

export function verifyOtpCode(email: string, code: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  const entry = otpMap.get(normalizedEmail);

  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    otpMap.delete(normalizedEmail);
    return false;
  }

  const isValid = entry.code === code.trim();
  if (isValid) {
    otpMap.delete(normalizedEmail); // One-time use
  }
  return isValid;
}
