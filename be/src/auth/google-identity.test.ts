import assert from "node:assert/strict";
import test from "node:test";
import type { OAuth2Client } from "google-auth-library";
import { verifyGoogleIdentity } from "./google-identity";

test("SCRUM-37: verifies ID token for the configured audience and verified email", async () => {
  let received: unknown;
  const verifier = {
    verifyIdToken: async (options: unknown) => {
      received = options;
      return { getPayload: () => ({ sub: "google-sub-1", email: " Test@Example.com ", email_verified: true, name: " Test User " }) };
    },
  } as unknown as Pick<OAuth2Client, "verifyIdToken">;

  const identity = await verifyGoogleIdentity("id-token", "web-client-id", verifier);
  assert.deepEqual(received, { idToken: "id-token", audience: "web-client-id" });
  assert.deepEqual(identity, {
    subject: "google-sub-1", email: "test@example.com", fullName: "Test User", avatarUrl: null,
  });
});

test("SCRUM-37: rejects unverified identity and propagates token verification failure", async () => {
  const unverified = {
    verifyIdToken: async () => ({ getPayload: () => ({ sub: "google-sub-1", email: "test@example.com", email_verified: false }) }),
  } as unknown as Pick<OAuth2Client, "verifyIdToken">;
  assert.equal(await verifyGoogleIdentity("id-token", "web-client-id", unverified), null);

  const invalid = {
    verifyIdToken: async () => { throw new Error("bad signature"); },
  } as unknown as Pick<OAuth2Client, "verifyIdToken">;
  await assert.rejects(verifyGoogleIdentity("bad-token", "web-client-id", invalid), /bad signature/);
});
