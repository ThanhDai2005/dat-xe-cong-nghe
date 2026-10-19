
import { Link } from "react-router";
import BookingCard from "@/components/client/BookingCard";
import {
  ArrowRight,
  Phone,
  CheckCircle,
  Sparkles,
  User,
  ShieldCheck,
  CarFront,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const HeroBanner = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <section
      className="relative isolate overflow-hidden py-6 sm:py-8 lg:py-12"
      style={{
        background:
          "radial-gradient(circle at 68% 35%, rgba(0, 177, 79, 0.10) 0%, rgba(233, 248, 239, 0.55) 38%, #ffffff 100%)",
      }}
    >
      {/* Hiệu ứng trang trí nền */}
      <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-emerald-100/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-green-50/70 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:gap-10">
          {/* ================================================== */}
          {/* HÀNG 1: GIỚI THIỆU NẰM NGANG PHÍA TRÊN */}
          {/* ================================================== */}
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
            {/* CỘT TRÁI: NỘI DUNG GIỚI THIỆU */}
            <div className="min-w-0 space-y-4 lg:col-span-7 lg:space-y-5">
              {/* Badge chào mừng */}
              {isAuthenticated ? (
                <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-[#008F40] sm:text-sm">
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#00B14F]" />
                  <span className="truncate">
                    Chào mừng trở lại, {user?.fullName || "Bạn"}!
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-[#008F40] sm:text-sm">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#00B14F]" />
                  <span>Di chuyển thông minh mỗi ngày</span>
                </div>
              )}

              {/* Tiêu đề và mô tả */}
              <div className="space-y-3">
                {isAuthenticated ? (
                  <>
                    <h1 className="text-3xl font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-4xl xl:text-5xl">
                      Sẵn sàng cho hành trình?
                      <br />
                      <span className="text-[#00B14F]">
                        Đặt xe chỉ trong 30 giây.
                      </span>
                    </h1>

                    <p className="max-w-lg text-sm font-normal leading-relaxed text-slate-600 sm:text-base">
                      Tài xế GoRide gần nhất đang sẵn sàng phục vụ bạn. Nhập
                      điểm đón và điểm đến để nhận lộ trình tối ưu cùng ưu đãi
                      cước phí tốt nhất.
                    </p>
                  </>
                ) : (
                  <>
                    <h1 className="text-3xl font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-4xl xl:text-5xl">
                      Đặt xe nhanh chóng.
                      <br />
                      <span className="text-[#00B14F]">
                        Di chuyển dễ dàng.
                      </span>
                    </h1>

                    <p className="max-w-lg text-sm font-normal leading-relaxed text-slate-600 sm:text-base">
                      Kết nối với tài xế phù hợp chỉ trong vài thao tác.
                      Minh bạch giá cước, thuận tiện di chuyển và đảm bảo
                      an tâm trên mọi hành trình.
                    </p>
                  </>
                )}
              </div>

              {/* Nút hành động */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href="#booking-card"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00B14F] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#008F40] hover:shadow-emerald-500/35 sm:text-base"
                >
                  Đặt xe ngay
                  <ArrowRight className="h-4 w-4" />
                </a>

                {isAuthenticated ? (
                  <Link
                    to="/profile"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50 sm:text-base"
                  >
                    <User className="h-4 w-4 text-[#00B14F]" />
                    Hồ sơ của tôi
                  </Link>
                ) : (
                  <a
                    href="#support"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50 sm:text-base"
                  >
                    <Phone className="h-4 w-4 text-[#00B14F]" />
                    Liên hệ hỗ trợ
                  </a>
                )}
              </div>

              {/* Cam kết dịch vụ */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 shrink-0 text-[#00B14F]" />
                  <span>
                    {isAuthenticated ? "Ưu đãi thành viên" : "Không phí ẩn"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 shrink-0 text-[#00B14F]" />
                  <span>Tài xế xác minh</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 shrink-0 text-[#00B14F]" />
                  <span>Hỗ trợ 24/7</span>
                </div>
              </div>

              {/* Hình minh họa xe */}
              <div className="relative hidden h-32 w-full max-w-md select-none pt-2 sm:block">
                <svg
                  className="h-full w-full"
                  fill="none"
                  viewBox="0 0 500 130"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-label="Minh họa xe GoRide trên đường"
                  role="img"
                >
                  {/* Đường giao thông */}
                  <path
                    d="M-20 100 L520 50"
                    stroke="#FFFFFF"
                    strokeLinecap="round"
                    strokeWidth="48"
                  />

                  <path
                    d="M-20 100 L520 50"
                    stroke="#DCE8DF"
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
                    stroke="#DCE8DF"
                    strokeDasharray="8 6"
                    strokeWidth="2"
                  />

                  {/* Điểm đón */}
                  <circle cx="190" cy="45" fill="#D1FAE5" r="7" />
                  <circle cx="190" cy="45" fill="#00B14F" r="3.5" />

                  {/* Điểm đến */}
                  <circle cx="300" cy="90" fill="#D1FAE5" r="7" />
                  <circle cx="300" cy="90" fill="#008F40" r="3.5" />

                  {/* Xe GoRide */}
                  <g transform="translate(215, 55)">
                    <ellipse
                      cx="38"
                      cy="34"
                      fill="#A7B8AC"
                      opacity="0.45"
                      rx="35"
                      ry="6"
                    />

                    <path
                      d="M4 19 C4 14 8 11 15 11 L25 11 C29 6 35 2 44 2 L56 2 C63 2 68 6 71 11 L73 14 C77 15 79 18 79 22 L79 26 C79 28 77 30 75 30 L2 30 C1 30 0 28 0 26 L0 23 C0 21 2 19 4 19 Z"
                      fill="#00B14F"
                    />

                    <path
                      d="M27 10 L35 5 L45 5 L45 10 Z"
                      fill="#A7F3D0"
                    />

                    <path
                      d="M48 5 L57 5 C60 5 63 7 66 10 L48 10 Z"
                      fill="#A7F3D0"
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

                    <circle cx="18" cy="30" fill="#26332A" r="7" />
                    <circle cx="18" cy="30" fill="#A7B8AC" r="3" />

                    <circle cx="62" cy="30" fill="#26332A" r="7" />
                    <circle cx="62" cy="30" fill="#A7B8AC" r="3" />
                  </g>
                </svg>

                {/* Thẻ trạng thái tài xế */}
                <div className="absolute bottom-2 left-6 flex items-center gap-2.5 rounded-xl border border-emerald-100 bg-white/95 px-3.5 py-2 shadow-md">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-[#008F40]">
                    {isAuthenticated ? (
                      <ShieldCheck className="h-4 w-4" />
                    ) : (
                      "✓"
                    )}
                  </div>

                  <div className="leading-tight">
                    <p className="text-xs font-bold text-slate-800">
                      {isAuthenticated
                        ? user?.fullName || "Thành viên thân thiết"
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

            {/* CỘT PHẢI: THẺ THÔNG TIN BỔ SUNG */}
            <div className="hidden min-w-0 lg:col-span-5 lg:block">
              <div className="rounded-3xl border border-emerald-100 bg-white/85 p-6 shadow-sm shadow-emerald-900/5 xl:p-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#00B14F]">
                  <CarFront className="h-6 w-6" />
                </div>

                <h2 className="text-xl font-bold text-slate-900 xl:text-2xl">
                  GoRide – Đặt xe dễ dàng
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Chọn tuyến đường, số ghế và tìm chuyến phù hợp với hành
                  trình của bạn.
                </p>

                <div className="mt-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#00B14F]">
                      <MapPinIcon />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Hành trình rõ ràng
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Nhập điểm đón và điểm đến của bạn.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#00B14F]">
                      <User className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Chọn số ghế linh hoạt
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Tìm chuyến có đủ số ghế bạn cần.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#00B14F]">
                      <CheckCircle className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Chọn chuyến phù hợp
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Xem thời gian khởi hành và giá tham khảo.
                      </p>
                    </div>
                  </div>
                </div>

                <a
                  href="#booking-card"
                  className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#00B14F] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#008F40]"
                >
                  Bắt đầu đặt xe
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* ================================================== */}
          {/* HÀNG 2: FORM ĐẶT XE NẰM NGANG PHÍA DƯỚI */}
          {/* ================================================== */}
          <div
            id="booking-card"
            className="w-full min-w-0 scroll-mt-24"
          >
            <BookingCard />
          </div>
        </div>
      </div>
    </section>
  );
};

const MapPinIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export default HeroBanner;
