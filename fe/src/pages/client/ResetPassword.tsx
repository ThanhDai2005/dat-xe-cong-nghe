import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router";
import { ArrowRight, CheckCircle2, LockKeyhole, ShieldCheck, KeyRound, XCircle } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthAlert, FieldLabel, PasswordInput, PrimaryButton } from "@/components/auth/AuthField";
import { PasswordStrengthBars } from "@/components/auth/PasswordStrengthBars";
import { authService } from "@/services/authService";
import { ApiError } from "@/lib/http";
import { getPasswordStrength } from "@/lib/auth-utils";

const ResetPassword = () => {
  const { state } = useLocation();
  const resetToken: string | undefined = state?.resetToken;
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  if (!resetToken) return <Navigate to="/forgot-password" replace />;

  const strong = getPasswordStrength(password).passed;
  const matches = confirm.length > 0 && password === confirm;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!strong) return setError("Mật khẩu chưa đủ mạnh. Cần tối thiểu 8 ký tự, gồm chữ hoa, chữ thường và chữ số.");
    if (password !== confirm) return setError("Mật khẩu xác nhận không khớp.");
    setError("");
    setLoading(true);
    try {
      await authService.resetPassword(resetToken, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không thể đặt lại mật khẩu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      badge="GoRide Identity Security"
      title="Thiết lập mật khẩu mới"
      description="Tạo mật khẩu mạnh để bảo vệ tài khoản và sẵn sàng cho những chuyến đi tiếp theo cùng GoRide."
      icon={KeyRound}
      footerIcon={ShieldCheck}
      footerTitle="Bảo mật đa lớp"
      footerDesc="Mật khẩu được mã hóa trước khi lưu trữ"
    >
      {done ? (
        <div className="text-center py-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[#008259]/15 text-[#006645] flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-[2rem] leading-tight font-bold tracking-tight">Đặt lại mật khẩu thành công!</h1>
          <p className="mt-2 text-[17px] text-[#424655]">
            Mật khẩu mới đã được cập nhật an toàn. Các phiên đăng nhập cũ đã bị thu hồi để đảm bảo an toàn.
          </p>
          <Link to="/login" replace
            className="mt-8 w-full h-12 rounded-xl bg-[#0050c8] hover:bg-[#1d68f2] text-white font-semibold flex items-center justify-center gap-2 shadow-md transition-all">
            Đăng nhập ngay <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-[2rem] leading-tight font-bold tracking-tight">Tạo mật khẩu mới</h1>
            <p className="mt-1 text-[15px] text-[#424655]">Hãy chọn mật khẩu mới để tiếp tục sử dụng tài khoản GoRide.</p>
          </div>
          {error && <AuthAlert variant="error" title="Không thể tiếp tục">{error}</AuthAlert>}
          <form onSubmit={submit} className="space-y-5" noValidate>
            <div>
              <FieldLabel htmlFor="new-password" required>Mật khẩu mới</FieldLabel>
              <PasswordInput id="new-password" value={password} autoComplete="new-password"
                onChange={(e) => setPassword(e.target.value)} placeholder="Nhập tối thiểu 8 ký tự..." />
              <PasswordStrengthBars value={password} />
            </div>
            <div>
              <FieldLabel htmlFor="confirm-password" required>Xác nhận mật khẩu mới</FieldLabel>
              <PasswordInput id="confirm-password" icon={LockKeyhole} value={confirm} autoComplete="new-password"
                onChange={(e) => setConfirm(e.target.value)} placeholder="Nhập lại mật khẩu mới..." />
              {confirm && (
                <p className={`mt-1.5 flex items-center gap-1 text-[13px] ${matches ? "text-[#006645]" : "text-[#ba1a1a]"}`}>
                  {matches ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {matches ? "Mật khẩu trùng khớp chính xác" : "Mật khẩu xác nhận không khớp"}
                </p>
              )}
            </div>
            <PrimaryButton type="submit" loading={loading} loadingText="Đang lưu mật khẩu..." disabled={!strong || !matches}>
              Đặt lại mật khẩu <ArrowRight className="w-5 h-5" />
            </PrimaryButton>
            <div className="text-center">
              <Link to="/login" className="text-[13px] font-semibold text-[#424655] hover:text-[#0050c8]">Quay lại đăng nhập</Link>
            </div>
          </form>
        </>
      )}
    </AuthShell>
  );
};

export default ResetPassword;
