import assert from "node:assert/strict";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const apiUrl = process.env.AUTH_TEST_API_URL ?? "http://localhost:3000";
const mailpitUrl = process.env.AUTH_TEST_MAILPIT_URL ?? "http://localhost:8025";
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const uniqueEmail = () => `auth-test-${crypto.randomUUID()}@example.test`;
const uniquePhone = () => `09${crypto.randomInt(10_000_000, 100_000_000)}`;
const normalizedPhone = (phone) => `+84${phone.slice(1)}`;

async function request(url, { method = "GET", body } = {}) {
  const response = await fetch(url, {
    method,
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await response.json();
  return { status: response.status, json };
}

const auth = (route, options) => request(`${apiUrl}/api/auth${route}`, options);

async function mailFor(email) {
  for (let attempt = 0; attempt < 30; attempt++) {
    const { status, json } = await request(`${mailpitUrl}/api/v1/messages`);
    assert.equal(status, 200, "Mailpit API must be available");
    const message = json.messages.find((item) => item.To.some((recipient) => recipient.Address === email));
    if (message) {
      const detail = await request(`${mailpitUrl}/api/v1/message/${message.ID}`);
      assert.equal(detail.status, 200);
      return detail.json;
    }
    await pause(100);
  }
  throw new Error(`No verification email arrived for ${email}`);
}

async function devOtpFor(phone) {
  const escapedPhone = normalizedPhone(phone).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`\\[DEV SMS\\] ${escapedPhone}: .*?là (\\d{6})`, "g");
  for (let attempt = 0; attempt < 30; attempt++) {
    const logs = execFileSync("docker", ["compose", "logs", "api", "--tail", "200"], {
      cwd: repoRoot, encoding: "utf8", timeout: 10_000,
    });
    const matches = [...logs.matchAll(pattern)];
    if (matches.length) return matches.at(-1)[1];
    await pause(100);
  }
  throw new Error("OTP absent from API logs; run Docker Compose with SMS_PROVIDER=console");
}

async function sendOtp(phone, purpose = "register", clientRole = "CUSTOMER") {
  const sent = await auth("/phone/otp/send", { method: "POST", body: { phone, purpose, clientRole } });
  assert.equal(sent.status, 200);
  assert.match(sent.json.data.otpSessionId, /^[0-9a-f-]{36}$/i);
  return { sessionId: sent.json.data.otpSessionId, code: await devOtpFor(phone) };
}

test.before(async () => {
  try {
    const health = await request(`${apiUrl}/health`);
    assert.equal(health.status, 200);
    assert.equal(health.json.status, "ok");
    const mailpit = await request(`${mailpitUrl}/api/v1/messages`);
    assert.equal(mailpit.status, 200);
    execFileSync("docker", ["compose", "ps", "--quiet", "api"], { cwd: repoRoot, timeout: 10_000 });
  } catch (error) {
    throw new Error("Start API, MySQL, Redis and Mailpit with `docker compose up -d --build` from the worktree root before test:e2e", { cause: error });
  }
});

test("SCRUM-26: register, receive email, activate once, then sign in", async () => {
  const email = uniqueEmail();
  const phone = uniquePhone();
  const password = "StrongPass123!";
  const registration = await auth("/register", {
    method: "POST",
    body: { role: "CUSTOMER", fullName: "Auth Test", email, phone, password, confirmPassword: password },
  });
  assert.equal(registration.status, 201);
  assert.equal(registration.json.data.status, "PENDING");
  assert.equal(registration.json.data.emailVerificationSent, true);

  const pendingLogin = await auth("/v1/login", { method: "POST", body: { identifier: email, password, clientRole: "CUSTOMER" } });
  assert.equal(pendingLogin.status, 403);

  const message = await mailFor(email);
  const link = message.Text.match(/https?:\/\/\S+\/api\/v1\/auth\/email\/verify\?token=[^\s]+/)?.[0];
  assert.ok(link, "verification link must be in the email");
  const activation = await request(link);
  assert.equal(activation.status, 200);
  assert.equal(activation.json.success, true);
  assert.equal((await request(link)).status, 400, "email link must be single-use");

  const login = await auth("/v1/login", { method: "POST", body: { identifier: email, password, clientRole: "CUSTOMER" } });
  assert.equal(login.status, 200);
  assert.equal(login.json.data.user.status, "ACTIVE");
  assert.ok(login.json.data.tokens.accessToken);

  const duplicate = await auth("/register", {
    method: "POST", body: { role: "CUSTOMER", fullName: "Auth Test", email, phone: uniquePhone(), password, confirmPassword: password },
  });
  assert.equal(duplicate.status, 409);
});

test("SCRUM-37: reject malformed Google request and invalid/unconfigured token", async () => {
  const malformed = await auth("/oauth/google", { method: "POST", body: { idToken: "short", clientRole: "CUSTOMER" } });
  assert.equal(malformed.status, 400);
  const invalid = await auth("/oauth/google", { method: "POST", body: { idToken: "not-a-valid-google-id-token", clientRole: "CUSTOMER" } });
  assert.ok([401, 503].includes(invalid.status), "401 when Google is configured, 503 when it is not");
});

test("SCRUM-42: send six-digit SMS OTP, validate phone, enforce resend cooldown", async () => {
  const phone = uniquePhone();
  const { sessionId, code } = await sendOtp(phone, "login");
  assert.ok(sessionId);
  assert.match(code, /^\d{6}$/);
  const cooldown = await auth("/phone/otp/send", { method: "POST", body: { phone, purpose: "login", clientRole: "CUSTOMER" } });
  assert.equal(cooldown.status, 429);
  const badPhone = await auth("/phone/otp/send", { method: "POST", body: { phone: "123", purpose: "login", clientRole: "CUSTOMER" } });
  assert.equal(badPhone.status, 400);
});

test("SCRUM-47: OTP creates a customer, rejects wrong role and replay", async () => {
  const phone = uniquePhone();
  const { sessionId, code } = await sendOtp(phone);
  const body = { phone, otpSessionId: sessionId, otpCode: code };
  const wrongRole = await auth("/phone/otp/verify", { method: "POST", body: { ...body, clientRole: "DRIVER" } });
  assert.equal(wrongRole.status, 403);
  const verified = await auth("/phone/otp/verify", { method: "POST", body: { ...body, clientRole: "CUSTOMER" } });
  assert.equal(verified.status, 200);
  assert.equal(verified.json.data.isNewUser, true);
  assert.equal(verified.json.data.user.status, "ACTIVE");
  assert.ok(verified.json.data.tokens.accessToken);
  const replay = await auth("/phone/otp/verify", { method: "POST", body });
  assert.equal(replay.status, 401);
});

test("SCRUM-47: five wrong OTP attempts invalidate the session", async () => {
  const phone = uniquePhone();
  const { sessionId, code } = await sendOtp(phone);
  const wrongCode = code === "000000" ? "111111" : "000000";
  for (let attempt = 0; attempt < 5; attempt++) {
    const wrong = await auth("/phone/otp/verify", {
      method: "POST", body: { phone, otpSessionId: sessionId, otpCode: wrongCode },
    });
    assert.equal(wrong.status, 401);
  }
  const expired = await auth("/phone/otp/verify", {
    method: "POST", body: { phone, otpSessionId: sessionId, otpCode: code },
  });
  assert.equal(expired.status, 401);
});

test("SCRUM-47: OTP activates a pending customer and leaves a new driver pending", async () => {
  const customerPhone = uniquePhone();
  const password = "StrongPass123!";
  const registration = await auth("/register", {
    method: "POST",
    body: { role: "CUSTOMER", fullName: "Pending Customer", phone: customerPhone, password, confirmPassword: password },
  });
  assert.equal(registration.status, 201);
  const customerOtp = await sendOtp(customerPhone);
  const activated = await auth("/phone/otp/verify", {
    method: "POST", body: { phone: customerPhone, otpSessionId: customerOtp.sessionId, otpCode: customerOtp.code },
  });
  assert.equal(activated.status, 200);
  assert.equal(activated.json.data.isNewUser, false);
  assert.equal(activated.json.data.user.status, "ACTIVE");
  const login = await auth("/v1/login", { method: "POST", body: { identifier: customerPhone, password, clientRole: "CUSTOMER" } });
  assert.equal(login.status, 200);

  const driverPhone = uniquePhone();
  const driverOtp = await sendOtp(driverPhone, "register", "DRIVER");
  const driver = await auth("/phone/otp/verify", {
    method: "POST", body: { phone: driverPhone, otpSessionId: driverOtp.sessionId, otpCode: driverOtp.code, clientRole: "DRIVER" },
  });
  assert.equal(driver.status, 200);
  assert.equal(driver.json.data.user.status, "PENDING");
  assert.equal(driver.json.data.tokens, null);
});
