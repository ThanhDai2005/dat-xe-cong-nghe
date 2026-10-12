import { useState } from "react";

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
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section
      className="py-20 bg-[#FAFAFA] border-t border-slate-200/70"
      id="faq"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#0050c8] mb-2 block">
            Giải đáp thắc mắc
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Hỗ trợ & Câu hỏi thường gặp
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Thông tin chi tiết về việc sử dụng nền tảng GoRide Web.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((item, i) => (
            <div
              key={i}
              className="border border-slate-200 rounded-xl overflow-hidden bg-white"
            >
              <button
                type="button"
                className="w-full px-5 py-4 text-left font-bold text-sm text-slate-900 flex items-center justify-between hover:bg-slate-50 transition-colors"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span>{item.q}</span>
                <svg
                  className={`w-5 h-5 text-slate-400 transition-transform ${open === i ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
