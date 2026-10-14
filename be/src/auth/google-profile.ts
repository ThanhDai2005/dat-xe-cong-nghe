import type { TokenPayload } from "google-auth-library";

export function googleProfile(payload: Partial<TokenPayload> | undefined) {
  if (!payload?.sub || !payload.email || payload.email_verified !== true) return null;
  return {
    subject: payload.sub,
    email: payload.email.trim().toLowerCase(),
    fullName: payload.name?.trim() || payload.email.split("@")[0],
    avatarUrl: payload.picture || null,
  };
}
