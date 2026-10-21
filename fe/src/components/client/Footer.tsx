import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const linkClass =
    "block w-fit text-sm leading-6 text-slate-400 no-underline transition-all duration-200 hover:translate-x-1 hover:text-blue-400 hover:no-underline";

  const headingClass =
    "mb-5 text-sm font-bold uppercase tracking-wide text-white";

  return (
    <footer
      id="support"
      className="relative w-full overflow-hidden bg-[#101a2e] text-white"
    >
      <div className="mx-auto w-full px-5 sm:px-8 lg:px-12">
        {/* Nội dung chính */}
        <div className="grid grid-cols-1 gap-9 py-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_0.9fr_1fr] lg:gap-12 lg:py-12">
          {/* Thông tin thương hiệu */}
          <div className="min-w-0">
            <Link
              to="/"
              aria-label="GoRide - Trang chủ"
              className="group mb-4 inline-flex items-center gap-2 no-underline hover:no-underline"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2167f5] text-xs font-extrabold text-white shadow-md shadow-blue-500/20 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:bg-blue-500">
                G
              </span>

              <span className="text-xl font-extrabold tracking-tight text-white">
                GoRide
              </span>

              <span className="ml-1 rounded-full border border-slate-600/60 bg-slate-700/50 px-2 py-1 text-[9px] font-semibold text-slate-300">
                Customer Web
              </span>
            </Link>

            <p className="max-w-md text-sm leading-6 text-slate-400">
              Nền tảng công nghệ kết nối hành khách và đối tác tài xế thông
              minh, đảm bảo quy trình rõ ràng, minh bạch chi phí và an tâm
              di chuyển.
            </p>

            <div className="mt-4 space-y-2 text-xs leading-5 text-slate-400">
              <p>
                Hotline hỗ trợ kỹ thuật:{" "}
                <a
                  href="tel:19008888"
                  className="font-semibold text-slate-300 no-underline transition-colors hover:text-blue-400 hover:no-underline"
                >
                  1900 8888 (placeholder)
                </a>
              </p>

              <p>
                Email hỗ trợ dự án:{" "}
                <a
                  href="mailto:support-project@goride.vn"
                  className="break-all font-semibold text-slate-300 no-underline transition-colors hover:text-blue-400 hover:no-underline"
                >
                  support-project@goride.vn
                </a>
              </p>
            </div>
          </div>

          {/* Điều hướng */}
          <div>
            <h4 className={headingClass}>Điều hướng</h4>

            <ul className="space-y-2.5">
              <li>
                <Link to="/" className={linkClass}>
                  Trang chủ
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
              <li>
                <Link to="/support" className={linkClass}>
                  Hỗ trợ
                </Link>
              </li>
              <li>
                <Link
                  to="/booking"
                  className="block w-fit text-sm leading-6 text-blue-400 no-underline transition-all duration-200 hover:translate-x-1 hover:text-blue-300 hover:no-underline"
                >
                  Đặt xe
                </Link>
              </li>
            </ul>
          </div>

          {/* Kênh hỗ trợ */}
          <div>
            <h4 className={headingClass}>Kênh hỗ trợ</h4>

            <ul className="space-y-2.5">
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
                  Kênh chat Zalo Official
                </a>
              </li>
              <li>
                <a
                  href="mailto:support-project@goride.vn"
                  className={linkClass}
                >
                  Gửi phản hồi dự án
                </a>
              </li>
            </ul>
          </div>

          {/* Chính sách và pháp lý */}
          <div>
            <h4 className={headingClass}>Chính sách &amp; Pháp lý</h4>

            <ul className="space-y-2.5">
              <li>
                <Link to="/terms" className={linkClass}>
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link to="/privacy" className={linkClass}>
                  Chính sách bảo mật dữ liệu
                </Link>
              </li>
              <li>
                <Link to="/operating-regulations" className={linkClass}>
                  Quy chế hoạt động sàn
                </Link>
              </li>
              <li>
                <Link to="/complaint-resolution" className={linkClass}>
                  Quy trình giải quyết khiếu nại
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Đường phân cách và bản quyền */}
        <div className="flex flex-col gap-4 border-t border-slate-700/60 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-xs leading-5 text-slate-500 sm:text-left">
            © {currentYear} GoRide Vietnam - Project Software Engineering
            Deliverable.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-5 text-xs">
            <button
              type="button"
              className="font-semibold text-slate-300 no-underline transition-colors hover:text-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              Tiếng Việt (VN)
            </button>

            <button
              type="button"
              className="font-medium text-slate-500 no-underline transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              English (US)
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
