import { Info, ArrowRight } from "lucide-react";

const FareSection = () => {
  return (
    <section
      id="fares"
      className="border-t border-slate-200/70 bg-[#f2f3ff] px-4 py-12 sm:px-6 sm:py-14 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        {/* TIÊU ĐỀ */}
        <div className="mx-auto mb-9 max-w-2xl text-center sm:mb-10">
          <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#0050c8] sm:text-xs">
            Minh bạch biểu phí
          </span>

          <h2 className="text-xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-2xl lg:text-[28px]">
            Thông tin bảng giá &amp; Cách tính cước
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-slate-600 sm:text-sm">
            Hiểu rõ các thành phần cấu thành giá cước chuyến đi trước khi bắt
            đầu hành trình.
          </p>
        </div>

        {/* BA THẺ THÔNG TIN GIÁ */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-3">
          {/* THẺ 01 */}
          <article className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_3px_rgba(15,23,42,0.02)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg sm:p-6">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-xs font-extrabold text-[#0050c8]">
              01
            </div>

            <h3 className="mb-2 text-sm font-bold text-slate-900">
              Cước mở cửa &amp; Km đầu tiên
            </h3>

            <p className="mb-4 text-xs leading-[1.7] text-slate-600">
              Áp dụng cho cự ly khởi đầu của chuyến đi. Giúp đảm bảo chi phí
              điều phối phương tiện và phục vụ cơ bản.
            </p>

            <div className="space-y-0 text-[11px]">
              <div className="flex items-start justify-between gap-3 border-t border-slate-100 py-2.5">
                <span className="text-slate-500">Xe 4 chỗ (≈ 2 km đầu)</span>
                <span className="shrink-0 text-right font-semibold text-slate-700">
                  20.000đ – 25.000đ
                </span>
              </div>

              <div className="flex items-start justify-between gap-3 border-t border-slate-100 py-2.5">
                <span className="text-slate-500">Xe 7 chỗ (≈ 2 km đầu)</span>
                <span className="shrink-0 text-right font-semibold text-slate-700">
                  25.000đ – 30.000đ
                </span>
              </div>
            </div>

            <p className="mt-auto border-t border-slate-100 pt-3 text-[10px] italic leading-relaxed text-slate-500">
              * Ví dụ tham khảo — biểu phí chính thức do hệ thống cấu hình.
            </p>
          </article>

          {/* THẺ 02 */}
          <article className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_3px_rgba(15,23,42,0.02)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg sm:p-6">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-xs font-extrabold text-[#0050c8]">
              02
            </div>

            <h3 className="mb-2 text-sm font-bold text-slate-900">
              Cước mỗi km tiếp theo
            </h3>

            <p className="mb-4 text-xs leading-[1.7] text-slate-600">
              Tính toán tuyến tính dựa trên quãng đường định tuyến thực tế từ
              điểm đón đến điểm trả do bản đồ tính toán.
            </p>

            <div className="space-y-0 text-[11px]">
              <div className="flex items-start justify-between gap-3 border-t border-slate-100 py-2.5">
                <span className="text-slate-500">Xe 4 chỗ (đến ~25 km)</span>
                <span className="shrink-0 text-right font-semibold text-slate-700">
                  11.000đ – 13.500đ/km
                </span>
              </div>

              <div className="flex items-start justify-between gap-3 border-t border-slate-100 py-2.5">
                <span className="text-slate-500">Xe 7 chỗ (đến ~25 km)</span>
                <span className="shrink-0 text-right font-semibold text-slate-700">
                  14.000đ – 16.500đ/km
                </span>
              </div>

              <div className="flex items-start justify-between gap-3 border-t border-slate-100 py-2.5">
                <span className="text-slate-500">Từ km 26 trở đi</span>
                <span className="shrink-0 text-right font-semibold text-slate-700">
                  Ưu đãi giảm 15–20%
                </span>
              </div>
            </div>

            <p className="mt-auto border-t border-slate-100 pt-3 text-[10px] italic leading-relaxed text-slate-500">
              * Phân cấp theo loại xe; giá thực tế theo lộ trình server tính.
            </p>
          </article>

          {/* THẺ 03 */}
          <article className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_3px_rgba(15,23,42,0.02)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg sm:p-6 md:col-span-2 xl:col-span-1">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-xs font-extrabold text-amber-600">
              03
            </div>

            <h3 className="mb-2 text-sm font-bold text-slate-900">
              Phụ phí nếu có
            </h3>

            <p className="mb-4 text-xs leading-[1.7] text-slate-600">
              Phụ phí giờ cao điểm hoặc đêm khuya (nếu phát sinh) luôn được
              thông báo minh bạch trước khi khách xác nhận yêu cầu.
            </p>

            <div className="space-y-0 text-[11px]">
              <div className="flex items-start justify-between gap-3 border-t border-slate-100 py-2.5">
                <span className="text-slate-500">Đêm khuya (22h–05h)</span>
                <span className="shrink-0 text-right font-semibold text-slate-700">
                  +10.000đ/chuyến
                </span>
              </div>

              <div className="flex items-start justify-between gap-3 border-t border-slate-100 py-2.5">
                <span className="text-slate-500">Cao điểm / thời tiết xấu</span>
                <span className="shrink-0 text-right font-semibold text-slate-700">
                  Hệ số 1.1x – 1.5x
                </span>
              </div>

              <div className="flex items-start justify-between gap-3 border-t border-slate-100 py-2.5">
                <span className="text-slate-500">Phí cầu đường / bãi đỗ</span>
                <span className="shrink-0 text-right font-semibold text-slate-700">
                  Theo thực tế
                </span>
              </div>
            </div>

            <p className="mt-auto border-t border-slate-100 pt-3 text-[10px] italic leading-relaxed text-slate-500">
              * Không thu phí ẩn ngoài cam kết trên màn hình.
            </p>
          </article>
        </div>

        {/* KHUNG GIẢI THÍCH */}
        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-blue-200 bg-white p-4 sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0050c8]">
              <Info size={19} strokeWidth={2} />
            </div>

            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900 sm:text-sm">
                Phân biệt Giá cước ước tính &amp; Cước phí xác nhận
              </h4>

              <p className="mt-1 text-[11px] leading-[1.7] text-slate-600 sm:text-xs">
                Hệ thống hiển thị giá cước ước tính ban đầu dựa trên tọa độ bản
                đồ. Cước phí xác nhận sẽ được cố định khi chuyến đi được tiếp
                nhận và hoàn tất theo lộ trình thực tế, không thu thêm phí ẩn
                ngoài cam kết.
              </p>
            </div>
          </div>

          <a
            href="/fares"
            className="inline-flex shrink-0 items-center gap-1 self-start whitespace-nowrap text-xs font-bold text-[#0050c8] !no-underline transition-colors hover:text-blue-700 sm:self-center"
          >
            Xem chi tiết quy định bảng giá
            <ArrowRight size={15} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default FareSection;