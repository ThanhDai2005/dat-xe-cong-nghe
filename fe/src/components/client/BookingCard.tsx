import { useState, type FormEvent } from "react";
import { MapPin, ArrowRight } from "lucide-react";

const BookingCard = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<"4" | "7">("4");
  const [currentPrice, setCurrentPrice] = useState(86000);
  const [pickupValue, setPickupValue] = useState("Vị trí hiện tại");
  const [dropoffValue, setDropoffValue] = useState("");
  const [phoneValue, setPhoneValue] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectVehicle = (type: "4" | "7", price: number) => {
    setSelectedVehicle(type);
    setCurrentPrice(price);
  };

  const setDropoff = (address: string) => {
    setDropoffValue(address);
  };

  const handleBookingSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!dropoffValue.trim()) {
      alert("Vui lòng nhập địa chỉ điểm đến!");
      return;
    }

    if (!phoneValue.trim()) {
      alert("Vui lòng nhập số điện thoại để tài xế liên hệ!");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 5000);
    }, 1500);
  };

  return (
    <div
      className="w-full"
      data-purpose="ride-booking-widget"
      id="booking-card"
    >
      <div className="bg-white rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6 shadow-xl border border-slate-100/90 relative">
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] md:text-[11px] uppercase tracking-wider font-extrabold text-[#0050c8] block mb-0.5">
              Đặt chuyến ngay
            </span>
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Bạn muốn đi đâu?
            </h2>
          </div>
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-semibold">
            <svg
              className="w-3.5 h-3.5 text-emerald-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                clipRule="evenodd"
                d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z"
                fillRule="evenodd"
              />
            </svg>
            An toàn
          </div>
        </div>

        {/* Booking Form */}
        <form
          className="mt-3 md:mt-3.5 space-y-3"
          onSubmit={handleBookingSubmit}
        >
          {/* Pickup & Destination Container */}
          <div className="relative space-y-2.5">
            {/* Vertical Dotted Line */}
            <div className="absolute left-4 top-8 bottom-8 w-0.5 border-l-2 border-dashed border-slate-300 pointer-events-none z-0" />

            {/* Input: Điểm đón */}
            <div className="relative z-10">
              <label className="block text-xs font-semibold text-slate-500 mb-0.5 md:mb-1">
                Điểm đón
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 w-3 h-3 rounded-full border-2 border-[#0050c8] bg-white flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0050c8]" />
                </div>
                <input
                  type="text"
                  value={pickupValue}
                  onChange={(e) => setPickupValue(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 md:py-2.5 text-sm font-medium text-slate-800 bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0050c8] focus:border-[#0050c8] transition-colors h-11"
                  placeholder="Nhập địa chỉ đón"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 text-slate-400 hover:text-[#0050c8] p-1"
                  title="Định vị hiện tại"
                >
                  <MapPin className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Input: Điểm đến */}
            <div className="relative z-10">
              <label className="block text-xs font-semibold text-slate-500 mb-0.5 md:mb-1">
                Điểm đến
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 w-3 h-3 rounded-sm bg-red-500" />
                <input
                  type="text"
                  value={dropoffValue}
                  onChange={(e) => setDropoffValue(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 md:py-2.5 text-sm font-medium text-slate-800 bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0050c8] focus:border-[#0050c8] transition-colors h-11"
                  placeholder="Nhập địa chỉ điểm đến"
                  required
                />
              </div>
            </div>
          </div>

          {/* Input: Số điện thoại */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-0.5 md:mb-1">
              Số điện thoại khách hàng
            </label>
            <div className="flex rounded-xl shadow-sm border border-slate-200 overflow-hidden bg-slate-50/70 focus-within:border-[#0050c8] focus-within:ring-2 focus-within:ring-[#0050c8] h-11">
              <span className="inline-flex items-center px-3 bg-slate-100 text-slate-600 text-xs font-bold border-r border-slate-200">
                +84
              </span>
              <input
                type="tel"
                value={phoneValue}
                onChange={(e) => setPhoneValue(e.target.value)}
                pattern="[0-9]{9,10}"
                className="block w-full py-2 px-3 text-sm font-medium bg-transparent border-0 focus:ring-0 text-slate-800 placeholder-slate-400"
                placeholder="9xxxxxxxxx"
                required
              />
            </div>
          </div>

          {/* Shortcut Location Pills */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <button
              type="button"
              onClick={() => setDropoff("Sân bay Tân Sơn Nhất")}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-[#0050c8] text-slate-600 transition-colors"
            >
              📍 Sân bay Tân Sơn Nhất
            </button>
            <button
              type="button"
              onClick={() => setDropoff("Chợ Bến Thành")}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-[#0050c8] text-slate-600 transition-colors"
            >
              📍 Chợ Bến Thành
            </button>
            <button
              type="button"
              onClick={() => setDropoff("Landmark 81")}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-[#0050c8] text-slate-600 transition-colors"
            >
              📍 Landmark 81
            </button>
          </div>

          {/* Vehicle Selection */}
          <div className="pt-1">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Chọn loại xe
            </label>
            <div className="grid grid-cols-2 gap-2 md:gap-2.5">
              {/* Vehicle 4 seats */}
              <div
                onClick={() => selectVehicle("4", 86000)}
                className={`cursor-pointer rounded-xl md:rounded-2xl p-2.5 text-left transition-all ${
                  selectedVehicle === "4"
                    ? "border-2 border-[#0050c8] bg-blue-50/50"
                    : "border border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold text-slate-900">
                    GoRide 4 chỗ
                  </span>
                  <span
                    className={`text-xs font-black ${
                      selectedVehicle === "4"
                        ? "text-[#0050c8]"
                        : "text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                </div>
                <p className="text-[10px] md:text-[11px] text-slate-500 mb-1 md:mb-1.5">
                  Nhanh & tiết kiệm
                </p>
                <div
                  className={`font-extrabold text-xs md:text-sm ${
                    selectedVehicle === "4"
                      ? "text-[#0050c8]"
                      : "text-slate-800"
                  }`}
                >
                  86.000đ
                </div>
              </div>

              {/* Vehicle 7 seats */}
              <div
                onClick={() => selectVehicle("7", 124000)}
                className={`cursor-pointer rounded-xl md:rounded-2xl p-2.5 text-left transition-all ${
                  selectedVehicle === "7"
                    ? "border-2 border-[#0050c8] bg-blue-50/50"
                    : "border border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold text-slate-900">
                    GoRide 7 chỗ
                  </span>
                  <span
                    className={`text-xs font-black ${
                      selectedVehicle === "7"
                        ? "text-[#0050c8]"
                        : "text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                </div>
                <p className="text-[10px] md:text-[11px] text-slate-500 mb-1 md:mb-1.5">
                  Rộng rãi, thoải mái
                </p>
                <div
                  className={`font-extrabold text-xs md:text-sm ${
                    selectedVehicle === "7"
                      ? "text-[#0050c8]"
                      : "text-slate-800"
                  }`}
                >
                  124.000đ
                </div>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="pt-2 pb-0.5 flex items-baseline justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500">
                Giá dự kiến:
              </span>
              <p className="text-[10px] text-slate-400">
                Đã bao gồm phí nền tảng
              </p>
            </div>
            <div className="text-right">
              <span className="text-xl md:text-2xl font-black text-[#0050c8]">
                {new Intl.NumberFormat("vi-VN").format(currentPrice)}đ
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#0050c8] hover:bg-[#0040a2] active:bg-[#003580] text-white font-bold h-11 md:h-12 px-4 rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-sm">Đang gửi yêu cầu...</span>
              </>
            ) : (
              <>
                <span className="text-sm">Đặt xe & Thanh toán</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-slate-400 pt-0.5">
            🔒 Thông tin được bảo mật và tự động điều phối xe gần nhất.
          </p>
        </form>

        {/* Feedback Alert */}
        {showFeedback && (
          <div className="mt-3 p-3 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 animate-in fade-in slide-in-from-top-2 duration-300">
            🎉 <strong>Yêu cầu thành công!</strong> Đang tìm tài xế GoRide khu
            vực lân cận...
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
