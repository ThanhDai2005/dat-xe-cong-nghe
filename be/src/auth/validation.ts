import { z } from "zod";

export function normalizeVnPhone(input: string): string | null {
  const digits = input.replace(/[\s().-]/g, "");
  if (/^0[35789]\d{8}$/.test(digits)) return `+84${digits.slice(1)}`;
  if (/^\+84[35789]\d{8}$/.test(digits)) return digits;
  if (/^84[35789]\d{8}$/.test(digits)) return `+${digits}`;
  if (/^[35789]\d{8}$/.test(digits)) return `+84${digits}`;
  return null;
}

export const registerSchema = z.object({
  role: z.enum(["CUSTOMER", "DRIVER"]),
  fullName: z.string().trim().min(2).max(150),
  email: z.email().optional(),
  phone: z.string().transform((value, ctx) => {
    const normalized = normalizeVnPhone(value);
    if (!normalized) { ctx.addIssue({ code: "custom", message: "Số điện thoại Việt Nam không hợp lệ" }); return z.NEVER; }
    return normalized;
  }),
  password: z.string().min(8).max(72).regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});
