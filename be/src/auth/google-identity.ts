import { OAuth2Client } from "google-auth-library";
import { googleProfile } from "./google-profile";

const googleClient = new OAuth2Client();

export async function verifyGoogleIdentity(
  idToken: string,
  audience: string,
  client: Pick<OAuth2Client, "verifyIdToken"> = googleClient,
) {
  const ticket = await client.verifyIdToken({ idToken, audience });
  return googleProfile(ticket.getPayload());
}
