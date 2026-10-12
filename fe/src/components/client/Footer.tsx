import { Link } from "react-router";

const Footer = () => {
  return (
    <footer
      className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800"
      id="support"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0050c8] flex items-center justify-center text-white font-bold text-sm">
                G
              </div>
              <span className="text-xl font-black text-white">GoRide</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Nền tảng công nghệ kết nối hành khách và đối tác tài xế thông
              minh, đảm bảo quy trình rõ ràng, minh bạch chi phí và an tâm di
              chuyển.
            </p>
            <div className="text-xs text-slate-500 space-y-1">
              <p>
                Hotline hỗ trợ:{" "}
                <strong className="text-slate-300">1900 8888</strong> (24/7)
              </p>
              <p>
                Email:{" "}
                <strong className="text-slate-300">cskh@goride.vn</strong>
              </p>
            </div>
          </div>

          {/* Điều hướng */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Điều hướng
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="hover:text-white transition-colors"
                >
                  Dịch vụ
                </Link>
              </li>
              <li>
                <Link
                  to="/fares"
                  className="hover:text-white transition-colors"
                >
                  Bảng giá
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  Hỗ trợ
                </Link>
              </li>
            </ul>
          </div>

          {/* Kênh hỗ trợ */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Kênh hỗ trợ
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  Trung tâm trợ giúp FAQ
                </Link>
              </li>
              <li>
                <a
                  href="tel:19008888"
                  className="hover:text-white transition-colors"
                >
                  Hotline 1900 8888
                </a>
              </li>
              <li>
                <a
                  href="https://zalo.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Kênh chat Zalo Official
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Cộng đồng GoRide
                </a>
              </li>
            </ul>
          </div>

          {/* Chính sách & Pháp lý */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Chính sách & Pháp lý
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  to="/terms"
                  className="hover:text-white transition-colors"
                >
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-white transition-colors"
                >
                  Chính sách bảo mật dữ liệu
                </Link>
              </li>
              <li>
                <Link
                  to="/operating-regulations"
                  className="hover:text-white transition-colors"
                >
                  Quy chế hoạt động sàn
                </Link>
              </li>
              <li>
                <Link
                  to="/complaint-resolution"
                  className="hover:text-white transition-colors"
                >
                  Quy trình giải quyết khiếu nại
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="mt-10 md:mt-12 pt-6 md:pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4 text-center sm:text-left">
          <p>
            © 2026 GoRide Vietnam — Project Software Engineering Deliverable.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-300 text-white font-medium">
              Tiếng Việt (VN)
            </a>
            <a href="#" className="hover:text-slate-400 transition-colors">
              English (US)
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
