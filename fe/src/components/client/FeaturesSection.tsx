import { Smartphone, CheckCircle, Zap, LifeBuoy } from "lucide-react";

const FeaturesSection = () => {
  return (
    <section className="py-12 md:py-16 bg-slate-50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-[#0050c8] mb-2">
            Trải nghiệm vượt trội
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Tại sao hàng triệu khách hàng chọn GoRide?
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0050c8] flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Đặt xe thuận tiện
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Thao tác trực tiếp trên máy tính hoặc điện thoại một chạm không
              cần cài đặt rườm rà.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Minh bạch chi phí
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Giá cước hiển thị chính xác ngay từ đầu. Cam kết không phí ẩn,
              không phụ thu bất ngờ.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Điều phối linh hoạt
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Thuật toán định tuyến thông minh gán tài xế khu vực gần nhất để
              đón bạn trong vài phút.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Hỗ trợ chu đáo
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Đội ngũ chăm sóc khách hàng và tổng đài CSKH đồng hành hỗ trợ mọi
              lúc mọi nơi 24/7.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
