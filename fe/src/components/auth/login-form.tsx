import { useState } from "react";
import { Link } from "react-router";
import { cn } from "cn";
import { Eye, EyeOff, Mail, Lock, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export const LoginForm = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 shadow-[0_20px_40px_-12px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.04)] border-slate-200">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-8 md:p-10">
            <FieldGroup>
              {/* Header */}
              <div className="flex flex-col items-center gap-3 text-center mb-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0050c8] to-[#1d68f2] flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                  Chào mừng trở lại
                </h1>
                <p className="text-base text-slate-500 max-w-sm">
                  Đăng nhập để tiếp tục đặt xe và quản lý chuyến đi của bạn
                </p>
              </div>

              {/* Login Method Toggle */}
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setLoginMethod("email")}
                  className={cn(
                    "flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all",
                    loginMethod === "email"
                      ? "bg-white text-[#0050c8] shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <Mail className="w-4 h-4 inline-block mr-2" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod("phone")}
                  className={cn(
                    "flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all",
                    loginMethod === "phone"
                      ? "bg-white text-[#0050c8] shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <Phone className="w-4 h-4 inline-block mr-2" />
                  Số điện thoại
                </button>
              </div>

              {/* Email/Phone Field */}
              {loginMethod === "email" ? (
                <Field>
                  <FieldLabel htmlFor="email" className="text-slate-700 font-semibold">
                    Email
                  </FieldLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="vidu@email.com"
                      className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-[#0050c8] focus:ring-4 focus:ring-blue-500/10 rounded-xl"
                      required
                    />
                  </div>
                </Field>
              ) : (
                <Field>
                  <FieldLabel htmlFor="phone" className="text-slate-700 font-semibold">
                    Số điện thoại
                  </FieldLabel>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0912 345 678"
                      className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-[#0050c8] focus:ring-4 focus:ring-blue-500/10 rounded-xl"
                      required
                    />
                  </div>
                </Field>
              )}

              {/* Password Field */}
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password" className="text-slate-700 font-semibold">
                    Mật khẩu
                  </FieldLabel>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-[#0050c8] hover:text-[#0040a2] font-medium transition-colors"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    className="pl-10 pr-12 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-[#0050c8] focus:ring-4 focus:ring-blue-500/10 rounded-xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </Field>

              {/* Remember Me */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded border-slate-300 text-[#0050c8] focus:ring-[#0050c8] focus:ring-offset-0"
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-slate-600 cursor-pointer select-none"
                >
                  Ghi nhớ đăng nhập
                </label>
              </div>

              {/* Submit Button */}
              <Field>
                <Button
                  type="submit"
                  className="w-full h-12 bg-[#0050c8] hover:bg-[#0040a2] active:bg-[#003580] text-white font-semibold text-base rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
                >
                  Đăng nhập
                  <svg
                    className="w-5 h-5 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-white text-slate-500">
                Hoặc đăng nhập với
              </FieldSeparator>

              {/* Social Login */}
              <Field className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  type="button"
                  className="h-12 border-slate-200 hover:border-[#0050c8] hover:bg-blue-50 rounded-xl transition-all"
                >
                  <svg
                    className="w-5 h-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="ml-2 font-medium">Google</span>
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="h-12 border-slate-200 hover:border-[#0050c8] hover:bg-blue-50 rounded-xl transition-all"
                >
                  <svg
                    className="w-5 h-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="ml-2 font-medium">Facebook</span>
                </Button>
              </Field>

              <FieldDescription className="text-center text-slate-600">
                Chưa có tài khoản?{" "}
                <Link
                  to="/register"
                  className="text-[#0050c8] hover:text-[#0040a2] font-semibold transition-colors"
                >
                  Đăng ký ngay
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>

          {/* Right Side Image */}
          <div className="relative hidden bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 md:flex items-center justify-center p-10">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
            <div className="relative text-center space-y-6 max-w-md">
              <div className="w-32 h-32 mx-auto bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl shadow-blue-500/20 flex items-center justify-center">
                <svg
                  className="w-20 h-20 text-[#0050c8]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-slate-900">
                Di chuyển an toàn
              </h2>
              <p className="text-lg text-slate-700 leading-relaxed">
                Kết nối với hàng ngàn tài xế chuyên nghiệp. Đặt xe nhanh chóng,
                di chuyển an toàn, giá cả minh bạch.
              </p>
              <div className="flex items-center justify-center gap-6 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#0050c8]">50K+</div>
                  <div className="text-sm text-slate-600 mt-1">Chuyến đi</div>
                </div>
                <div className="w-px h-12 bg-slate-300"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#0050c8]">4.8★</div>
                  <div className="text-sm text-slate-600 mt-1">Đánh giá</div>
                </div>
                <div className="w-px h-12 bg-slate-300"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#0050c8]">24/7</div>
                  <div className="text-sm text-slate-600 mt-1">Hỗ trợ</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <FieldDescription className="text-center text-slate-600 max-w-2xl mx-auto">
        Bằng việc đăng nhập, bạn đồng ý với{" "}
        <Link to="/terms" className="text-[#0050c8] hover:underline font-medium">
          Điều khoản dịch vụ
        </Link>{" "}
        và{" "}
        <Link to="/privacy" className="text-[#0050c8] hover:underline font-medium">
          Chính sách bảo mật
        </Link>{" "}
        của GoRide.
      </FieldDescription>
    </div>
  );
};
