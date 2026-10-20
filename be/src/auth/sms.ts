import { config } from "../config";
import { deliverSms } from "./sms-adapter";

export async function sendSms(to: string, message: string): Promise<void> {
  await deliverSms(to, message, {
    provider: config.SMS_PROVIDER,
    nodeEnv: config.NODE_ENV,
    apiUrl: config.SMS_API_URL,
    apiKey: config.SMS_API_KEY,
  });
}
