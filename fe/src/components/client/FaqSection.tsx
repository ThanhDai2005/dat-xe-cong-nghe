import { useState } from "react";
import {
  ChevronDown,
  MessageCircleQuestion,
} from "lucide-react";

const faqs = [
  {
    q: "Làm thế nào để đặt xe qua website GoRide?",
    a: "Nhập điểm đón, điểm đến, thời gian khởi hành và loại dịch vụ tại khung đặt xe trên trang chủ. Sau đó nhấn nút tiếp tục để kiểm tra thông tin và gửi yêu cầu đặt xe.",
  },
  {
    q: "Giá cước hiển thị trên website có phải là giá cuối cùng không?",
    a: "Giá hiển thị ban đầu là giá ước tính. Giá chính thức được xác định theo lộ trình và biểu phí áp dụng khi hệ thống xác nhận chuyến đi.",
  },
  {
    q: "Tôi có cần tạo tài khoản để đặt xe không?",
    a: "Bạn có thể bắt đầu yêu cầu đặt xe bằng thông tin liên hệ được hệ thống hỗ trợ. Đăng nhập giúp bạn thuận tiện quản lý lịch sử và theo dõi trạng thái chuyến đi.",
  },
  {
    q: "Làm sao để biết tài xế đã nhận chuyến xe của tôi?",
    a: "Sau khi gửi yêu cầu, bạn có thể theo dõi trạng thái xử lý trên hệ thống. Khi có thông tin tài xế, các thông tin liên quan sẽ được hiển thị theo dữ liệu hệ thống cung cấp.",
  },
  {
    q: "Tôi có thể hủy chuyến hoặc thay đổi giờ đón không?",
    a: "Bạn cần kiểm tra trạng thái chuyến đi và các tùy chọn quản lý chuyến trên hệ thống. Nếu không thể tự điều chỉnh, hãy liên hệ bộ phận hỗ trợ GoRide.",
  },
];

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="relative overflow-hidden border-y border-slate-200/70 bg-[#f8fafc] px-4 py-16 sm:px-6 sm:py-20"
    >
      {/* Trang trí nền */}
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-blue-100/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-blue-100/40 blur-3xl" />

      <div className="relative mx-auto w-full max-w-[900px]">
        {/* Tiêu đề */}
        <div className="mb-9 text-center sm:mb-10">
          <span className="mb-2 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#1768ff]">
            <MessageCircleQuestion size={16} />
            Giải đáp thắc mắc
          </span>

          <h2 className="text-3xl font-extrabold tracking-tight text-[#172033] sm:text-4xl">
            Hỗ trợ &amp; Câu hỏi thường gặp
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
            Thông tin chi tiết về việc sử dụng nền tảng GoRide Web.
          </p>
        </div>

        {/* Danh sách câu hỏi */}
        <div className="space-y-3">
          {faqs.map((item, index) => {
            const isOpen = openIndex === index;
            const answerId = `faq-answer-${index}`;

            return (
              <article
                key={item.q}
                className={`group overflow-hidden rounded-xl border bg-white transition-all duration-300 ease-out ${
                  isOpen
                    ? "border-blue-200 shadow-md shadow-blue-900/[0.04]"
                    : "border-slate-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md hover:shadow-blue-900/[0.04]"
                }`}
              >
                <button
                  type="button"
                  className="flex min-h-[56px] w-full items-center justify-between gap-4 px-4 py-3.5 text-left sm:min-h-[60px] sm:px-5"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() =>
                    setOpenIndex(isOpen ? null : index)
                  }
                >
                  <span className="min-w-0 flex-1 text-sm font-bold leading-6 text-[#172033] transition-colors duration-200 group-hover:text-[#1768ff] sm:text-base">
                    {item.q}
                  </span>

                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                      isOpen
                        ? "rotate-180 bg-blue-50 text-[#1768ff]"
                        : "rotate-0 text-slate-400 group-hover:bg-blue-50 group-hover:text-[#1768ff]"
                    }`}
                  >
                    <ChevronDown size={19} strokeWidth={1.8} />
                  </span>
                </button>

                {/* Câu trả lời có hiệu ứng mở/đóng */}
                <div
                  id={answerId}
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                  aria-hidden={!isOpen}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="mx-4 border-t border-slate-100 sm:mx-5">
                      <p className="py-4 text-sm leading-7 text-slate-600 sm:text-base">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;