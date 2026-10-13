import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "cn";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  invalid?: boolean;
  disabled?: boolean;
}

/** Nhập OTP bằng các ô riêng biệt (mặc định 6 ô). */
export const OtpInput = ({ value, onChange, length = 6, invalid, disabled }: OtpInputProps) => {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const focus = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  const setDigit = (i: number, raw: string) => {
    const d = raw.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = d;
    onChange(next.join("").slice(0, length));
    if (d) focus(i + 1);
  };

  const onKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i]) {
      e.preventDefault();
      const next = [...digits];
      next[i - 1] = "";
      onChange(next.join(""));
      focus(i - 1);
    } else if (e.key === "ArrowLeft") focus(i - 1);
    else if (e.key === "ArrowRight") focus(i + 1);
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    focus(Math.min(pasted.length, length - 1));
  };

  return (
    <div className="flex justify-between gap-2 sm:gap-3">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          value={d}
          disabled={disabled}
          autoFocus={i === 0}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          aria-label={`Chữ số OTP thứ ${i + 1}`}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={onPaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            "w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl shadow-sm outline-none transition-all",
            "focus:bg-white focus:ring-2 focus:ring-[#0050c8]",
            invalid ? "bg-[#ffdad6] text-[#93000a]" : d ? "bg-[#dae2fd] text-[#0050c8]" : "bg-[#f2f3ff] text-[#131b2e]",
          )}
        />
      ))}
    </div>
  );
};
