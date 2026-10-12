const HowItWorksSection = () => {
  const steps = [
    {
      num: "01",
      title: "Nhập thông tin chuyến đi",
      desc: "Cung cấp điểm đón, điểm đến, thời gian khởi hành và loại dịch vụ phù hợp.",
    },
    {
      num: "02",
      title: "Kiểm tra thông tin & giá",
      desc: "Xem lộ trình dự kiến, cơ chế biểu phí và kiểm tra lại thông tin liên hệ.",
    },
    {
      num: "03",
      title: "Xác nhận yêu cầu đặt xe",
      desc: "Hệ thống tiếp nhận yêu cầu và gửi đến mạng lưới tài xế phù hợp trong khu vực.",
    },
    {
      num: "04",
      title: "Theo dõi kết quả xử lý",
      desc: "Theo dõi trạng thái điều phối tài xế sau khi hệ thống xác nhận (đồng bộ từ server).",
    },
  ];

  return (
    <section
      className="py-16 md:py-20 bg-white border-b border-slate-200/80"
      id="how-it-works"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12 md:mb-16">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#0050c8] mb-2 block">
            Quy trình vận hành
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Đặt xe chỉ với 4 bước
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Quy trình tiếp nhận và xử lý chuyến đi minh bạch theo đặc tả SRS
            GoRide.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s) => (
            <div
              key={s.num}
              className="relative bg-[#faf8ff] rounded-2xl p-6 border border-slate-200/80 text-center hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 mx-auto rounded-xl bg-[#0050c8] text-white font-extrabold text-base flex items-center justify-center mb-4 shadow-md shadow-blue-500/25">
                {s.num}
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {s.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 mt-8 italic">
          * Trạng thái tài xế và chuyến đi được đồng bộ trực tiếp từ máy chủ.
        </p>
      </div>
    </section>
  );
};

export default HowItWorksSection;
