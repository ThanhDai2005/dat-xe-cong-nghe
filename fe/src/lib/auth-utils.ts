/** SĐT Việt Nam: 9 số sau tiền tố +84 (đầu 3,5,7,8,9) */
const VN_MOBILE = /^[35789]\d{8}$/;

export function normalizeVnPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "").replace(/^84/, "").replace(/^0/, "");
  return VN_MOBILE.test(digits) ? `+84${digits}` : null;
}

export function maskPhone(e164: string): string {
  const d = e164.replace(/^\+84/, "");
  return `+84 ${d.slice(0, 3)} ••• ${d.slice(-3)}`;
}

export function maskIdentifier(value: string): string {
  if (value.includes("@")) {
    const [name, domain] = value.split("@");
    return `${name.slice(0, 2)}•••@${domain}`;
  }
  const e164 = normalizeVnPhone(value);
  return e164 ? maskPhone(e164) : value;
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3;
  label: string;
  /** Đủ: ≥8 ký tự, có chữ hoa, chữ thường và chữ số */
  passed: boolean;
}

export function getPasswordStrength(value: string): PasswordStrength {
  if (!value) return { score: 0, label: "Chưa nhập", passed: false };
  const rules = [
    value.length >= 8,
    /[a-z]/.test(value) && /[A-Z]/.test(value),
    /\d/.test(value),
  ];
  const score = rules.filter(Boolean).length as 0 | 1 | 2 | 3;
  const label = score <= 1 ? "Yếu" : score === 2 ? "Trung bình" : "Mạnh";
  return { score, label, passed: score === 3 };
}
