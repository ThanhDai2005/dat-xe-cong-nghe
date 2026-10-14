import assert from "node:assert/strict";
import test from "node:test";
import { createOtp, hashOtp, maskPhone } from "./otp-utils";

test("generates fixed-length numeric OTP and session-bound digest", () => {
  for (let index = 0; index < 100; index++) assert.match(createOtp(), /^\d{6}$/);
  assert.notEqual(hashOtp("session-1", "123456", "secret"), hashOtp("session-2", "123456", "secret"));
  assert.equal(maskPhone("+84912345678"), "+84912•••678");
});
