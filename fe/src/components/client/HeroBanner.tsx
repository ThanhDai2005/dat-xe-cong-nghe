import { Link } from "react-router";
import BookingCard from "@/components/client/BookingCard";
import { ArrowRight, Phone, CheckCircle, Sparkles, User, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const HeroBanner = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <section
      className="relative py-6 sm:py-8 lg:py-12 overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 65% 35%, rgba(219, 234, 254, 0.6) 0%, rgba(240, 249, 255, 0.3) 50%, #ffffff 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Hero Left Column */}
          <div className="lg:col-span-7 space-y-4 lg:space-y-5 lg:pr-2">
            {/* Pill Badge */}
            {isAuthenticated ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-[#0040a2] text-xs sm:text-sm font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-[#0050c8]" />
                <span>Chào mừng trở lại, {user?.fullName || "Bạn"}!</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100/70 border border-blue-200 text-[#0040a2] text-xs sm:text-sm font-semibold tracking-wide">
                <span className="flex h-2 w-2 rounded-full bg-[#0050c8] animate-pulse" />
                Di chuyển thông minh mỗi ngày
              </div>
            )}

            {/* Main Heading */}
            <div className="space-y-3">
              {isAuthenticated ? (
                <>
                  <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-slate-900 leading-[1.15] tracking-tight">
                    Sẵn sàng cho hành trình?
                    <br />
                    <span className="text-[#0050c8]">Đặt xe chỉ trong 30 giây.</span>
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600 max-w-lg font-normal leading-relaxed">
                    Tài xế GoRide gần nhất đang sẵn sàng phục vụ bạn. Nhập điểm đón và điểm đến để nhận lộ trình tối ưu cùng ưu đãi cước phí tốt nhất.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-slate-900 leading-[1.15] tracking-tight">
                    Đặt xe nhanh chóng.
                    <br />
                    <span className="text-[#0050c8]">Di chuyển dễ dàng.</span>
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600 max-w-lg font-normal leading-relaxed">
                    Kết nối với tài xế phù hợp chỉ trong vài thao tác. Minh bạch giá
                    cước, thuận tiện di chuyển và đảm bảo an tâm tuyệt đối trên mọi
                    hành trình.
                  </p>
                </>
              )}
            </div>

            {/* Hero Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="#booking-card"
                className="inline-flex items-center justify-center gap-2 bg-[#0050c8] hover:bg-[#0040a2] text-white font-semibold text-sm sm:text-base px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
              >
                Đặt xe ngay
                <ArrowRight className="w-4 h-4" />
              </a>
              {isAuthenticated ? (
                <Link
                  to="/profile"
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-sm sm:text-base px-5 py-2.5 rounded-xl shadow-sm transition-colors"
                >
                  <User className="w-4 h-4 text-[#0050c8]" />
                  Hồ sơ của tôi
                </Link>
              ) : (
                <a
                  href="#support"
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-sm sm:text-base px-5 py-2.5 rounded-xl shadow-sm transition-colors"
                >
                  <Phone className="w-4 h-4 text-slate-500" />
                  Liên hệ hỗ trợ
                </a>
              )}
            </div>

            {/* Trust Badges */}
            <div className="pt-1 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>{isAuthenticated ? "Ưu đãi thành viên" : "Không phí ẩn"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>Tài xế xác minh</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>Hỗ trợ 24/7</span>
              </div>
            </div>

            {/* Decorative Car Illustration - Hidden on mobile */}
            <div className="relative w-full max-w-md h-32 pt-2 hidden sm:block select-none">
              <svg
                className="w-full h-full"
                fill="none"
                viewBox="0 0 500 130"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Roads */}
                <path
                  d="M-20 100 L520 50"
                  stroke="#FFFFFF"
                  strokeLinecap="round"
                  strokeWidth="48"
                />
                <path
                  d="M-20 100 L520 50"
                  stroke="#E2E8F0"
                  strokeDasharray="8 6"
                  strokeWidth="2"
                />
                <path
                  d="M220 -10 L280 140"
                  stroke="#FFFFFF"
                  strokeLinecap="round"
                  strokeWidth="40"
                />
                <path
                  d="M220 -10 L280 140"
                  stroke="#E2E8F0"
                  strokeDasharray="8 6"
                  strokeWidth="2"
                />
                {/* Map Markers */}
                <circle cx="190" cy="45" fill="#DBEAFE" r="6" />
                <circle cx="190" cy="45" fill="#0050c8" r="3" />
                <circle cx="300" cy="90" fill="#DCFCE7" r="6" />
                <circle cx="300" cy="90" fill="#16A34A" r="3" />
                {/* Car */}
                <g transform="translate(215, 55)">
                  <ellipse
                    cx="38"
                    cy="34"
                    fill="#CBD5E1"
                    opacity="0.6"
                    rx="35"
                    ry="6"
                  />
                  <path
                    d="M4 19 C4 14 8 11 15 11 L25 11 C29 6 35 2 44 2 L56 2 C63 2 68 6 71 11 L73 14 C77 15 79 18 79 22 L79 26 C79 28 77 30 75 30 L2 30 C1 30 0 28 0 26 L0 23 C0 21 2 19 4 19 Z"
                    fill="#0050c8"
                  />
                  <path d="M27 10 L35 5 L45 5 L45 10 Z" fill="#93C5FD" />
                  <path
                    d="M48 5 L57 5 C60 5 63 7 66 10 L48 10 Z"
                    fill="#93C5FD"
                  />
                  <text
                    fill="#FFFFFF"
                    fontFamily="Be Vietnam Pro, sans-serif"
                    fontSize="7"
                    fontWeight="700"
                    x="28"
                    y="22"
                  >
                    GoRide
                  </text>
                  <circle cx="18" cy="30" fill="#1E293B" r="7" />
                  <circle cx="18" cy="30" fill="#94A3B8" r="3" />
                  <circle cx="62" cy="30" fill="#1E293B" r="7" />
                  <circle cx="62" cy="30" fill="#94A3B8" r="3" />
                </g>
              </svg>

              {/* Floating Driver / Member Status Chip */}
              <div className="absolute bottom-2 left-6 bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-xl shadow-md border border-slate-100 flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  {isAuthenticated ? <ShieldCheck className="w-3.5 h-3.5" /> : "✓"}
                </div>
                <div className="leading-tight">
                  <p className="text-xs font-bold text-slate-800">
                    {isAuthenticated
                      ? (user?.fullName || "Thành viên thân thiết")
                      : "Tài xế đã sẵn sàng"}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {isAuthenticated
                      ? "Ưu đãi cước & kết nối tài xế ưu tiên"
                      : "Chỉ 3 phút để kết nối"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Right Column - Booking Card */}
          <div className="lg:col-span-5">
            <BookingCard />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
