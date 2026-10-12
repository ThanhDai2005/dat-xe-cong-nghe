import { Car, Users, Calendar } from "lucide-react";

interface ServiceItem {
  badge: string;
  badgeColor: string;
  title: string;
  description: string;
  footerText: string;
  actionText: string;
  isFeatured?: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

const ServicesSection = () => {
  const services: ServiceItem[] = [
    {
      badge: "Phổ biến nhất",
      badgeColor: "bg-blue-100 text-[#0040a2]",
      title: "GoRide Tiêu Chuẩn (4 Chỗ)",
      description:
        "Di chuyển nội thành hằng ngày nhanh gọn, tiết kiệm chi phí, giải pháp lý tưởng cho cá nhân và cặp đôi.",
      footerText: "Tiêu chuẩn tiện ích",
      actionText: "Chọn chuyến →",
      icon: Car,
    },
    {
      badge: "Tiện nghi rộng rãi",
      badgeColor: "bg-blue-100 text-[#0040a2]",
      title: "GoRide Gia Đình (7 Chỗ)",
      description:
        "Không gian rộng thoáng, khoang hành lý lớn dành cho cả nhóm đi chơi, du lịch, đón tiễn sân bay.",
      footerText: "Sức chứa tối ưu",
      actionText: "Chọn chuyến →",
      isFeatured: true,
      icon: Users,
    },
    {
      badge: "Chủ động giờ giấc",
      badgeColor: "bg-emerald-100 text-emerald-800",
      title: "GoRide Đặt Trước",
      description:
        "Lên lịch đón chuẩn xác từng phút cho các chuyến công tác sáng sớm hoặc lịch trình cố định quan trọng.",
      footerText: "Đón đúng giờ hẹn",
      actionText: "Lên lịch ngay →",
      icon: Calendar,
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-white" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-12">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#0050c8] block mb-2">
              Dịch vụ GoRide
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              Lựa chọn chuyến đi phù hợp mọi nhu cầu
            </h2>
          </div>
          <p className="text-slate-500 max-w-md mt-3 md:mt-0 text-sm leading-relaxed">
            Đa dạng phân khúc xe đời mới, chất lượng vệ sinh sạch sẽ cùng tiêu
            chuẩn tài xế văn minh.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className={`rounded-3xl p-7 relative flex flex-col justify-between transition-all group ${
                  service.isFeatured
                    ? "border-2 border-[#0050c8] bg-blue-50/20 shadow-md"
                    : "border border-slate-200 bg-white hover:border-blue-500/50 hover:shadow-lg"
                }`}
              >
                {service.isFeatured && (
                  <div className="absolute -top-3.5 right-6 bg-[#0050c8] text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-sm">
                    Gia đình yêu thích
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${service.badgeColor}`}
                    >
                      {service.badge}
                    </div>
                    <Icon
                      className={`w-5 h-5 ${service.isFeatured ? "text-[#0050c8]" : "text-slate-400 group-hover:text-[#0050c8]"} transition-colors`}
                    />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {service.title}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed mb-6 ${service.isFeatured ? "text-slate-600" : "text-slate-500"}`}
                  >
                    {service.description}
                  </p>
                </div>

                <div
                  className={`border-t pt-5 flex items-center justify-between ${service.isFeatured ? "border-blue-100" : "border-slate-100"}`}
                >
                  <span className="text-xs text-slate-400 font-medium">
                    {service.footerText}
                  </span>
                  <a
                    href="#booking-card"
                    className="text-[#0050c8] font-semibold text-sm hover:underline"
                  >
                    {service.actionText}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
