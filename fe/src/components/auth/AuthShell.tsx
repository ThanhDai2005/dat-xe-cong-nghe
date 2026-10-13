import type { ComponentType, ReactNode } from "react";
import { Link } from "react-router";

interface AuthShellProps {
  badge: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  footerIcon: ComponentType<{ className?: string }>;
  footerTitle: string;
  footerDesc: string;
  /** Cụm avatar tròn xếp chồng bên phải khung dưới (vd HN, SG, ĐN) */
  footerAvatars?: { label: string; className: string }[];
  children: ReactNode;
}

/** Khung 2 cột dùng chung cho các màn Auth (theo thiết kế Stitch). */
export const AuthShell = ({
  badge, title, description, icon: Icon,
  footerIcon: FooterIcon, footerTitle, footerDesc, footerAvatars, children,
}: AuthShellProps) => (
  <div className="min-h-screen flex flex-col justify-between bg-[#faf8ff] text-[#131b2e] antialiased">
    <main className="flex-1 flex items-center justify-center px-5 py-9">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 rounded-2xl overflow-hidden bg-white shadow-[0_20px_40px_-12px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.04)] min-h-[660px]">
        {/* Brand panel */}
        <div
          className="lg:col-span-5 relative overflow-hidden p-8 lg:p-10 flex flex-col justify-between text-white"
          style={{ background: "linear-gradient(150deg,#094099 0%,#1d68f2 60%,#062b69 100%)" }}
        >
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm uppercase">
              {badge}
            </span>
            <h2 className="mt-4 mb-3 text-3xl lg:text-4xl font-bold leading-tight tracking-tight [text-shadow:0_2px_4px_rgba(0,0,0,0.15)]">
              {title}
            </h2>
            <p className="text-[15px] text-white/90 max-w-sm leading-relaxed">{description}</p>
          </div>

          <div className="relative z-10 my-8 flex justify-center">
            <div className="relative w-52 h-52 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-white/10 animate-pulse" />
              <div className="absolute inset-8 rounded-full bg-white/15 backdrop-blur-sm" />
              <div className="relative w-24 h-24 rounded-3xl bg-white text-[#0050c8] flex items-center justify-center shadow-2xl">
                <Icon className="w-12 h-12" />
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between gap-3 p-4 rounded-xl bg-white/15 border border-white/25 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <FooterIcon className="w-[22px] h-[22px]" />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">{footerTitle}</p>
                <p className="text-[11px] text-white/90 mt-0.5">{footerDesc}</p>
              </div>
            </div>
            {footerAvatars && (
              <div className="hidden sm:flex -space-x-2 shrink-0">
                {footerAvatars.map((a) => (
                  <span key={a.label}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-sm border border-white/30 ${a.className}`}>
                    {a.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Form panel */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white">
          <div className="w-full max-w-md mx-auto my-auto">{children}</div>
          <div className="pt-4 mt-4 flex items-center justify-between text-[13px] text-[#737686]">
            <Link to="/privacy" className="hover:text-[#0050c8]">Chính sách bảo mật</Link>
            <Link to="/terms" className="hover:text-[#0050c8]">Điều khoản sử dụng</Link>
            <Link to="/faq" className="hover:text-[#0050c8]">Trợ giúp</Link>
          </div>
        </div>
      </div>
    </main>
    <footer className="py-6 px-5 text-center text-[13px] text-[#424655]">
      © 2026 GoRide Technology Platform. Giữ toàn quyền bảo lưu.
    </footer>
  </div>
);
