import assert from "node:assert/strict";
import test from "node:test";
import { deliverSms } from "../../src/auth/sms-adapter";

test("SCRUM-42: HTTP SMS adapter sends a JSON request with configured credentials", async () => {
  let url: unknown;
  let request: RequestInit | undefined;
  const fetcher = async (input: string | URL | Request, init?: RequestInit) => {
    url = input;
    request = init;
    return { ok: true } as Response;
  };
  await deliverSms("+84912345678", "OTP 123456", {
    provider: "http", nodeEnv: "production", apiUrl: "https://sms.example.test/send", apiKey: "test-key",
  }, fetcher as typeof fetch);
  assert.equal(url, "https://sms.example.test/send");
  assert.equal(request?.method, "POST");
  assert.equal(request?.headers && (request.headers as Record<string, string>).authorization, "Bearer test-key");
  assert.deepEqual(JSON.parse(String(request?.body)), { to: "+84912345678", message: "OTP 123456" });
});

test("SCRUM-42: rejects console SMS in production and gateway failures", async () => {
  await assert.rejects(deliverSms("+84912345678", "OTP", { provider: "console", nodeEnv: "production" }), /production/);
  await assert.rejects(deliverSms("+84912345678", "OTP", { provider: "http", nodeEnv: "test" }), /cấu hình/);
  await assert.rejects(deliverSms("+84912345678", "OTP", {
    provider: "http", nodeEnv: "test", apiUrl: "https://sms.example.test/send", apiKey: "test-key",
  }, (async () => new Response("", { status: 502 })) as typeof fetch), /502/);
});
