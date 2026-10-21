import { useState } from "react";
import { Link } from "react-router-dom";
import { Car, Users, HelpCircle, CheckCircle, ArrowRight, Calculator, Info } from "lucide-react";

const FarePage = () => {
  const [activeTab, setActiveTab] = useState<"urban" | "intercity" | "surcharges">("urban");
  const [selectedVehicle, setSelectedVehicle] = useState<"car4" | "car7">("car4");
  const [distance, setDistance] = useState(10);
  const [nightSurcharge, setNightSurcharge] = useState(false);
  const [weatherSurcharge, setWeatherSurcharge] = useState(false);

  const pricing = {
    car4: { base: 20000, next: 11000, longDiscount: 0.15, label: "GoRide Car 4 chỗ" },
    car7: { base: 25000, next: 14500, longDiscount: 0.2, label: "GoRide Car 7 chỗ" },
  };

  const calculateFare = () => {
    const rate = pricing[selectedVehicle];
    let fare = 0;
    let breakdown = "";

    if (distance <= 2) {
      fare = rate.base;
      breakdown = `Đang áp dụng cước mở cửa trọn gói 2km đầu tiên: ${fare.toLocaleString("vi-VN")}đ.`;
    } else if (distance <= 25) {
      const extraKm = distance - 2;
      const extraFare = extraKm * rate.next;
      fare = rate.base + extraFare;
      breakdown = `Cước mở cửa ${rate.base.toLocaleString("vi-VN")}đ + ${extraKm}km tiếp theo (${extraFare.toLocaleString("vi-VN")}đ).`;
    } else {
      const normalExtraKm = 23;
      const normalExtraFare = normalExtraKm * rate.next;
      const longKm = distance - 25;
      const discountedRate = rate.next * (1 - rate.longDiscount);
      const longFare = longKm * discountedRate;
      fare = rate.base + normalExtraFare + longFare;
      breakdown = `Cước mở cửa ${rate.base.toLocaleString("vi-VN")}đ + 23km tiêu chuẩn (${normalExtraFare.toLocaleString("vi-VN")}đ) + ${longKm}km ưu đãi đường dài giảm ${Math.round(rate.longDiscount * 100)}% (${Math.round(longFare).toLocaleString("vi-VN")}đ).`;
    }

    if (nightSurcharge) {
      fare += 10000;
      breakdown += " + Phụ phí đêm 10.000đ.";
    }

    if (weatherSurcharge) {
      fare += 15000;
      breakdown += " + Phụ phí thời tiết 15.000đ.";
    }

    return { fare: Math.round(fare), breakdown };
  };

  const { fare, breakdown } = calculateFare();

  const faqData = [
    {
      question: "Nếu tài xế đi đường vòng thì cước tính thế nào?",
      answer:
        "Hệ thống GoRide bảo vệ giá cố định ban đầu nếu nguyên nhân đi vòng xuất phát từ tài xế. Trường hợp tài xế yêu cầu trả thêm không đúng hiển thị ứng dụng, bạn có thể gửi phản ánh tức thì qua mục Khiếu nại để được hoàn tiền chênh lệch tự động trong 24 giờ.",
    },
    {
      question: "Tôi có thể thanh toán bằng phương thức nào?",
      answer: "GoRide hỗ trợ đa dạng phương thức: Tiền mặt, Ví MoMo, ZaloPay, và tài khoản ngân hàng kết nối Napas 24/7 không tính thêm phụ phí thanh toán.",
    },
    {
      question: "Phí hủy chuyến được áp dụng ra sao?",
      answer:
        "Bạn hoàn toàn được hủy chuyến miễn phí trong vòng 5 phút đầu tiên sau khi tài xế nhận cuốc. Sau 5 phút, nếu tài xế đã di chuyển hơn 1km đến điểm đón mà khách hàng hủy chuyến vô lý do, hệ thống sẽ thu phí hỗ trợ tài xế 10.000đ cho xe máy và 20.000đ cho xe hơi.",
    },
    {
      question: "Làm sao để nhận hóa đơn VAT cho công ty?",
      answer:
        'Khách hàng chỉ cần nhập thông tin mã số thuế công ty trong mục "Hồ sơ công việc / Xuất hóa đơn VAT". Sau mỗi chuyến đi hoàn thành, hóa đơn điện tử hợp lệ của Bộ Tài Chính sẽ tự động được gửi về hòm thư điện tử đăng ký của bạn.',
    },
  ];

  return (
    <div className="w-full bg-slate-50 min-h-screen">
      {/* Background Glows */}
      <div className="relative w-full overflow-hidden bg-gradient-to-b from-slate-100/60 via-slate-50 to-slate-50 py-8 lg:py-12">
        <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-100/30 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-cyan-100/40 blur-3xl" />

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <Link to="/" className="flex items-center gap-1.5 transition-colors hover:text-blue-600">
              🏠 Trang chủ
            </Link>
            <span className="text-slate-400">›</span>
            <span className="font-bold text-blue-600">Bảng giá & Cách tính cước</span>
          </nav>

          <div className="flex flex-col justify-between gap-6 pt-2 lg:flex-row lg:items-end">
            <div className="flex max-w-3xl flex-col gap-3">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-cyan-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-cyan-700 shadow-sm">
                <CheckCircle className="h-4 w-4" />
                Chính Sách Giá Chuẩn 2026
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 lg:text-5xl">
                Minh bạch biểu phí & <span className="text-blue-600">Cách tính cước GoRide</span>
              </h1>
              <p className="text-base leading-relaxed text-slate-600 lg:text-lg">
                Hiểu rõ công thức tính giá cước để luôn chủ động, kiểm soát lộ trình và an tâm trọn vẹn trong mọi chuyến đi đô thị lẫn liên tỉnh.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3 rounded-2xl bg-white p-2 shadow-sm">
              <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">💰</div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase text-emerald-700">Cam kết 100%</span>
                  <span className="text-sm font-bold text-slate-900">Không phí ẩn vô lý</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="flex flex-col items-start gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center lg:p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Info className="h-7 w-7" />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900">Cam kết minh bạch cước phí</span>
                <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-bold uppercase text-blue-600">Quy chuẩn GPS</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                Mọi cước phí hiển thị trên website là giá ước tính tham khảo theo biểu giá tiêu chuẩn. Cước phí thực tế được chốt khi khách hàng xác nhận lộ trình GPS
                chính xác tại thời điểm đặt xe, cam kết hiển thị trọn gói trước khi khởi hành.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-16 px-4 py-12 sm:px-6 lg:px-8">
        {/* Fare Tables Section */}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Chi Tiết Biểu Phí Chuẩn</span>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Bảng biểu giá cơ sở toàn hệ thống</h2>
            </div>

            {/* Tabs */}
            <div className="inline-flex gap-1 self-start rounded-2xl bg-slate-200 p-1.5 sm:self-auto">
              <button
                onClick={() => setActiveTab("urban")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${activeTab === "urban" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-blue-600"
                  }`}
              >
                Cước nội thành đô thị
              </button>
              <button
                onClick={() => setActiveTab("intercity")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${activeTab === "intercity" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-blue-600"
                  }`}
              >
                Cước liên tỉnh
              </button>
              <button
                onClick={() => setActiveTab("surcharges")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${activeTab === "surcharges" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-blue-600"
                  }`}
              >
                Phụ phí dịch vụ
              </button>
            </div>
          </div>

          {/* Urban Tab */}
          {activeTab === "urban" && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Car 4 Card */}
                <div className="relative flex flex-col gap-4 overflow-hidden rounded-2xl bg-white p-6 shadow-sm">
                  <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-blue-600/10" />
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                      <Car className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold uppercase text-blue-700">Phổ biến nhất</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">GoRide Car 4 Chỗ</h3>
                    <p className="mt-1 text-sm text-slate-600">Dòng sedan/hatchback êm ái, máy lạnh tiện nghi</p>
                  </div>
                  <div className="h-px bg-slate-200" />
                  <ul className="flex flex-col gap-3 text-sm text-slate-900">
                    <li className="flex items-center justify-between">
                      <span className="text-slate-600">Cước mở cửa (2km đầu):</span>
                      <span className="text-xl font-bold text-blue-600">20.000đ</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-slate-600">Km 3 đến km 25:</span>
                      <span className="font-bold">11.000đ / km</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-slate-600">Từ km thứ 26 trở đi:</span>
                      <span className="font-bold text-emerald-600">Giảm 15%</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-slate-600">Phí di chuyển ùn tắc:</span>
                      <span className="font-medium text-slate-600">600đ / phút</span>
                    </li>
                  </ul>
                </div>

                {/* Car 7 Card */}
                <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-600 text-white">
                      <Users className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-bold uppercase text-cyan-700">Khoang rộng rãi</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">GoRide Car 7 Chỗ</h3>
                    <p className="mt-1 text-sm text-slate-600">SUV/MPV gia đình rộng rãi, chứa nhiều hành lý</p>
                  </div>
                  <div className="h-px bg-slate-200" />
                  <ul className="flex flex-col gap-3 text-sm text-slate-900">
                    <li className="flex items-center justify-between">
                      <span className="text-slate-600">Cước mở cửa (2km đầu):</span>
                      <span className="text-xl font-bold text-blue-600">25.000đ</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-slate-600">Km 3 đến km 25:</span>
                      <span className="font-bold">14.500đ / km</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-slate-600">Từ km thứ 26 trở đi:</span>
                      <span className="font-bold text-emerald-600">Giảm 20%</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-slate-600">Phí di chuyển ùn tắc:</span>
                      <span className="font-medium text-slate-600">750đ / phút</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Intercity Tab */}
          {activeTab === "intercity" && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">🔄</div>
                  <h3 className="text-xl font-bold text-slate-900">Gói Khứ Hồi 2 Chiều Trong Ngày</h3>
                </div>
                <p className="text-sm text-slate-600">Khách hàng đặt chiều về trong ngày cùng tài xế được hưởng mức ưu đãi đặc biệt:</p>
                <div className="flex flex-col gap-2 rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-900">Giảm giá cước chiều về:</span>
                    <span className="text-xl font-bold text-emerald-600">30% - 40%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">Miễn phí thời gian chờ:</span>
                    <span className="font-bold text-slate-900">Lên đến 120 phút</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">🗺️</div>
                  <h3 className="text-xl font-bold text-slate-900">Tuyến Đi Tỉnh Trọn Gói Cố Định</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Các tuyến cao tốc phổ biến (TP.HCM ↔ Vũng Tàu, Bình Dương, Long Thành, Cần Thơ) có mức giá trọn gói niêm yết không đổi kể cả giờ cao điểm.
                </p>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <span className="text-sm font-semibold text-slate-900">Ưu đãi đặt trước 12h:</span>
                  <span className="text-xl font-bold text-blue-600">Giảm thêm 50.000đ</span>
                </div>
              </div>
            </div>
          )}

          {/* Surcharges Tab */}
          {activeTab === "surcharges" && (
            <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900">Chính sách phụ phí công khai minh bạch</h3>
              <p className="text-sm text-slate-600">
                Mọi khoản phụ phí đều có điều kiện kích hoạt cụ thể và thông báo trước trên màn hình ứng dụng trước khi bạn nhấn nút "Xác nhận đặt xe".
              </p>
              <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-3">
                <div className="flex flex-col gap-2 rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 font-bold text-blue-600">🌙 Phụ phí ban đêm</div>
                  <span className="text-xl font-bold text-slate-900">+10.000 đ</span>
                  <span className="text-xs text-slate-600">Khung giờ từ 22:00 đến 05:00 sáng hôm sau nhằm hỗ trợ tài xế trực ca khuya.</span>
                </div>
                <div className="flex flex-col gap-2 rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 font-bold text-cyan-600">🌧️ Thời tiết khắc nghiệt</div>
                  <span className="text-xl font-bold text-slate-900">+10.000 - 20.000 đ</span>
                  <span className="text-xs text-slate-600">Áp dụng khi có mưa bão to, triều cường ngập úng diện rộng được hệ thống tự động ghi nhận.</span>
                </div>
                <div className="flex flex-col gap-2 rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 font-bold text-emerald-600">🛣️ Phí cầu đường, bến bãi</div>
                  <span className="text-xl font-bold text-slate-900">Theo thực tế ETC</span>
                  <span className="text-xs text-slate-600">Khách hàng chi trả trực tiếp hoặc cộng vào hóa đơn đúng theo biểu giá trạm thu phí thực phát sinh.</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Calculator Section */}
        <section className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-6">
            <div className="flex flex-col gap-2">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase text-blue-700">
                <Calculator className="h-4 w-4" />
                Công Cụ Dự Tính Tức Thì
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Tính cước nhanh chuyến đi</h2>
              <p className="text-sm text-slate-600">Chọn loại xe và kéo số quãng đường dự kiến để kiểm tra ước tính chi phí chuẩn xác theo thời gian thực.</p>
            </div>

            <div className="flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-900">1. Chọn phương tiện di chuyển:</label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={() => setSelectedVehicle("car4")}
                    className={`flex flex-col items-center gap-1.5 rounded-xl p-3 text-center transition-all ${selectedVehicle === "car4" ? "bg-blue-100/50 text-blue-600" : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                      }`}
                  >
                    <Car className="h-6 w-6" />
                    <span className="text-sm font-bold">Car 4 chỗ</span>
                    <span className="text-xs text-slate-600">20k / 2km đầu</span>
                  </button>
                  <button
                    onClick={() => setSelectedVehicle("car7")}
                    className={`flex flex-col items-center gap-1.5 rounded-xl p-3 text-center transition-all ${selectedVehicle === "car7" ? "bg-blue-100/50 text-blue-600" : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                      }`}
                  >
                    <Users className="h-6 w-6" />
                    <span className="text-sm font-bold">Car 7 chỗ</span>
                    <span className="text-xs text-slate-600">25k / 2km đầu</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-900">2. Khoảng cách lộ trình dự kiến:</label>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-blue-600">{distance}</span>
                    <span className="text-sm text-slate-600">km</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={distance}
                  onChange={(e) => setDistance(parseInt(e.target.value))}
                  className="h-2.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>1 km</span>
                  <span>15 km</span>
                  <span>30 km (Giảm cước)</span>
                  <span>60 km</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-bold text-slate-900">3. Tùy chọn điều kiện bổ sung:</span>
                <div className="flex flex-col gap-2.5 text-sm">
                  <label className="flex cursor-pointer select-none items-center gap-3">
                    <input type="checkbox" checked={nightSurcharge} onChange={(e) => setNightSurcharge(e.target.checked)} className="h-5 w-5 cursor-pointer rounded text-blue-600 focus:ring-0" />
                    <span className="text-slate-900">Đi khung giờ đêm khuya (22h - 05h) (+10.000đ)</span>
                  </label>
                  <label className="flex cursor-pointer select-none items-center gap-3">
                    <input
                      type="checkbox"
                      checked={weatherSurcharge}
                      onChange={(e) => setWeatherSurcharge(e.target.checked)}
                      className="h-5 w-5 cursor-pointer rounded text-blue-600 focus:ring-0"
                    />
                    <span className="text-slate-900">Thời tiết mưa bão ngập lớn (+15.000đ)</span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-2xl bg-slate-100/60 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Ước tính cước chuyến đi:</span>
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">Tiết kiệm minh bạch</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="flex flex-col">
                    <span className="text-5xl font-extrabold leading-none text-blue-600">{fare.toLocaleString("vi-VN")}</span>
                    <span className="mt-1 text-sm text-slate-600">VNĐ (Đã bao gồm VAT)</span>
                  </div>
                  <Link
                    to="/booking"
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-blue-700"
                  >
                    Đặt xe ngay
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="mt-1 rounded-xl bg-white p-3 text-xs text-slate-600">{breakdown}</div>
              </div>
            </div>
          </div>

          {/* Comparison Section */}
          <div className="flex flex-col gap-6 lg:col-span-6">
            <div className="flex flex-col gap-2">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold uppercase text-cyan-700">🔄 Thuật Toán Minh Bạch</div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">So sánh: Giá Ước Tính vs Giá Thực Tế</h2>
              <p className="text-sm text-slate-600">GoRide cam kết nói không với các khoản thu mơ hồ. Tìm hiểu sự khác nhau và lý do có sự chênh lệch (nếu phát sinh).</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-blue-600">
                  <span className="text-2xl">📍</span>
                  <span className="text-lg font-bold">Giá ước tính</span>
                </div>
                <span className="text-xs font-bold uppercase text-slate-500">Xác định khi bấm đặt</span>
                <ul className="flex flex-col gap-2.5 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 shrink-0 text-blue-600" />
                    <span>Tính theo lộ trình tối ưu GPS giữa điểm đón và điểm trả.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 shrink-0 text-blue-600" />
                    <span>Đã bao gồm khuyến mãi / mã giảm giá (voucher).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 shrink-0 text-blue-600" />
                    <span>Thông báo ngay phụ phí giờ cao điểm nếu thời tiết có mưa lớn.</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-600">
                  <span className="text-2xl">🧾</span>
                  <span className="text-lg font-bold">Giá thực tế</span>
                </div>
                <span className="text-xs font-bold uppercase text-slate-500">Chốt khi tài xế bấm hoàn thành</span>
                <ul className="flex flex-col gap-2.5 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>Bằng đúng 100% giá ước tính nếu hành trình đúng tuyến dự tính.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-4 w-4 shrink-0 text-slate-400">+</span>
                    <span>Chỉ thay đổi khi: Hành khách yêu cầu đổi điểm trả hoặc thêm điểm dừng.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-4 w-4 shrink-0 text-slate-400">🛣️</span>
                    <span>Cộng thêm vé cầu đường/bến bãi phát sinh thực tế (nếu qua trạm).</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">🔄</div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Quy trình xử lý cước minh bạch 4 bước</h4>
                  <p className="text-xs text-slate-600">Cách công nghệ GoRide bảo vệ quyền lợi tài chính của hành khách</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
                {[
                  { step: "1", title: "Đo lường bản đồ số", desc: "Thuật toán dẫn đường quét cung đường thông thoáng nhất." },
                  { step: "2", title: "Khóa biểu giá tạm thời", desc: "Giữ nguyên giá niêm yết trong suốt 5 phút khách hàng lựa chọn xe." },
                  { step: "3", title: "Ghi nhận telemetry GPS", desc: "Đồng bộ vận tốc xe, thời gian dừng chờ và tọa độ di chuyển." },
                  { step: "4", title: "Hóa đơn điện tử chi tiết", desc: "Gửi biên lai minh bạch qua email/SMS ngay khi kết thúc hành trình." },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{item.step}</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">{item.title}</span>
                      <span className="text-xs text-slate-600">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="flex flex-col gap-8 rounded-3xl bg-white p-8 shadow-sm lg:p-12">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Hỏi & Đáp Chi Tiết</span>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Câu hỏi thường gặp về cước phí</h2>
            </div>
            <Link to="/faq" className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:underline">
              Trung tâm trợ giúp GoRide
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {faqData.map((faq, idx) => (
              <div key={idx} className="flex flex-col gap-2 rounded-2xl bg-slate-50 p-5">
                <h4 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <HelpCircle className="h-5 w-5 text-blue-600" />
                  {faq.question}
                </h4>
                <p className="text-sm leading-relaxed text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="relative flex flex-col items-center justify-between gap-8 overflow-hidden rounded-3xl bg-blue-600 p-8 text-white shadow-xl md:flex-row lg:p-12">
          <div className="pointer-events-none absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-white/10 blur-2xl" />
          <div className="relative z-10 flex max-w-2xl flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white">Hành trình 5 sao tin cậy</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white lg:text-4xl">Trải nghiệm ngay chuyến xe giá tốt cùng GoRide</h2>
            <p className="text-sm text-white">
              Chỉ với vài chạm trên trình duyệt web, tài xế gần bạn nhất sẽ có mặt đón bạn trong vòng 3 phút. Biểu giá minh bạch, cước phí rõ ràng từng mét đường.
            </p>
          </div>
          <div className="relative z-10 flex w-full flex-col items-center gap-4 sm:flex-row sm:w-auto">
            <Link
              to="/booking"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-center text-lg font-bold text-blue-600 shadow-lg transition-all hover:scale-105 hover:bg-slate-100 active:scale-95 sm:w-auto"
            >
              Đặt xe ngay
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="tel:19008888"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/15 px-6 py-4 text-center text-base font-bold text-white backdrop-blur-sm transition-all hover:bg-white/25 sm:w-auto"
            >
              📞 Hotline 1900 8888
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FarePage;
