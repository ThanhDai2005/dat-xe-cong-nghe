import { useState, type ComponentProps, type ComponentType, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock } from "lucide-react";
import { cn } from "cn";

const inputBase =
  "w-full h-12 bg-[#f2f3ff] rounded-xl text-[15px] text-[#131b2e] placeholder:text-[#737686] outline-none transition-all " +
  "focus:bg-white focus:ring-2 focus:ring-[#0050c8] focus:shadow-[0_0_0_4px_rgba(29,104,242,0.12)]";

interface AuthInputProps extends ComponentProps<"input"> {
  icon?: ComponentType<{ className?: string }>;
  right?: ReactNode;
  invalid?: boolean;
}

export const AuthInput = ({ icon: Icon, right, invalid, className, ...props }: AuthInputProps) => (
  <div className="relative flex items-center">
    {Icon && <Icon className="absolute left-3.5 w-5 h-5 text-[#424655] pointer-events-none" />}
    <input
      className={cn(inputBase, Icon ? "pl-11" : "pl-4", right ? "pr-12" : "pr-4",
        invalid && "bg-[#ffdad6] focus:bg-[#ffdad6]", className)}
      {...props}
    />
    {right && <div className="absolute right-3">{right}</div>}
  </div>
);

export const PasswordInput = ({ icon = Lock, ...props }: Omit<AuthInputProps, "type" | "right">) => {
  const [show, setShow] = useState(false);
  return (
    <AuthInput
      {...props}
      icon={icon}
      type={show ? "text" : "password"}
      right={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          className="p-1 rounded-lg text-[#424655] hover:text-[#131b2e]"
        >
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      }
    />
  );
};

export const FieldLabel = ({ children, required, htmlFor }: { children: ReactNode; required?: boolean; htmlFor?: string }) => (
  <label htmlFor={htmlFor} className="block mb-1.5 text-[13px] font-semibold text-[#131b2e]">
    {children} {required && <span className="text-[#ba1a1a] font-bold">*</span>}
  </label>
);

export const AuthAlert = ({ variant, title, children }: { variant: "error" | "success"; title: string; children?: ReactNode }) => (
  <div
    role={variant === "error" ? "alert" : "status"}
    className={cn("mb-4 p-3 rounded-xl flex items-start gap-2.5 text-[13px]",
      variant === "error" ? "bg-[#ffdad6] text-[#93000a]" : "bg-[#6ffbbe] text-[#005236]")}
  >
    {variant === "error"
      ? <AlertCircle className="w-5 h-5 shrink-0 text-[#ba1a1a]" />
      : <CheckCircle2 className="w-5 h-5 shrink-0 text-[#006645]" />}
    <div>
      <p className="font-semibold">{title}</p>
      {children && <p className="mt-0.5 opacity-90">{children}</p>}
    </div>
  </div>
);

export const PrimaryButton = ({ loading, loadingText, children, className, ...props }:
  ComponentProps<"button"> & { loading?: boolean; loadingText?: string }) => (
  <button
    {...props}
    disabled={props.disabled || loading}
    className={cn(
      "w-full h-12 rounded-xl bg-[#0050c8] hover:bg-[#1d68f2] active:scale-[0.99] text-white font-semibold text-[15px] shadow-md",
      "flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
      className)}
  >
    {loading ? (
      <>
        <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        {loadingText ?? "Đang xử lý..."}
      </>
    ) : children}
  </button>
);
