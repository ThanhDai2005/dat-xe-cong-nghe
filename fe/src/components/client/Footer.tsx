import { Link } from "react-router-dom";
import {
  CarFront,
  Phone,
  Mail,
  ArrowUpRight,
  ShieldCheck,
  MapPin,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const linkClass =
    "inline-flex items-center gap-1 text-sm text-slate-300 no-underline transition-all duration-200 hover:translate-x-1 hover:text-green-400";

  const columnTitleClass =
    "mb-5 text-base font-bold text-white";

  return (
    <footer
      id="support"
      className="relative overflow-hidden bg-slate-950 text-white"
    >
      {/* Hiệu ứng nền */}
      <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-green-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        {/* THÔNG TIN FOOTER */}
        <div className="grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12 lg:py-16">
          {/* THƯƠNG HIỆU */}
          <div className="lg:col-span-1">
            <Link
              to="/"
              aria-label="GoRide - Trang chủ"
              className="group mb-5 inline-flex items-center gap-3 no-underline"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500 text-white shadow-lg shadow-green-500/20 transition-all duration-300 group-hover:rotate-[-5deg] group-hover:scale-105 group-hover:bg-green-400">
                <CarFront size={26} strokeWidth={2.5} />
              </span>

              <span className="text-3xl font-extrabold tracking-tight text-white">
                Go<span className="text-green-400">Ride</span>
              </span>
            </Link>

            <p className="mb-6 max-w-sm text-sm leading-7 text-slate-400">
              Nền tảng công nghệ kết nối hành khách và đối tác tài xế
              thông minh, mang đến hành trình an toàn, minh bạch chi phí
              và trải nghiệm di chuyển thuận tiện.
            </p>

            {/* THÔNG TIN LIÊN HỆ */}
            <div className="space-y-4">
              <a
                href="tel:19008888"
                className="group flex items-center gap-3 no-underline"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-green-400 transition-all duration-200 group-hover:border-green-500/40 group-hover:bg-green-500/10">
                  <Phone size={18} />
                </span>

                <span className="flex flex-col gap-1">
                  <span className="text-xs text-slate-400">
                    Hotline hỗ trợ (24/7)
                  </span>
                  <span className="text-sm font-bold text-white transition-colors group-hover:text-green-400">
                    1900 8888
                  </span>
                </span>
              </a>

              <a
                href="mailto:cskh@goride.vn"
                className="group flex items-center gap-3 no-underline"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-green-400 transition-all duration-200 group-hover:border-green-500/40 group-hover:bg-green-500/10">
                  <Mail size={18} />
                </span>

                <span className="flex min-w-0 flex-col gap-1">
                  <span className="text-xs text-slate-400">
                    Email hỗ trợ
                  </span>
                  <span className="break-all text-sm font-bold text-white transition-colors group-hover:text-green-400">
                    cskh@goride.vn
                  </span>
                </span>
              </a>
            </div>
          </div>

          {/* ĐIỀU HƯỚNG */}
          <div>
            <h4 className={columnTitleClass}>Điều hướng</h4>

            <ul className="space-y-4">
              <li>
                <Link to="/" className={linkClass}>
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/booking" className={linkClass}>
                  Đặt xe ngay
                </Link>
              </li>
              <li>
                <Link to="/services" className={linkClass}>
                  Dịch vụ
                </Link>
              </li>
              <li>
                <Link to="/fares" className={linkClass}>
                  Bảng giá
                </Link>
              </li>
            </ul>
          </div>

          {/* KÊNH HỖ TRỢ */}
          <div>
            <h4 className={columnTitleClass}>Kênh hỗ trợ</h4>

            <ul className="space-y-4">
              <li>
                <Link to="/faq" className={linkClass}>
                  Trung tâm trợ giúp FAQ
                </Link>
              </li>
              <li>
                <a href="tel:19008888" className={linkClass}>
                  Hotline 1900 8888
                </a>
              </li>
              <li>
                <a
                  href="https://zalo.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  Chat qua Zalo
                  <ArrowUpRight size={14} />
                </a>
              </li>
              <li>
                <a href="mailto:cskh@goride.vn" className={linkClass}>
                  Gửi email hỗ trợ
                </a>
              </li>
            </ul>
          </div>

          {/* CHÍNH SÁCH */}
          <div>
            <h4 className={columnTitleClass}>Chính sách &amp; Pháp lý</h4>

            <ul className="space-y-4">
              <li>
                <Link to="/terms" className={linkClass}>
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link to="/privacy" className={linkClass}>
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link to="/operating-regulations" className={linkClass}>
                  Quy chế hoạt động
                </Link>
              </li>
              <li>
                <Link to="/complaint-resolution" className={linkClass}>
                  Giải quyết khiếu nại
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* THÔNG ĐIỆP THƯƠNG HIỆU */}
        <div className="mb-8 flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-500/15 text-green-400">
              <ShieldCheck size={25} />
            </span>

            <div>
              <strong className="text-base font-bold text-white sm:text-lg">
                An tâm trên mọi hành trình
              </strong>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                Minh bạch chi phí · Hỗ trợ tận tâm · Di chuyển thuận tiện
              </p>
            </div>
          </div>

          <Link
            to="/booking"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-3 text-sm font-bold text-white no-underline shadow-lg shadow-green-500/20 transition-all duration-300 hover:-translate-y-1 hover:bg-green-400 hover:shadow-xl hover:shadow-green-500/20 active:translate-y-0 sm:w-fit"
          >
            Đặt xe ngay
            <ArrowUpRight size={18} />
          </Link>
        </div>

        {/* FOOTER CUỐI TRANG */}
        <div className="flex flex-col gap-4 border-t border-white/10 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-xs leading-6 text-slate-500 sm:text-left sm:text-sm">
            © {currentYear} GoRide Vietnam. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-slate-400 sm:text-sm">
            <span className="inline-flex items-center gap-2">
              <MapPin size={15} className="text-green-400" />
              Việt Nam
            </span>

            <span className="h-4 w-px bg-white/15" />

            <span className="transition-colors hover:text-green-400">
              Tiếng Việt (VN)
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
