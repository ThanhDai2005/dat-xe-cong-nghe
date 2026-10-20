import { useEffect, useState } from "react";
import {
  MessageCircle,
  Phone,
  Headset,
  Plane,
  CarFront,
  X,
} from "lucide-react";

const STORAGE_KEY = "floating-contact-open";

function getInitialOpen(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      return saved === "1";
    }
  } catch {
    // Dùng trạng thái mặc định nếu localStorage không khả dụng
  }

  // Máy tính mở sẵn, điện thoại mặc định thu gọn
  return !window.matchMedia("(max-width: 768px)").matches;
}

export default function FloatingContact() {
  // Thay bằng thông tin liên hệ thực tế
  const zaloUrl = "https://zalo.me/SDT_CUA_BAN";
  const messengerUrl = "https://m.me/FACEBOOK_PAGE_ID";
  const phoneNumber = "0900000000";

  const [open, setOpen] = useState<boolean>(getInitialOpen);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, open ? "1" : "0");
    } catch {
      // Bỏ qua nếu không lưu được trạng thái
    }
  }, [open]);

  const items = [
    {
      label: "Tài xế",
      href: "#driver",
      icon: CarFront,
    },
    {
      label: "Đặt xe",
      href: "#booking",
      icon: Plane,
    },
    {
      label: "Liên hệ",
      href: "/contact",
      icon: Headset,
    },
  ];

  return (
    <>
      {/* THANH LIÊN HỆ DỌC */}
      <aside
        id="floating-contact-panel"
        aria-label="Liên hệ nhanh"
        aria-hidden={!open}
        inert={!open}
        className={`fixed right-3 top-1/2 z-[999] flex w-[70px]
          -translate-y-1/2 flex-col items-center gap-1
          rounded-[24px] border border-[#ece4f7] bg-white
          px-1.5 py-2 shadow-[0_18px_45px_rgba(53,32,75,0.16)]
          transition-all duration-300 ease-out sm:right-4
          ${
            open
              ? "visible translate-x-0 opacity-100"
              : "invisible pointer-events-none translate-x-6 opacity-0"
          }`}
      >
        {/* TÀI XẾ, ĐẶT XE, LIÊN HỆ */}
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <a
              key={item.label}
              href={item.href}
              aria-label={item.label}
              title={item.label}
              className="group flex w-full flex-col items-center
                justify-center gap-1 rounded-2xl px-1 py-2.5
                !no-underline transition-all duration-200
                hover:bg-[#f2eaff] active:scale-95"
            >
              <Icon
                size={22}
                strokeWidth={2}
                className="text-[#6035a5] transition-transform
                  duration-200 group-hover:scale-110"
              />

              <span className="text-[11px] font-semibold leading-4
                text-[#4a4158] group-hover:text-[#6035a5]">
                {item.label}
              </span>
            </a>
          );
        })}

        {/* HOTLINE */}
        <a
          href={`tel:${phoneNumber}`}
          aria-label="Gọi hotline"
          title="Hotline"
          className="group flex min-h-[58px] w-full flex-col
            items-center justify-center gap-1 rounded-2xl
            bg-gradient-to-br from-[#ffa25f] to-[#ff8a3d]
            px-1 py-2 text-white !no-underline
            shadow-[0_8px_18px_rgba(255,138,61,0.35)]
            transition-all duration-200 hover:-translate-y-0.5
            hover:from-[#ff964c] hover:to-[#f07423]
            hover:shadow-lg active:scale-95"
        >
          <Phone
            size={22}
            strokeWidth={2}
            className="animate-[floating-ring_2.4s_ease-in-out_infinite]"
          />

          <span className="text-[11px] font-bold leading-4">
            Hotline
          </span>
        </a>

        {/* ZALO VÀ MESSENGER */}
        <div className="mt-1 flex w-full flex-col items-center
          gap-2 border-t border-[#ece4f7] pt-2.5">
          <a
            href={zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat qua Zalo"
            title="Chat Zalo"
            className="flex h-11 w-11 items-center justify-center
              rounded-full bg-[#0068ff] text-[13px] font-extrabold
              tracking-tight text-white !no-underline
              shadow-[0_6px_16px_rgba(38,39,70,0.16)]
              transition-all duration-200 hover:scale-105
              hover:shadow-lg active:scale-95"
          >
            Zalo
          </a>

          <a
            href={messengerUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat qua Messenger"
            title="Chat Messenger"
            className="flex h-11 w-11 items-center justify-center
              rounded-full bg-gradient-to-br from-[#0a7cff]
              to-[#a334fa] text-white !no-underline
              shadow-[0_6px_16px_rgba(38,39,70,0.16)]
              transition-all duration-200 hover:scale-105
              hover:shadow-lg active:scale-95"
          >
            <MessageCircle size={23} strokeWidth={2.2} />
          </a>
        </div>

        {/* NÚT ĐÓNG */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Ẩn liên hệ nhanh"
          aria-controls="floating-contact-panel"
          title="Ẩn"
          className="mt-1 flex h-8 w-8 items-center justify-center
            rounded-full border-0 bg-[#f4f1f8] text-[#8a8199]
            transition-all duration-200 hover:rotate-90
            hover:bg-[#f2eaff] hover:text-[#6035a5]
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-[#cbb6ed] active:scale-90"
        >
          <X size={16} />
        </button>
      </aside>

      {/* NÚT MỞ KHI ĐÃ ẨN */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Mở liên hệ nhanh"
        aria-controls="floating-contact-panel"
        aria-expanded={open}
        tabIndex={open ? -1 : 0}
        title="Liên hệ nhanh"
        className={`fixed bottom-6 right-4 z-[999] flex h-14 w-14
          items-center justify-center rounded-full
          bg-gradient-to-br from-[#7a4bc6] to-[#6035a5]
          text-white shadow-[0_14px_32px_rgba(96,53,165,0.4)]
          transition-all duration-300 hover:-translate-y-1
          hover:scale-105 hover:shadow-xl active:scale-95
          ${
            open
              ? "pointer-events-none scale-75 opacity-0"
              : "pointer-events-auto scale-100 opacity-100"
          }`}
      >
        <Headset size={26} />

        <span
          className="absolute inset-0 rounded-full border-2
            border-[#8b5fd6] motion-safe:animate-ping"
          aria-hidden="true"
        />
      </button>

      {/* ANIMATION CHO ICON HOTLINE */}
      <style>{`
        @keyframes floating-ring {
          0%, 70%, 100% { transform: rotate(0); }
          75% { transform: rotate(-14deg); }
          80% { transform: rotate(12deg); }
          85% { transform: rotate(-8deg); }
          90% { transform: rotate(6deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .floating-contact-no-motion {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
}