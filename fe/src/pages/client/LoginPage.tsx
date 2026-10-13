import { Car, BadgeCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/login-form";

const avatars = [
  { label: "HN", className: "bg-[#00668a]" },
  { label: "SG", className: "bg-[#0050c8]" },
  { label: "ĐN", className: "bg-[#006645]" },
];

export default function LoginPage() {
  return (
    <AuthShell
      badge="🚗 Dịch vụ gọi xe công nghệ GoRide"
      title="Kết nối chuyến đi an toàn & minh bạch."
      description="Nền tảng di chuyển công nghệ tiện lợi, chuẩn xác và tin cậy hàng đầu Việt Nam."
      icon={Car}
      footerIcon={BadgeCheck}
      footerTitle="⭐ 4.9/5 • Hơn 2.5 triệu chuyến đi thành công"
      footerDesc="Đối tác tin cậy tại 63 tỉnh thành"
      footerAvatars={avatars}
    >
      <LoginForm />
    </AuthShell>
  );
}
