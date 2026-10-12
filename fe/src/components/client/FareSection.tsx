const FareSection = () => {
  return (
    <section
      className="py-16 bg-[#f2f3ff] border-t border-slate-200/70"
      id="fares"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#0050c8] mb-2 block">
            Minh bạch biểu phí
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Thông tin bảng giá & Cách tính cước
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            Hiểu rõ các thành phần cấu thành giá cước trước khi bắt đầu hành
            trình. Số liệu dưới đây mang tính tham khảo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 01 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0050c8] flex items-center justify-center font-bold text-sm mb-4">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Cước mở cửa & Km đầu tiên
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Áp dụng cho cự ly khởi đầu chuyến đi. Đảm bảo chi phí điều phối và
              phục vụ cơ bản.
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Xe 4 chỗ (≈ 2 km đầu)</span>
                <span className="font-bold text-slate-900">
                  20.000đ – 25.000đ
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Xe 7 chỗ (≈ 2 km đầu)</span>
                <span className="font-bold text-slate-900">
                  25.000đ – 30.000đ
                </span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 italic">
              * Ví dụ tham khảo — biểu phí chính thức do hệ thống cấu hình.
            </div>
          </div>

          {/* 02 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0050c8] flex items-center justify-center font-bold text-sm mb-4">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Cước mỗi km tiếp theo
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Tính theo quãng đường định tuyến thực tế từ điểm đón đến điểm trả.
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Xe 4 chỗ (đến ~25 km)</span>
                <span className="font-bold text-slate-900">
                  11.000đ – 13.500đ/km
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Xe 7 chỗ (đến ~25 km)</span>
                <span className="font-bold text-slate-900">
                  14.000đ – 16.500đ/km
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Từ km 26 trở đi</span>
                <span className="font-bold text-slate-900">
                  Ưu đãi giảm 15–20%
                </span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 italic">
              * Phân cấp theo loại xe; giá thực tế theo lộ trình server tính.
            </div>
          </div>

          {/* 03 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm mb-4">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Phụ phí nếu có
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Phụ phí được thông báo minh bạch trước khi khách xác nhận yêu cầu.
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Đêm khuya (22h–05h)</span>
                <span className="font-bold text-slate-900">
                  +10.000đ/chuyến
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Cao điểm / thời tiết xấu</span>
                <span className="font-bold text-slate-900">
                  Hệ số 1.1x – 1.5x
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Phí cầu đường / bãi đỗ</span>
                <span className="font-bold text-slate-900">Theo thực tế</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 italic">
              * Không thu phí ẩn ngoài cam kết trên màn hình.
            </div>
          </div>
        </div>

        {/* Clarification box */}
        <div className="mt-8 bg-white border border-blue-200 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-[#0050c8] mt-0.5 shrink-0">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Giá ước tính ≠ Cước xác nhận
              </h4>
              <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                Số tiền trên trang mang tính tham khảo. Hệ thống hiển thị giá
                ước tính theo lộ trình; cước xác nhận do server tính và cố định
                khi chuyến được tiếp nhận — không thu phí ẩn ngoài cam kết.
              </p>
            </div>
          </div>
          <a
            href="/fares"
            className="flex-shrink-0 text-sm font-bold text-[#0050c8] hover:underline inline-flex items-center gap-1"
          >
            Xem chi tiết bảng giá →
          </a>
        </div>
      </div>
    </section>
  );
};

export default FareSection;
