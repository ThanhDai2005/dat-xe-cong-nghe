export interface SmsSettings {
  provider: "console" | "http";
  nodeEnv: "development" | "test" | "production";
  apiUrl?: string;
  apiKey?: string;
}

export async function deliverSms(
  to: string,
  message: string,
  settings: SmsSettings,
  fetcher: typeof fetch = fetch,
): Promise<void> {
  if (settings.provider === "console") {
    if (settings.nodeEnv === "production") throw new Error("Console SMS không được dùng trong production");
    console.log(`[DEV SMS] ${to}: ${message}`);
    return;
  }
  if (!settings.apiUrl || !settings.apiKey) throw new Error("SMS gateway chưa được cấu hình");
  const response = await fetcher(settings.apiUrl, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${settings.apiKey}` },
    body: JSON.stringify({ to, message }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`SMS gateway lỗi HTTP ${response.status}`);
}
