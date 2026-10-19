
import { useState } from "react";
import {
  ChevronDown,
  MessageCircleQuestion,
  ShieldCheck,
  Clock3,
  CircleHelp,
  ArrowUpRight,
} from "lucide-react";

const faqs = [
  {
    q: "Làm thế nào để đặt xe qua website GoRide?",
    a: "Nhập điểm đón, điểm đến, thời gian khởi hành và loại dịch vụ tại khung “Khởi tạo chuyến đi” trên trang chủ. Sau đó nhấn “Tiếp tục đặt xe” để hoàn thiện và gửi yêu cầu.",
  },
  {
    q: "Giá cước hiển thị trên website có phải là giá cuối cùng không?",
    a: "Giá ước tính giúp tham khảo. Giá chính thức hiển thị khi hệ thống xác nhận lộ trình và cấu hình biểu phí thực tế. GoRide cam kết không phát sinh phụ phí ẩn.",
  },
  {
    q: "Tôi có cần tạo tài khoản để đặt xe không?",
    a: "Bạn có thể khởi tạo chuyến bằng số điện thoại. Đăng nhập tài khoản giúp quản lý lịch sử, lưu địa chỉ thân quen và nhận thông báo trạng thái tức thời.",
  },
  {
    q: "Làm sao để biết tài xế đã nhận chuyến?",
    a: "Sau khi gửi yêu cầu, màn hình quản lý hành trình hiển thị trạng thái tìm kiếm. Khi có tài xế nhận, hệ thống hiển thị biển số, tên tài xế và vị trí phương tiện.",
  },
  {
    q: "Tôi có thể hủy chuyến hoặc thay đổi giờ đón không?",
    a: "Bạn có thể hủy hoặc điều chỉnh trước khi tài xế bắt đầu di chuyển đến điểm đón qua giao diện quản lý chuyến hoặc liên hệ tổng đài hỗ trợ.",
  },
];

const FaqSection = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="relative overflow-hidden bg-gradient-to-b from-white via-green-50/40 to-white py-16 sm:py-20 lg:py-24"
    >
      {/* Trang trí nền */}
      <div className="pointer-events-none absolute -right-32 top-20 h-72 w-72 rounded-full bg-green-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -left-32 bottom-10 h-72 w-72 rounded-full bg-emerald-100/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          {/* Phần tiêu đề */}
          <div className="lg:sticky lg:top-28">
            <span className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-4 py-2 text-xs font-bold tracking-wider text-green-700">
              <MessageCircleQuestion size={16} />
              GIẢI ĐÁP THẮC MẮC
            </span>

            <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              Bạn cần hỗ trợ?
              <span className="mt-2 block text-green-600">
                Chúng tôi luôn sẵn sàng.
              </span>
            </h2>

            <p className="mt-5 max-w-lg text-base leading-7 text-gray-500">
              Tìm câu trả lời cho những thắc mắc thường gặp
              khi sử dụng dịch vụ đặt xe GoRide.
            </p>

            {/* Điểm nổi bật */}
            <div className="mt-7 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
                <ShieldCheck size={19} className="text-green-600" />
                <span className="text-sm font-semibold text-gray-700">
                  An toàn, minh bạch
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
                <Clock3 size={19} className="text-green-600" />
                <span className="text-sm font-semibold text-gray-700">
                  Hỗ trợ nhanh chóng
                </span>
              </div>
            </div>

            {/* Minh họa hỗ trợ */}
            <div className="mt-8 hidden items-center gap-4 rounded-2xl border border-green-100 bg-white/80 p-5 shadow-sm sm:flex">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-600">
                <MessageCircleQuestion size={25} />
              </div>
              <div>
                <p className="font-bold text-gray-800">
                  Luôn đồng hành cùng bạn
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  GoRide hỗ trợ bạn trong mỗi hành trình.
                </p>
              </div>
            </div>
          </div>

          {/* Danh sách câu hỏi */}
          <div className="space-y-3">
            {faqs.map((item, index) => {
              const isOpen = open === index;
              const answerId = `goride-faq-answer-${index}`;
              const questionId = `goride-faq-question-${index}`;

              return (
                <article
                  key={item.q}
                  className={`overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${
                    isOpen
                      ? "border-green-200 shadow-lg shadow-green-900/5"
                      : "border-gray-100 shadow-sm hover:border-green-200 hover:shadow-md"
                  }`}
                >
                  <button
                    type="button"
                    id={questionId}
                    className="flex w-full items-center gap-3 p-4 text-left sm:gap-4 sm:p-5"
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() => setOpen(isOpen ? null : index)}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold transition-colors ${
                        isOpen
                          ? "bg-green-600 text-white"
                          : "bg-green-50 text-green-700"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span
                      className={`flex-1 text-sm font-bold leading-6 sm:text-base ${
                        isOpen ? "text-green-700" : "text-gray-800"
                      }`}
                    >
                      {item.q}
                    </span>

                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                        isOpen
                          ? "rotate-180 bg-green-100 text-green-700"
                          : "bg-gray-50 text-gray-500"
                      }`}
                    >
                      <ChevronDown size={19} />
                    </span>
                  </button>

                  {/* Nội dung trả lời */}
                  <div
                    id={answerId}
                    role="region"
                    aria-labelledby={questionId}
                    hidden={!isOpen}
                  >
                    <div className="px-4 pb-5 sm:px-5 sm:pb-6">
                      <div className="ml-0 flex gap-3 border-t border-gray-100 pt-4 sm:ml-14">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
                          <CircleHelp size={17} />
                        </div>

                        <p className="text-sm leading-7 text-gray-500">
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

        {/* Khu vực liên hệ */}
        <div className="mt-12 flex flex-col gap-5 rounded-3xl border border-green-100 bg-gradient-to-r from-green-50 to-emerald-50 p-6 sm:mt-16 sm:flex-row sm:items-center sm:p-8 lg:mt-20">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-600 text-white shadow-lg shadow-green-600/20">
            <MessageCircleQuestion size={27} />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-extrabold text-gray-900 sm:text-xl">
              Vẫn chưa tìm thấy câu trả lời?
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Hãy liên hệ với chúng tôi để được hỗ trợ
              những vấn đề bạn đang gặp phải.
            </p>
          </div>

          <a
            href="/contact"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-500/20"
          >
            Liên hệ hỗ trợ
            <ArrowUpRight size={18} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
