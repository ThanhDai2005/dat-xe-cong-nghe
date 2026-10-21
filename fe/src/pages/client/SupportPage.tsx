import { useState } from "react";
import { Link } from "react-router-dom";
import { Phone, MessageCircle, Bot, Mail, Search, ChevronDown, CheckCircle, Clock, Shield, DollarSign } from "lucide-react";

const SupportPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFaqCategory, setActiveFaqCategory] = useState<"booking" | "pricing" | "account" | "refund">("booking");
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    rideId: "",
    category: "fare",
    content: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const quickSearchKeywords = [
    { text: "Cách đặt xe", icon: "🚗" },
    { text: "Quên đồ trên xe", icon: "🧳" },
    { text: "Hóa đơn VAT", icon: "🧾" },
    { text: "Phí hủy chuyến", icon: "❌" },
    { text: "Đổi điểm đón", icon: "📍" },
  ];

  const supportChannels = [
    {
      id: "hotline",
      title: "Tổng đài CSKH 24/7",
      description: "Hỗ trợ khẩn cấp mọi lúc, xử lý sự cố an toàn trên hành trình và can thiệp kịp thời 24/7.",
      label: "Hotline cước phí tiêu chuẩn",
      value: "1900 8888",
      action: "Gọi ngay hotline",
      actionHref: "tel:19008888",
      icon: Phone,
      color: "emerald",
      badge: "Trực tuyến 24/7",
    },
    {
      id: "zalo",
      title: "Zalo Official Account",
      description: "Nhắn tin trực tiếp với chuyên viên tư vấn, gửi ảnh biên lai hoặc vị trí định vị nhanh chóng.",
      label: "Tài khoản chính thức",
      value: "GoRide Vietnam OA",
      action: "Chat qua Zalo",
      actionHref: "#",
      icon: MessageCircle,
      color: "blue",
      badge: "Xác thực OA",
    },
    {
      id: "ai",
      title: "Trợ lý ảo GoRide AI",
      description: "Giải đáp thắc mắc cước phí, tra cứu hành trình, tự động tìm mã khuyến mãi và tư vấn dịch vụ.",
      label: "Hệ thống xử lý thông minh",
      value: "Bot AI Song ngữ",
      action: "Trò chuyện ngay",
      actionHref: "#",
      icon: Bot,
      color: "blue",
      badge: "Tức thì 0s",
    },
    {
      id: "email",
      title: "Hộp thư hỗ trợ",
      description: "Tiếp nhận phản ánh chất lượng, khiếu nại cước phí, cấp hóa đơn VAT điện tử cho doanh nghiệp.",
      label: "Hòm thư chăm sóc",
      value: "support@goride.vn",
      action: "Gửi email khiếu nại",
      actionHref: "mailto:support@goride.vn",
      icon: Mail,
      color: "cyan",
      badge: "Cam kết 24h",
    },
  ];

  const faqCategories = [
    { id: "booking", label: "Đặt chuyến & Đi lại" },
    { id: "pricing", label: "Giá cước & Thanh toán" },
    { id: "account", label: "Tài khoản & Bảo mật" },
    { id: "refund", label: "Hủy chuyến & Hoàn tiền" },
  ];

  const faqData = {
    booking: [
      {
        question: "Làm thế nào để đặt xe qua website GoRide?",
        answer: (
          <>
            <p className="mb-3">Bạn có thể hoàn tất chuyến đi chỉ trong 3 bước thao tác tinh gọn trên giao diện web:</p>
            <ol className="mb-3 list-inside list-decimal space-y-2 pl-1">
              <li>
                <strong>Nhập thông tin lộ trình:</strong> Chọn điểm đón hiện tại và nhập địa chỉ điểm đến tại widget đặt xe.
              </li>
              <li>
                <strong>Lựa chọn dòng xe:</strong> Chọn loại phương tiện bạn muốn (GoRide Xe máy, Car 4 chỗ hoặc Car 7 chỗ) với mức cước hiển thị minh bạch.
              </li>
              <li>
                <strong>Xác nhận & Đặt chuyến:</strong> Điền số điện thoại liên lạc, bấm <em>"Đặt xe & Thanh toán"</em> để hệ thống tự động kết nối tài xế gần nhất trong 1-3
                phút.
              </li>
            </ol>
            <div className="flex items-center gap-2 rounded-xl bg-blue-50 p-3 text-sm font-semibold text-blue-600">
              <span>ℹ️</span>
              Không cần tải ứng dụng phức tạp, bạn hoàn toàn có thể theo dõi xe ngay trên trình duyệt web.
            </div>
          </>
        ),
      },
      {
        question: "Làm sao để liên hệ tài xế khi cần đón gấp?",
        answer: (
          <p>
            Ngay sau khi hệ thống kết nối thành công với đối tác tài xế, màn hình hành trình sẽ hiển thị đầy đủ: <strong>Họ tên tài xế, Biển số xe, Loại xe, Màu sơn</strong>{" "}
            và <strong>Số điện thoại liên lạc trực tiếp</strong>. Bạn có thể bấm nút <em>"Gọi tài xế"</em> miễn phí hoặc nhắn tin SMS chỉ dẫn chi tiết vị trí đứng chờ (ví dụ:
            Cổng số 2, trước sảnh chung cư, cây ATM...).
          </p>
        ),
      },
    ],
    pricing: [
      {
        question: "Giá cước hiển thị trên website có phải là giá cuối cùng không?",
        answer: (
          <>
            <p className="mb-3">
              <strong>Có.</strong> Giá cước hiển thị trên GoRide là <strong>giá trọn gói cố định</strong> cho toàn bộ cung đường đã chọn trước, đã bao gồm thuế VAT và phí nền
              tảng kết nối.
            </p>
            <p className="mb-2">
              Mức giá này sẽ <strong>không thay đổi</strong> kể cả khi gặp tình trạng kẹt xe hay thời tiết mưa gió. Tuy nhiên, giá có thể phát sinh phụ phí nếu:
            </p>
            <ul className="list-inside list-disc space-y-1.5 pl-1">
              <li>Hành khách yêu cầu tài xế thay đổi điểm đến hoặc ghé thêm các điểm dừng khác trên hành trình.</li>
              <li>Phí cầu đường, phà hoặc bến bãi đỗ xe theo yêu cầu cá nhân của hành khách.</li>
            </ul>
          </>
        ),
      },
    ],
    account: [
      {
        question: "Chính sách xử lý khi để quên đồ trên xe của GoRide như thế nào?",
        answer: (
          <>
            <p className="mb-3">GoRide có quy trình cam kết hỗ trợ khách hàng tìm lại hành lý thất lạc:</p>
            <ol className="mb-3 list-inside list-decimal space-y-1.5 pl-1">
              <li>
                <strong>Gọi trực tiếp cho tài xế:</strong> Trong vòng 2 giờ kể từ khi chuyến đi kết thúc, bạn có thể gọi lại số tài xế thông qua lịch sử chuyến đi.
              </li>
              <li>
                <strong>Liên hệ tổng đài khẩn cấp 1900 8888:</strong> Cung cấp mã chuyến đi (ví dụ: #GR-89212), nhân viên hỗ trợ sẽ niêm phong thông tin và điều phối tài xế
                trao trả tài sản tại địa chỉ của bạn.
              </li>
            </ol>
            <p className="text-xs italic text-slate-600">*Lưu ý: Quý khách vui lòng hỗ trợ một khoản chi phí di chuyển hợp lý cho tài xế khi họ mang trả đồ tận nơi.</p>
          </>
        ),
      },
    ],
    refund: [
      {
        question: "Tôi có thể hủy chuyến đi đã đặt trước không và có mất phí không?",
        answer: (
          <>
            <p className="mb-2">
              <strong>Miễn phí 100%:</strong> Bạn được hủy chuyến hoàn toàn miễn phí nếu thao tác trong vòng <strong>5 phút đầu tiên</strong> kể từ khi tài xế nhận cuốc, hoặc
              khi tài xế trễ hơn 10 phút so với thời gian dự kiến đón.
            </p>
            <p className="mb-2">
              <strong>Phí hủy 15.000đ:</strong> Áp dụng nếu bạn hủy chuyến sau 5 phút mà tài xế đã di chuyển đến gần sát điểm đón, nhằm hỗ trợ chi phí xăng xe và công sức của
              đối tác tài xế.
            </p>
            <p>Mọi thắc mắc về trừ phí sai lệch, bạn có thể gửi phản ánh vào biểu mẫu bên cạnh để được hoàn tiền tức thì trong 2 giờ làm việc.</p>
          </>
        ),
      },
    ],
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setFormData({
        fullName: "",
        phone: "",
        rideId: "",
        category: "fare",
        content: "",
      });
    }, 3000);
  };

  const currentFaqItems = faqData[activeFaqCategory];

  return (
    <div className="w-full min-h-screen bg-slate-50">
      {/* Background Glows */}
      <div className="relative w-full overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-100/40 via-slate-100/30 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute top-96 -right-24 h-[420px] w-[420px] rounded-full bg-cyan-100/20 blur-3xl" />
        <div className="pointer-events-none absolute top-[600px] -left-20 h-[460px] w-[460px] rounded-full bg-emerald-100/20 blur-3xl" />

        {/* Hero Header */}
        <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-600">
            <Link to="/" className="flex items-center gap-1.5 transition-colors hover:text-blue-600">
              🏠 Trang chủ
            </Link>
            <span className="text-slate-400">›</span>
            <span className="font-bold text-blue-600">Trung tâm hỗ trợ</span>
          </nav>

          {/* Hero Section */}
          <div className="mx-auto mb-12 flex max-w-3xl flex-col items-center text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100/60 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 shadow-sm">
              <span>🎧</span>
              Trung tâm trợ giúp khách hàng 24/7
            </div>
            <h1 className="mb-4 text-4xl font-extrabold text-slate-900 sm:text-5xl">
              Chúng tôi có thể <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">giúp gì</span> cho bạn?
            </h1>
          </div>

          {/* Main Two-Column: FAQ & Ticket Form */}
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
            {/* Left: FAQ Section */}
            <section className="flex flex-col gap-6 lg:col-span-7">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Hỏi đáp thường gặp</span>
                <h2 className="text-3xl font-bold text-slate-900">Những thắc mắc thường gặp</h2>
                <p className="text-sm text-slate-600">Chọn danh mục bạn quan tâm để xem câu trả lời nhanh chóng và chi tiết nhất.</p>
              </div>

              {/* FAQ Category Tabs */}
              <div className="scrollbar-none flex items-center gap-2 overflow-x-auto pb-2">
                {faqCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveFaqCategory(cat.id as typeof activeFaqCategory)}
                    className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${activeFaqCategory === cat.id ? "bg-blue-600 text-white shadow-sm" : "bg-slate-200 text-slate-900 hover:bg-slate-300"
                      }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* FAQ Accordion */}
              <div className="flex flex-col gap-3">
                {currentFaqItems.map((item, idx) => (
                  <div key={idx} className="rounded-2xl bg-white p-5 shadow-sm transition-all duration-200">
                    <button onClick={() => setOpenAccordion(openAccordion === idx ? null : idx)} className="flex w-full items-center justify-between gap-4 text-left">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <span className="text-sm">❓</span>
                        </div>
                        <span className="text-lg font-semibold text-slate-900">{item.question}</span>
                      </div>
                      <ChevronDown className={`h-5 w-5 text-blue-600 transition-transform duration-300 ${openAccordion === idx ? "rotate-180" : ""}`} />
                    </button>
                    {openAccordion === idx && (
                      <div className="mt-4 border-t border-slate-100 pt-4 text-sm leading-relaxed text-slate-600">
                        {item.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Bottom Help Hint */}
              <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-blue-100 to-slate-100 p-6 sm:flex-row">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
                    <span className="text-2xl">💬</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">Chưa tìm thấy câu trả lời?</h4>
                    <p className="text-xs text-slate-600">Hãy gửi phiếu yêu cầu bên cạnh, chuyên viên GoRide sẽ gọi lại hỗ trợ bạn ngay lập tức.</p>
                  </div>
                </div>
                <a href="#ticketForm" className="whitespace-nowrap rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-blue-600 shadow-sm transition-all hover:shadow-md">
                  Gửi yêu cầu ngay
                </a>
              </div>
            </section>

            {/* Right: Ticket Form */}
            <section id="ticketForm" className="sticky top-28 w-full lg:col-span-5">
              <div className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-xl">
                {/* Accent Top Stripe */}
                <div className="absolute left-0 right-0 top-0 h-2 bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600" />

                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <span className="text-xl">📝</span>
                  </div>
                  <span className="rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-bold uppercase text-cyan-700">Tiếp nhận phản hồi</span>
                </div>

                <h3 className="mb-2 text-2xl font-bold text-slate-900">Gửi yêu cầu hỗ trợ hoặc phản ánh chất lượng</h3>
                <p className="mb-6 text-sm text-slate-600">GoRide lắng nghe mọi ý kiến đóng góp của bạn để liên tục nâng cấp chất lượng phục vụ an toàn và văn minh.</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {/* Success Alert */}
                  {showSuccess && (
                    <div className="flex items-start gap-3 rounded-xl bg-emerald-100 p-4 text-sm text-emerald-900">
                      <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
                      <div>
                        <p className="font-bold">Đã gửi yêu cầu thành công!</p>
                        <p>
                          Mã yêu cầu: <span className="font-mono font-bold">#TK-2026-8941</span>. Nhân viên GoRide sẽ liên hệ bạn qua SĐT trong ít phút.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-center justify-between text-sm font-semibold text-slate-900">
                      <span>
                        Họ và tên của bạn <span className="text-red-600">*</span>
                      </span>
                      <span className="text-xs font-normal text-slate-500">Bắt buộc</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-slate-400">👤</span>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Nguyễn Văn A"
                        required
                        className="w-full rounded-xl bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-center justify-between text-sm font-semibold text-slate-900">
                      <span>
                        Số điện thoại liên lạc <span className="text-red-600">*</span>
                      </span>
                      <span className="text-xs font-normal text-slate-500">Nhận phản hồi</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-slate-400">📞</span>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="09xx xxx xxx"
                        required
                        className="w-full rounded-xl bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  {/* Ride ID & Category */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-900">Mã chuyến đi</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-slate-400">🏷️</span>
                        <input
                          type="text"
                          value={formData.rideId}
                          onChange={(e) => setFormData({ ...formData, rideId: e.target.value })}
                          placeholder="#GR-xxxxx"
                          className="w-full rounded-xl bg-slate-50 py-3 pl-10 pr-3 font-mono text-sm uppercase text-slate-900 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-900">Vấn đề gặp phải</label>
                      <div className="relative flex items-center">
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full cursor-pointer appearance-none rounded-xl bg-slate-50 py-3 pl-3 pr-8 text-sm text-slate-900 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-600"
                        >
                          <option value="fare">Sai lệch cước phí</option>
                          <option value="driver">Thái độ tài xế</option>
                          <option value="lost">Quên đồ trên xe</option>
                          <option value="cancel">Phí hủy chuyến</option>
                          <option value="invoice">Yêu cầu hóa đơn đỏ</option>
                          <option value="other">Ý kiến khác</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  {/* Feedback Textarea */}
                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-center justify-between text-sm font-semibold text-slate-900">
                      <span>
                        Nội dung góp ý / chi tiết sự việc <span className="text-red-600">*</span>
                      </span>
                      <span className="text-xs font-normal text-slate-500">{formData.content.length}/500</span>
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Vui lòng mô tả chi tiết trải nghiệm của bạn (thời gian di chuyển, địa điểm, sự việc phát sinh...)"
                      required
                      maxLength={500}
                      rows={4}
                      className="w-full resize-none rounded-xl bg-slate-50 p-3.5 text-sm text-slate-900 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  {/* Policy Checkbox */}
                  <div className="flex items-start gap-2.5 pt-1">
                    <input type="checkbox" required className="mt-1 h-4 w-4 cursor-pointer rounded text-blue-600 accent-blue-600" />
                    <label className="cursor-pointer text-xs text-slate-600">
                      Tôi đồng ý để bộ phận Chăm sóc khách hàng GoRide liên hệ qua số điện thoại trên để xác minh và giải quyết vụ việc.
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 active:scale-95"
                  >
                    <span>Gửi phản hồi cho GoRide</span>
                    <span>📤</span>
                  </button>

                  <div className="mt-2 flex items-center justify-center gap-2 text-xs text-slate-500">
                    <span>🔒</span>
                    Thông tin được bảo mật theo tiêu chuẩn an toàn dữ liệu ISO 27001
                  </div>
                </form>
              </div>
            </section>
          </div>

          {/* Trust Metrics */}
          <section className="mt-20 pt-10">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Tiêu chuẩn dịch vụ</span>
              <h3 className="mt-1 text-3xl font-bold text-slate-900">Cam kết chất lượng từ GoRide Vietnam</h3>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="flex items-start gap-4 rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="mb-1 text-lg font-bold text-slate-900">Xử lý thần tốc 24/7</h4>
                  <p className="text-sm text-slate-600">100% khiếu nại về hành trình được tiếp nhận và xử lý bước đầu trong vòng 15 phút từ lúc nhận thông tin.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="mb-1 text-lg font-bold text-slate-900">Bảo hiểm chuyến đi</h4>
                  <p className="text-sm text-slate-600">Tất cả các chuyến đi đặt trên nền tảng GoRide đều được bảo hiểm tai nạn dân sự tối đa lên đến 100.000.000đ.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="mb-1 text-lg font-bold text-slate-900">Cam kết minh bạch giá</h4>
                  <p className="text-sm text-slate-600">Hoàn tiền 100% giá trị chênh lệch nếu tài xế tự ý thu thêm phụ phí ngoài cuốc xe mà không được đồng ý.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
