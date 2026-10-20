import { Link } from "react-router";
import BookingCard from "@/components/client/BookingCard";
import {
  ArrowRight,
  Phone,
  CheckCircle,
  Sparkles,
  User,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const HeroBanner = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <section className="relative isolate w-full overflow-hidden bg-[#f6f8ff]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_68%_35%,rgba(37,99,235,0.10)_0%,rgba(239,244,255,0.75)_42%,#f8f9ff_100%)]" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-100/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-indigo-100/40 blur-3xl" />

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-72px)] w-full max-w-[1600px] grid-cols-1 items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8 xl:px-10">
        {/* BÊN TRÁI: GIỚI THIỆU */}
        <div className="min-w-0 lg:col-span-7">
          {isAuthenticated ? (
            <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-700 sm:text-sm">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span className="truncate">Chào mừng trở lại, {user?.fullName || "Bạn"}!</span>
            </div>
          ) : (
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-100/80 px-3.5 py-1.5 text-xs font-semibold text-blue-700 sm:text-sm">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              <span>Di chuyển thông minh mỗi ngày</span>
            </div>
          )}

          <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl xl:text-[56px]">
            {isAuthenticated ? "Sẵn sàng cho hành trình?" : "Đặt xe nhanh chóng."}
            <br />
            <span className="text-blue-600">
              {isAuthenticated ? "Đặt xe dễ dàng." : "Di chuyển dễ dàng."}
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
            Kết nối với tài xế phù hợp chỉ trong vài thao tác. Minh bạch giá cước,
            thuận tiện di chuyển và đảm bảo an tâm tuyệt đối trên mọi hành trình.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href="#booking-card"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl active:translate-y-0"
            >
              Đặt xe ngay <ArrowRight className="h-4 w-4" />
            </a>

            {isAuthenticated ? (
              <Link
                to="/profile"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 no-underline shadow-sm transition-all duration-200 hover:border-blue-200 hover:bg-blue-50"
              >
                <User className="h-4 w-4 text-blue-600" />
                Hồ sơ của tôi
              </Link>
            ) : (
              <a
                href="#support"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 no-underline shadow-sm transition-all duration-200 hover:border-blue-200 hover:bg-blue-50"
              >
                <Phone className="h-4 w-4 text-blue-600" />
                Liên hệ hỗ trợ
              </a>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-blue-600" />{isAuthenticated ? "Ưu đãi thành viên" : "Không phí ẩn"}</div>
            <div className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-blue-600" />Tài xế xác minh</div>
            <div className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-blue-600" />Hỗ trợ 24/7</div>
          </div>

          {/* Minh họa xe */}
          <div className="relative mt-6 hidden h-32 w-full max-w-md select-none sm:block">
            <svg className="h-full w-full" fill="none" viewBox="0 0 500 130" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Minh họa xe GoRide trên đường">
              <path d="M-20 100 L520 50" stroke="#FFFFFF" strokeLinecap="round" strokeWidth="48" />
              <path d="M-20 100 L520 50" stroke="#DCE5F7" strokeDasharray="8 6" strokeWidth="2" />
              <path d="M220 -10 L280 140" stroke="#FFFFFF" strokeLinecap="round" strokeWidth="40" />
              <path d="M220 -10 L280 140" stroke="#DCE5F7" strokeDasharray="8 6" strokeWidth="2" />
              <circle cx="190" cy="45" fill="#DBEAFE" r="7" /><circle cx="190" cy="45" fill="#2563EB" r="3.5" />
              <circle cx="300" cy="90" fill="#DBEAFE" r="7" /><circle cx="300" cy="90" fill="#2563EB" r="3.5" />
              <g transform="translate(215, 55)">
                <ellipse cx="38" cy="34" fill="#94A3B8" opacity="0.45" rx="35" ry="6" />
                <path d="M4 19 C4 14 8 11 15 11 L25 11 C29 6 35 2 44 2 L56 2 C63 2 68 6 71 11 L73 14 C77 15 79 18 79 22 L79 26 C79 28 77 30 75 30 L2 30 C1 30 0 28 0 26 L0 23 C0 21 2 19 4 19 Z" fill="#2563EB" />
                <path d="M27 10 L35 5 L45 5 L45 10 Z" fill="#BFDBFE" /><path d="M48 5 L57 5 C60 5 63 7 66 10 L48 10 Z" fill="#BFDBFE" />
                <text fill="#FFFFFF" fontSize="7" fontWeight="700" x="28" y="22">GoRide</text>
                <circle cx="18" cy="30" fill="#1E293B" r="7" /><circle cx="18" cy="30" fill="#CBD5E1" r="3" />
                <circle cx="62" cy="30" fill="#1E293B" r="7" /><circle cx="62" cy="30" fill="#CBD5E1" r="3" />
              </g>
            </svg>
            <div className="absolute bottom-1 left-5 flex items-center gap-2.5 rounded-xl border border-blue-100 bg-white/95 px-3.5 py-2 shadow-md">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">{isAuthenticated ? <ShieldCheck className="h-4 w-4" /> : "✓"}</div>
              <div className="leading-tight">
                <p className="text-xs font-bold text-slate-800">{isAuthenticated ? user?.fullName || "Thành viên GoRide" : "Tài xế đã sẵn sàng"}</p>
                <p className="text-[10px] text-slate-500">{isAuthenticated ? "Sẵn sàng cho hành trình tiếp theo" : "Chỉ 3 phút để kết nối"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* BÊN PHẢI: FORM ĐẶT XE */}
        <div id="booking-card" className="min-w-0 scroll-mt-24 lg:col-span-5">
          <BookingCard />
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
