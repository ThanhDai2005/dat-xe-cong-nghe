import { useState } from "react";
import { Link } from "react-router";
import { Menu, X, Car } from "lucide-react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
        {/* Logo Branding */}
        <Link
          to="/"
          className="flex items-center gap-2 md:gap-2.5 group"
          aria-label="GoRide Trang chủ"
        >
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-tr from-[#0050c8] to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <Car className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.2} />
          </div>
          <span className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
            Go<span className="text-[#0050c8]">Ride</span>
          </span>
        </Link>

        {/* Desktop Navigation Menu */}
        <nav
          className="hidden md:flex items-center gap-6 lg:gap-8"
          aria-label="Thanh điều hướng chính"
        >
          <Link
            to="/"
            className="text-[#0050c8] font-semibold relative text-sm lg:text-base py-1 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-5 after:h-0.5 after:bg-[#0050c8] after:rounded-full"
          >
            Trang chủ
          </Link>

          <Link
            to="/services"
            className="text-slate-600 hover:text-[#0050c8] font-medium text-sm lg:text-base transition-colors"
          >
            Dịch Vụ
          </Link>
          <Link
            to="/fares"
            className="text-slate-600 hover:text-[#0050c8] font-medium text-sm lg:text-base transition-colors"
          >
            Bảng Giá
          </Link>
          <Link
            to="/support"
            className="text-slate-600 hover:text-[#0050c8] font-medium text-sm lg:text-base transition-colors"
          >
            Hỗ trợ
          </Link>
        </nav>

        {/* User Action CTA Buttons - Desktop */}
        <div className="hidden sm:flex items-center gap-3 md:gap-4">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-slate-700 hover:text-[#0050c8] font-medium text-sm lg:text-base px-3 py-2 rounded-lg transition-colors"
          >
            <svg
              className="w-4 h-4 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            Đăng nhập
          </Link>
          <Link
            to="/register"
            className="bg-[#0050c8] hover:bg-[#0040a2] active:bg-[#003580] text-white font-semibold text-sm lg:text-base px-4 md:px-5 py-2 md:py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/30"
          >
            Đăng ký
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden p-2 text-slate-600 rounded-lg hover:bg-slate-100 border border-slate-200"
          aria-label="Mở menu điều hướng"
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            className="block px-3 py-2 text-[#0050c8] font-semibold bg-blue-50/60 rounded-lg"
            onClick={toggleMobileMenu}
          >
            Trang chủ
          </Link>
          <a
            href="#booking-card"
            className="block px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg"
            onClick={toggleMobileMenu}
          >
            Đặt xe
          </a>
          <a
            href="#how-it-works"
            className="block px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg"
            onClick={toggleMobileMenu}
          >
            Hướng dẫn
          </a>
          <a
            href="#services"
            className="block px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg"
            onClick={toggleMobileMenu}
          >
            Dịch vụ
          </a>
          <a
            href="#safety"
            className="block px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg"
            onClick={toggleMobileMenu}
          >
            Hỗ trợ
          </a>
          <div className="pt-4 border-t border-slate-100 flex gap-2">
            <Link
              to="/login"
              className="w-1/2 py-2.5 text-center font-medium text-slate-700 border border-slate-200 rounded-xl"
              onClick={toggleMobileMenu}
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="w-1/2 py-2.5 text-center font-medium text-white bg-[#0050c8] rounded-xl"
              onClick={toggleMobileMenu}
            >
              Đăng ký
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
