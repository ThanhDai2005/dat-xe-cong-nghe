import { getPasswordStrength } from "@/lib/auth-utils";
import { cn } from "cn";

export const PasswordStrengthBars = ({ value }: { value: string }) => {
  const { score, label } = getPasswordStrength(value);
  const color = score === 1 ? "bg-[#ba1a1a]" : score === 2 ? "bg-[#00668a]" : "bg-[#006645]";
  const text = score === 1 ? "text-[#ba1a1a]" : score === 2 ? "text-[#00668a]" : score === 3 ? "text-[#006645]" : "text-[#737686]";
  return (
    <div className="pt-1.5">
      <div className="flex justify-between text-[13px] mb-1.5">
        <span className="text-[#424655]">Độ mạnh mật khẩu</span>
        <span className={cn("font-semibold", text)}>{label}</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5 h-1.5">
        {[1, 2, 3].map((n) => (
          <div key={n} className={cn("h-full rounded-full transition-colors duration-300", score >= n ? color : "bg-[#e2e7ff]")} />
        ))}
      </div>
      <p className="mt-2 text-[13px] text-[#424655]">Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường và chữ số.</p>
    </div>
  );
};
