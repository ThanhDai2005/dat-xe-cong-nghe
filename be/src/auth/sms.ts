import { config } from "../config";

export async function sendSms(to: string, message: string): Promise<void> {
  if (config.SMS_PROVIDER === "console") {
    if (config.NODE_ENV === "production") throw new Error("Console SMS không được dùng trong production");
    console.log(`[DEV SMS] ${to}: ${message}`);
    return;
  }
  if (!config.SMS_API_URL || !config.SMS_API_KEY) throw new Error("SMS gateway chưa được cấu hình");
  const response = await fetch(config.SMS_API_URL, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${config.SMS_API_KEY}` },
    body: JSON.stringify({ to, message }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`SMS gateway lỗi HTTP ${response.status}`);
}
