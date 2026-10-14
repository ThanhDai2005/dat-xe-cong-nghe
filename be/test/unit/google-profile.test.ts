import assert from "node:assert/strict";
import test from "node:test";
import { googleProfile } from "../../src/auth/google-profile";

test("requires a verified email and stable Google subject", () => {
  assert.equal(googleProfile({ email: "a@example.com", email_verified: true }), null);
  assert.equal(googleProfile({ sub: "123", email: "a@example.com", email_verified: false }), null);
  assert.deepEqual(googleProfile({ sub: "123", email: "A@Example.com", email_verified: true, name: " An " }), {
    subject: "123", email: "a@example.com", fullName: "An", avatarUrl: null,
  });
});
