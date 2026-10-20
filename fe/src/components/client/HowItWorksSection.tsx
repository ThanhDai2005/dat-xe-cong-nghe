const HowItWorksSection = () => {
  const steps = [
    {
      num: "01",
      title: "Nhập thông tin chuyến đi",
      desc: "Cung cấp điểm đón, điểm đến, thời gian khởi hành và lựa chọn loại hình dịch vụ phù hợp nhu cầu.",
    },
    {
      num: "02",
      title: "Kiểm tra thông tin & giá",
      desc: "Xem chi tiết lộ trình dự kiến, cơ chế biểu phí do hệ thống cung cấp và kiểm tra lại thông tin liên hệ.",
    },
    {
      num: "03",
      title: "Xác nhận yêu cầu đặt xe",
      desc: "Hệ thống tiếp nhận yêu cầu đặt chuyến và gửi thông báo đến mạng lưới đối tác tài xế phù hợp trong khu vực.",
    },
    {
      num: "04",
      title: "Theo dõi kết quả xử lý",
      desc: "Theo dõi trạng thái điều phối tài xế sau khi hệ thống xác nhận (không bao gồm chuyển trước khi backend phản hồi).",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="border-b border-slate-200/80 bg-white px-4 py-12 sm:px-6 md:py-14 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        {/* TIÊU ĐỀ */}
        <div className="mx-auto mb-9 max-w-2xl text-center sm:mb-10">
          <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#0050c8] sm:text-xs">
            Quy trình vận hành
          </span>

          <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-3xl">
            Đặt xe chỉ với 4 bước
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-slate-500 sm:text-sm">
            Quy trình tiếp nhận và xử lý chuyến đi minh bạch theo đặc tả SRS
            GoRide.
          </p>
        </div>

        {/* 4 BƯỚC */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-[18px]">
          {steps.map((step) => (
            <article
              key={step.num}
              className="group flex h-full flex-col items-center rounded-2xl border border-[#e9e8f7] bg-[#faf9ff] px-4 py-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-[0_10px_28px_rgba(0,80,200,0.08)] sm:px-4 sm:py-[18px]"
            >
              {/* SỐ THỨ TỰ */}
              <div className="mb-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1765f5] text-xs font-extrabold text-white shadow-[0_4px_8px_rgba(23,101,245,0.2)] transition-transform duration-300 group-hover:scale-105">
                {step.num}
              </div>

              {/* TÊN BƯỚC */}
              <h3 className="mb-2 text-[13px] font-bold leading-5 text-slate-900 sm:text-sm">
                {step.title}
              </h3>

              {/* MÔ TẢ */}
              <p className="text-[11px] leading-[1.7] text-slate-600 sm:text-xs">
                {step.desc}
              </p>
            </article>
          ))}
        </div>

        {/* GHI CHÚ */}
        <p className="mt-6 text-center text-[10px] italic leading-5 text-slate-400 sm:mt-6 sm:text-[11px]">
          * Lưu ý: GoRide duy trì quy trình điều phối nhất quán; trạng thái tài
          xế được đồng bộ trực tiếp từ máy chủ.
        </p>
      </div>
    </section>
  );
};

export default HowItWorksSection;