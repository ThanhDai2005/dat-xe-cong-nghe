import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, ArrowRight, RefreshCw, Timer } from "lucide-react";
import { useCountdown } from "@/hooks/useCountdown";
import { ApiError } from "@/lib/http";
import { AuthAlert, PrimaryButton } from "./AuthField";
import { OtpInput } from "./OtpInput";

interface OtpVerifyFormProps {
  title: string;
  /** Mô tả kênh nhận mã, vd "SMS" / "email" */
  channelLabel: string;
  maskedTarget: string;
  backTo: string;
  backLabel: string;
  submitLabel: string;
  stepLabel?: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
}

export const OtpVerifyForm = ({
  title, channelLabel, maskedTarget, backTo, backLabel, submitLabel, stepLabel, onVerify, onResend,
}: OtpVerifyFormProps) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { isFinished, restart, formatted } = useCountdown(60);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return setError("Vui lòng nhập đủ 6 chữ số mã OTP.");
    setError("");
    setLoading(true);
    try {
      await onVerify(otp);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Mã OTP không chính xác hoặc đã hết hạn. Vui lòng thử lại.");
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true);
    setError("");
    try {
      await onResend();
      setOtp("");
      restart();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không thể gửi lại mã. Vui lòng thử lại.");
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        {stepLabel && <p className="mb-2 text-xs font-bold text-[#0050c8]">{stepLabel}</p>}
        <h1 className="text-2xl font-bold tracking-tight mb-1">{title}</h1>
        <p className="text-[15px] text-[#424655]">Mã xác thực gồm 6 chữ số đã được gửi qua {channelLabel} đến:</p>
        <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg bg-[#f2f3ff]">
          <span className="font-semibold tracking-wide">{maskedTarget}</span>
          <Link to={backTo} title="Thay đổi" className="text-xs font-semibold text-[#1d68f2] hover:text-[#0050c8]">Thay đổi</Link>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <div>
          <OtpInput value={otp} onChange={(v) => { setOtp(v); setError(""); }} invalid={!!error} disabled={loading} />
          {error && <div className="mt-3"><AuthAlert variant="error" title={error} /></div>}
        </div>

        <div className="flex items-center justify-between text-[13px] text-[#424655]">
          {isFinished ? (
            <button type="button" onClick={resend} disabled={resending}
              className="inline-flex items-center gap-1 font-bold text-[#1d68f2] hover:text-[#0050c8] disabled:opacity-50 cursor-pointer">
              <RefreshCw className="w-4 h-4" /> Gửi lại mã OTP
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <Timer className="w-4 h-4 text-[#737686]" />
              Gửi lại mã sau <strong className="text-[#1d68f2] font-semibold tabular-nums">{formatted}</strong>
            </span>
          )}
        </div>

        <PrimaryButton type="submit" loading={loading} loadingText="Đang xác thực mã..." disabled={otp.length < 6}>
          {submitLabel} <ArrowRight className="w-5 h-5" />
        </PrimaryButton>

        <div className="text-center">
          <Link to={backTo} className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#424655] hover:text-[#131b2e]">
            <ArrowLeft className="w-4 h-4" /> {backLabel}
          </Link>
        </div>
      </form>
    </>
  );
};
