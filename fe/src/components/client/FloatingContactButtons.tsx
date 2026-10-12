import { Phone, MessageCircle } from "lucide-react";

const FloatingContactButtons = () => {
  return (
    <aside
      className="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-50 flex flex-col items-end gap-2 md:gap-2.5"
      aria-label="Kênh liên hệ nhanh"
    >
      {/* Zalo Widget */}
      <a
        href="https://zalo.me"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-1.5 md:gap-2 bg-white hover:bg-blue-50 text-slate-800 font-semibold text-xs py-1.5 md:py-2 px-3 md:px-3.5 rounded-full shadow-lg border border-slate-150 transition-all hover:scale-105"
        title="Chat qua Zalo"
      >
        <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-[9px] md:text-[10px] tracking-tighter">
          Zalo
        </span>
        <span className="hidden sm:inline">Zalo</span>
      </a>

      {/* Hotline Widget */}
      <a
        href="tel:19008888"
        className="group flex items-center gap-1.5 md:gap-2 bg-white hover:bg-blue-50 text-slate-800 font-semibold text-xs py-1.5 md:py-2 px-3 md:px-3.5 rounded-full shadow-lg border border-slate-150 transition-all hover:scale-105"
        title="Gọi Tổng đài CSKH"
      >
        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-blue-500 text-white flex items-center justify-center">
          <Phone className="w-3 h-3 md:w-3.5 md:h-3.5" />
        </div>
        <span className="hidden sm:inline">Tổng đài CSKH</span>
      </a>

      {/* AI Assistant */}
      <button
        onClick={() =>
          alert(
            "Trợ lý AI GoRide luôn sẵn sàng hỗ trợ tư vấn lộ trình và đặt chuyến!"
          )
        }
        className="group flex items-center gap-1.5 md:gap-2 bg-[#0050c8] hover:bg-[#0040a2] text-white font-semibold text-xs py-1.5 md:py-2 px-3 md:px-4 rounded-full shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
        title="Mở Trợ lý ảo AI"
      >
        <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
        <span className="hidden sm:inline">Hỗ trợ AI</span>
      </button>
    </aside>
  );
};

export default FloatingContactButtons;
