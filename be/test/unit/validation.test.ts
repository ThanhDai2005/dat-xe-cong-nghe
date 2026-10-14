import assert from "node:assert/strict";
import test from "node:test";
import { normalizeVnPhone, registerSchema } from "../../src/auth/validation";

test("normalizes common Vietnamese mobile formats", () => {
  assert.equal(normalizeVnPhone("0912 345 678"), "+84912345678");
  assert.equal(normalizeVnPhone("912345678"), "+84912345678");
  assert.equal(normalizeVnPhone("+84912345678"), "+84912345678");
  assert.equal(normalizeVnPhone("123"), null);
});

test("registration rejects mismatched or weak passwords", () => {
  const base = { role: "CUSTOMER", fullName: "Nguyen Van A", phone: "0912345678", email: "a@example.com" };
  assert.equal(registerSchema.safeParse({ ...base, password: "Weakpass1", confirmPassword: "Weakpass1" }).success, true);
  assert.equal(registerSchema.safeParse({ ...base, password: "weak", confirmPassword: "weak" }).success, false);
  assert.equal(registerSchema.safeParse({ ...base, password: "Weakpass1", confirmPassword: "Weakpass2" }).success, false);
});
