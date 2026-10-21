import { Link } from "react-router-dom";
import { Car, Users, Calendar, CheckCircle, ArrowRight, MapPin, DollarSign, Zap, Shield } from "lucide-react";

const ServicePage = () => {
  const services = [
    {
      id: "car4",
      badge: "Phổ biến nhất",
      badgeColor: "bg-blue-100 text-blue-700",
      title: "GoRide 4 Chỗ Tiêu Chuẩn",
      description: "Dòng xe sedan đô thị hiện đại, di chuyển linh hoạt, tối ưu chi phí cho hành trình hàng ngày, đi làm, đi học hoặc gặp gỡ bạn bè.",
      price: "Từ 28.000đ / 2km đầu",
      icon: Car,
      color: "primary",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCoODIOBDSKGTWUBgS83ViCVCcKwEQQjTJvxxStV5Wu3wMyQpGdCQR5fPhTjL_9ay8QPoN1njv8L6sLHIf9Tw66ccb1RdtHJrfLPsU9JQemxZIVcxeRTnMDsx___4Gvp8H6P7BaD4ji8FtJA5Rb86FukMCB5-oAIt5vqVA-cSsrcz4m7k5JGE0xoOOQGHV-91AnTJVCgPEwzOkzbBPjZkCr--3sLEiCkKx6KDivNLa_ytgYNHbJ_sIz",
      imageAlt: "A modern stylish compact white sedan car",
      specs: [
        { icon: "👥", label: "Tối đa 4 khách" },
        { icon: "🧳", label: "2 vali tiêu chuẩn" },
        { icon: "❄️", label: "Điều hòa mát mẻ" },
        { icon: "📍", label: "GPS định vị 100%" },
      ],
      bestFor: "Cá nhân, cặp đôi, di chuyển nội đô ngắn và trung bình.",
    },
    {
      id: "car7",
      badge: "Gia đình & Nhóm bạn",
      badgeColor: "bg-cyan-100 text-cyan-700",
      title: "GoRide 7 Chỗ Rộng Rãi",
      description: "Dòng xe MPV/SUV gầm cao, khoang ngồi thoáng đãng, mang lại sự êm ái vượt trội cho chuyến đi nhóm đông người hoặc nhiều đồ đạc.",
      price: "Từ 36.000đ / 2km đầu",
      icon: Users,
      color: "secondary",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB6Kkhm_0wR06VW8PDfDLNUro7tNPUVnTDf2309rWOmX89gS14C9nmsv_BlwPbjJG8dtJWlqWe5D12I_c8hDvvehRiwDCdFsMwfymArX6xRbwKDDzJ07HiNfpRV91vF6dAVjZR-IjlgR0KCyplzJZsTQ94gASYOHqksk1cmm91JZOLP8TzY1M5_TYGTvnM0AQwnK31aSrAK7r3o1nIRGIXEB9D4NfRv6LrE7-PzUblar0ACk8v8lkvS",
      imageAlt: "A modern elegant metallic dark blue 7-seater MPV SUV",
      specs: [
        { icon: "👨‍👩‍👧‍👦", label: "Tối đa 7 hành khách" },
        { icon: "📦", label: "Cốp đồ siêu rộng" },
        { icon: "💺", label: "Ghế bọc da êm ái" },
        { icon: "🔌", label: "Cổng sạc USB xe" },
      ],
      bestFor: "Gia đình du lịch, nhóm đồng nghiệp, về quê hoặc mang hành lý cồng kềnh.",
    },
    {
      id: "schedule",
      badge: "Đúng giờ tuyệt đối",
      badgeColor: "bg-emerald-100 text-emerald-700",
      title: "GoRide Đặt Trước & Sân Bay",
      description: "Dịch vụ lên lịch trình đón định giờ trước tối đa 7 ngày, tài xế xác nhận lịch sớm, cam kết đón đúng giờ tại các cảng hàng không và bến xe.",
      price: "Đặt trước đến 7 ngày",
      icon: Calendar,
      color: "tertiary",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuA7S6H0J6zUgqLScdg5BZzxcLBgp6GDjNVAe5It3cUQFNUmvz6ZIZeMj4HmMZAFDvHcSOQbQBi__bP08R-d4UbWPro4klEqjV0CFgyuqVpTOdnEx_wmrJCemITkDTIZeaQwa8grICAMODY_81htoYP_eM70RtZUJRZhQHCukKgscdJzJXO06CN6_zUmqOds7a4aTilE6T1CsA39Qj0D0FecUTrNiN-I_6F9cIoRDlA26FiWRAtWEVMv",
      imageAlt: "A premium chauffeur standing beside a luxury vehicle at airport",
      specs: [
        { icon: "📅", label: "Đặt lịch trước 24/7" },
        { icon: "✈️", label: "Tự cập nhật giờ bay" },
        { icon: "⏳", label: "Miễn phí 30p chờ ga" },
        { icon: "🎖️", label: "Tài xế chuyên đón VIP" },
      ],
      bestFor: "Chuyến bay sáng sớm, chuyến công tác gấp, đón khách VIP đối tác.",
    },
  ];

  const comparisonData = [
    {
      criterion: "Số lượng hành khách",
      car4: "Tối đa 4 người",
      car7: "Tối đa 7 người",
      schedule: "Tùy chọn 4 hoặc 7 chỗ",
    },
    {
      criterion: "Không gian hành lý",
      car4: "2 vali cỡ vừa (20-24 inch)",
      car7: "4 - 5 vali lớn + đồ gập",
      schedule: "Khoang riêng theo kích thước xe",
    },
    {
      criterion: "Dòng xe mẫu thường gặp",
      car4: "Vios, City, Accent, Mazda 2",
      car7: "Xpander, Innova, Fortuner, Veloz",
      schedule: "Camry, SantaFe, Carnival, Sedona",
    },
    {
      criterion: "Cước phí dự kiến",
      car4: "12.500đ / km",
      car4Sub: "Giá tiết kiệm nhất",
      car7: "16.000đ / km",
      car7Sub: "Chia đầu người siêu rẻ",
      schedule: "Trọn gói từ 220.000đ",
      scheduleSub: "Bao gồm phí trạm BOT",
    },
    {
      criterion: "Tính năng đặt lịch trước",
      car4: "Trước tối đa 2 giờ",
      car7: "Trước tối đa 4 giờ",
      schedule: "Lên lịch trước 7 ngày",
      scheduleHighlight: true,
    },
  ];

  const processSteps = [
    {
      step: "01",
      icon: MapPin,
      title: "Nhập điểm đến",
      description: "Chọn điểm đón hiện tại hoặc gõ địa chỉ mong muốn. Hệ thống tự động gợi ý điểm đến chính xác theo bản đồ GPS.",
      color: "bg-blue-50 text-blue-600",
    },
    {
      step: "02",
      icon: DollarSign,
      title: "Xem trước giá cước",
      description: "Chọn dòng xe phù hợp (4 chỗ, 7 chỗ, đưa đón sân bay). Giá cước cố định minh bạch hiển thị ngay lập tức, không phụ phí ẩn.",
      color: "bg-cyan-50 text-cyan-600",
    },
    {
      step: "03",
      icon: Zap,
      title: "Kết nối tài xế",
      description: "Hệ thống kết nối tài xế gần bạn nhất chỉ trong 30 giây. Xem biển số xe, dòng xe và thời gian di chuyển dự kiến tới điểm đón.",
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      step: "04",
      icon: CheckCircle,
      title: "Tận hưởng hành trình",
      description: "Tài xế đón đúng giờ, phục vụ chuẩn mực. Thanh toán linh hoạt qua tiền mặt, mã QR hoặc thẻ ngân hàng tiện lợi.",
      color: "bg-blue-50 text-blue-600",
    },
  ];

  return (
    <div className="w-full bg-slate-50 min-h-screen">
      {/* Background Glows */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute -top-32 -left-20 h-[580px] w-[580px] rounded-full bg-cyan-100/40 blur-[140px] pointer-events-none" />
        <div className="absolute top-80 right-0 h-[640px] w-[640px] rounded-full bg-blue-100/35 blur-[160px] pointer-events-none" />
        <div className="absolute bottom-40 left-1/4 h-[480px] w-[480px] rounded-full bg-emerald-100/30 blur-[150px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2">
            <Link to="/" className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition-colors hover:text-blue-600">
              🏠 Trang chủ
            </Link>
            <span className="text-slate-400">›</span>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-sm font-bold text-blue-600">Dịch vụ GoRide</span>
          </nav>

          {/* Hero Header */}
          <section className="relative mb-16 lg:mb-20">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
              <div className="flex flex-col gap-5 lg:col-span-8">
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-200 px-3.5 py-1.5 shadow-sm">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Danh mục dịch vụ toàn diện 2026</span>
                </div>
                <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
                  Dịch vụ di chuyển <br className="hidden sm:inline" />
                  <span className="relative inline-block text-blue-600">
                    thông minh GoRide
                    <svg className="absolute -bottom-2 left-0 h-3 w-full text-cyan-200" fill="none" preserveAspectRatio="none" viewBox="0 0 250 12">
                      <path d="M3 9C60 3 190 3 247 9" stroke="currentColor" strokeLinecap="round" strokeWidth="6" />
                    </svg>
                  </span>
                </h1>
                <p className="max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                  Giải pháp di chuyển công nghệ an toàn, tiện lợi và tiết kiệm cho mọi nhu cầu đi lại hàng ngày, công tác và đường dài trên khắp 63 tỉnh thành Việt Nam.
                </p>
                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">✓</div>
                    <span className="text-sm font-semibold text-slate-900">Tài xế chuẩn 5 sao</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">💰</div>
                    <span className="text-sm font-semibold text-slate-900">Giá cước niêm yết rõ ràng</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 text-cyan-600">
                      <Shield className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-slate-900">Bảo hiểm trọn chuyến đi</span>
                  </div>
                </div>
              </div>

              {/* Quick Stat Card */}
              <div className="flex justify-end lg:col-span-4">
                <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-white p-6 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Hiệu suất vận hành</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">Thời gian thực</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-blue-600">99.8%</span>
                    <span className="text-sm text-slate-500">chuyến đón đúng hẹn</span>
                  </div>
                  <p className="text-sm text-slate-600">Hơn 450.000 chuyến đi an toàn mỗi tháng tại Hà Nội, Đà Nẵng, TP.HCM & Nha Trang.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Service Cards */}
          <section className="mb-24">
            <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-1 w-6 rounded-full bg-blue-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Lựa chọn tối ưu</span>
                </div>
                <h2 className="text-3xl font-bold text-slate-900">3 Dòng Dịch Vụ Chủ Lực</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => {
                const IconComponent = service.icon;
                return (
                  <article
                    key={service.id}
                    className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  >
                    <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                      <img
                        src={service.imageUrl}
                        alt={service.imageAlt}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                      <div className="absolute left-4 top-4">
                        <span className={`flex items-center gap-1.5 rounded-full ${service.badgeColor} px-3 py-1 text-xs font-bold shadow-md`}>
                          <IconComponent className="h-3.5 w-3.5" />
                          {service.badge}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-4 rounded-xl bg-white/90 px-3 py-1 backdrop-blur-md shadow-sm">
                        <span className="text-sm font-bold text-blue-600">{service.price}</span>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col justify-between gap-6 p-7">
                      <div className="flex flex-col gap-4">
                        <div>
                          <div className="mb-1 flex items-center gap-2">
                            <IconComponent className="h-5 w-5 text-blue-600" />
                            <h3 className="text-xl font-bold text-slate-900">{service.title}</h3>
                          </div>
                          <p className="text-sm leading-relaxed text-slate-600">{service.description}</p>
                        </div>

                        {/* Specs */}
                        <div className="flex flex-col gap-2.5 rounded-xl bg-slate-50 p-4">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Thông số & Tiện ích</span>
                          <div className="grid grid-cols-2 gap-2.5">
                            {service.specs.map((spec, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-slate-900">
                                <span className="text-base">{spec.icon}</span>
                                <span className="text-xs font-medium">{spec.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Best for */}
                        <div className="flex items-start gap-2 pt-1">
                          <CheckCircle className="h-5 w-5 shrink-0 text-cyan-600" />
                          <p className="text-xs text-slate-600">
                            <strong className="font-semibold text-slate-900">Phù hợp với:</strong> {service.bestFor}
                          </p>
                        </div>
                      </div>

                      {/* CTA */}
                      <Link
                        to="/booking"
                        className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-blue-700 active:scale-95"
                      >
                        Đặt xe ngay
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Comparison Table */}
          <section className="mb-24">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Thông tin minh bạch</span>
              <h2 className="mt-2 mb-3 text-3xl font-bold text-slate-900">So sánh tính năng & Sự khác biệt giữa các dòng dịch vụ</h2>
              <p className="text-sm text-slate-600">Bảng thông số chi tiết hỗ trợ bạn chọn đúng dịch vụ nhanh chóng, phù hợp đúng nhu cầu và ngân sách của bạn.</p>
            </div>

            <div className="overflow-x-auto rounded-2xl bg-white p-2 shadow-lg md:p-6">
              <table className="w-full min-w-[700px] border-collapse text-left">
                <thead>
                  <tr className="bg-slate-100 rounded-xl">
                    <th className="rounded-l-xl px-6 py-4 text-sm font-bold text-slate-900">Tiêu chí so sánh</th>
                    <th className="px-6 py-4 text-sm font-bold text-blue-600">GoRide 4 Chỗ</th>
                    <th className="px-6 py-4 text-sm font-bold text-cyan-600">GoRide 7 Chỗ</th>
                    <th className="rounded-r-xl px-6 py-4 text-sm font-bold text-emerald-600">GoRide Sân Bay / Đặt Trước</th>
                  </tr>
                </thead>
                <tbody className="divide-y-0">
                  {comparisonData.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-slate-50/50" : ""}>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">{row.criterion}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {row.car4}
                        {row.car4Sub && <p className="text-xs text-slate-500">{row.car4Sub}</p>}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                        {row.car7}
                        {row.car7Sub && <p className="text-xs text-slate-500">{row.car7Sub}</p>}
                      </td>
                      <td className={`px-6 py-4 text-sm ${row.scheduleHighlight ? "font-bold text-emerald-600" : "text-slate-700"}`}>
                        {row.schedule}
                        {row.scheduleSub && <p className="text-xs text-slate-500">{row.scheduleSub}</p>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Process Steps */}
          <section className="mb-24">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Trải nghiệm liền mạch</span>
              <h2 className="mt-2 mb-3 text-3xl font-bold text-slate-900">Quy trình 4 bước trải nghiệm dịch vụ đơn giản</h2>
              <p className="text-sm text-slate-600">
                Không cần thủ tục phức tạp, bạn có thể hoàn tất chuyến đi yêu thích của mình chỉ với vài cú chạm trên màn hình.
              </p>
            </div>

            <div className="relative grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {processSteps.map((step) => {
                const StepIcon = step.icon;
                return (
                  <div
                    key={step.step}
                    className="group relative flex flex-col rounded-2xl bg-white p-6 shadow-md transition-all hover:-translate-y-1"
                  >
                    <div className="mb-6 flex items-center justify-between">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${step.color} text-xl font-extrabold`}>{step.step}</div>
                      <StepIcon className="h-7 w-7 text-blue-600" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-slate-900">{step.title}</h3>
                    <p className="text-sm text-slate-600">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Bottom CTA Banner */}
          <section className="relative overflow-hidden rounded-3xl bg-blue-600 p-8 text-white shadow-2xl md:p-14">
            <div className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -left-16 -bottom-16 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />

            <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              <div className="flex flex-col gap-4 lg:col-span-8">
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                  <Zap className="h-4 w-4" />
                  Trải nghiệm ngay bây giờ
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">Sẵn sàng cho chuyến đi tiếp theo của bạn?</h2>
                <p className="max-w-xl text-base text-white">
                  Đặt chuyến GoRide chỉ trong 30 giây. Không cần cài đặt rườm rà, đặt trực tiếp ngay trên nền tảng web với hàng ngàn ưu đãi hấp dẫn.
                </p>
              </div>

              <div className="flex flex-col justify-center gap-4 sm:flex-row lg:col-span-4 lg:flex-col lg:items-end">
                <Link
                  to="/booking"
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-8 py-4 text-lg font-bold text-blue-600 shadow-xl transition-all hover:bg-slate-100 active:scale-95 sm:w-auto lg:w-full"
                >
                  <span>Đặt chuyến xe ngay</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <a
                  href="tel:19008888"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/15 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/25 sm:w-auto lg:w-full"
                >
                  📞 Tổng đài tư vấn: 1900 8888
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ServicePage;
