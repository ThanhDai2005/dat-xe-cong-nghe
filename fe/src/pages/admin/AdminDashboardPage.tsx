import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import {
  ArrowRight,
  CalendarDays,
  CarFront,
  CreditCard,
  MapPin,
  Plus,
  RefreshCw,
  RotateCcw,
  Ticket,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  adminApi,
  adminErrorMessage,
  currency,
  type DashboardStats,
} from "@/services/admin.service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = () => {
    setLoading(true);
    adminApi
      .dashboardStats()
      .then(setStats)
      .catch((err) => setError(adminErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-900 border-t-transparent dark:border-white" />
          <p className="text-xs font-semibold text-slate-500">Đang đồng bộ dữ liệu thời gian thực...</p>
        </div>
      </div>
    );
  }

  const totalRevenue = stats?.totalRevenue ?? 0;
  const activeTrips = stats?.activeTrips ?? 0;
  const bookedSeats = stats?.bookedSeats ?? 0;
  const activeVehicles = stats?.activeVehicles ?? 0;
  const monthlyRevenue = stats?.monthlyRevenue ?? [];
  const recentBookings = stats?.recentBookings ?? [];
  const totalBookings = stats?.totalBookings ?? 0;

  return (
    <div className="space-y-6">
      {/* ===== Top Heading & Quick Actions Bar ===== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Bảng Điều Khiển Trung Tâm
            </h1>
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-bold dark:bg-emerald-950/40 dark:text-emerald-300">
              Live Production
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Tổng quan hiệu suất khai thác vận tải hành khách liên tỉnh theo thời gian thực GoRide.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition-colors"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Đồng bộ DB</span>
          </button>
          <Button
            onClick={() => navigate("/admin/trips")}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-slate-800 dark:bg-white dark:text-slate-900"
          >
            <Plus size={14} className="mr-1.5" />
            Lên lịch chuyến mới
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {/* ===== Operational Quick Action Cards ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { title: "Lịch chuyến xe", count: `${activeTrips} chuyến mở`, icon: CalendarDays, href: "/admin/trips", color: "text-blue-600 bg-blue-50 dark:bg-blue-950/50" },
          { title: "Tuyến đường", count: `${stats?.totalRoutes ?? 0} hành lang`, icon: MapPin, href: "/admin/routes", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50" },
          { title: "Đội phương tiện", count: `${activeVehicles} xe hoạt động`, icon: CarFront, href: "/admin/vehicles", color: "text-purple-600 bg-purple-50 dark:bg-purple-950/50" },
          { title: "Đơn đặt chuyến", count: `${totalBookings} đơn vé`, icon: Ticket, href: "/admin/bookings", color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50" },
          { title: "Đối soát GD", count: "Xem báo cáo", icon: CreditCard, href: "/admin/payments", color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50" },
          { title: "Hủy & Hoàn tiền", count: "Xử lý ngay", icon: RotateCcw, href: "/admin/cancellations", color: "text-rose-600 bg-rose-50 dark:bg-rose-950/50" },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              to={action.href}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all dark:border-slate-800 dark:bg-slate-900 !no-underline group"
            >
              <div className="flex items-center justify-between">
                <div className={`grid h-8 w-8 place-items-center rounded-xl ${action.color}`}>
                  <Icon size={16} />
                </div>
                <ArrowRight size={13} className="text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="mt-3">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  {action.title}
                </p>
                <span className="text-[11px] font-medium text-slate-400">
                  {action.count}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ===== Tabs: Overview, Analytics ===== */}
      <Tabs defaultValue="overview" className="space-y-4">
        <div className="w-full overflow-x-auto pb-1">
          <TabsList className="rounded-xl bg-slate-200/60 dark:bg-slate-900 p-1">
            <TabsTrigger value="overview" className="rounded-lg text-xs font-bold">Tổng quan số liệu</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg text-xs font-bold">Chỉ số vận hành</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          {/* ===== 4 Metric Cards ===== */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Total Revenue */}
            <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng doanh thu</CardTitle>
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/50 p-2 text-emerald-600">
                  <TrendingUp size={16} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {currency(totalRevenue)}
                </div>
                <p className="mt-1 text-[11px] text-slate-500 font-medium">
                  Từ {totalBookings} đơn đặt chỗ thành công
                </p>
              </CardContent>
            </Card>

            {/* Card 2: Active Trips */}
            <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chuyến đang mở</CardTitle>
                <div className="rounded-xl bg-blue-50 dark:bg-blue-950/50 p-2 text-blue-600">
                  <CalendarDays size={16} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-slate-900 dark:text-white">{activeTrips}</div>
                <p className="mt-1 text-[11px] text-slate-500 font-medium">
                  Tổng {stats?.totalTrips ?? 0} chuyến trong hệ thống
                </p>
              </CardContent>
            </Card>

            {/* Card 3: Booked Seats */}
            <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ghế đã đặt</CardTitle>
                <div className="rounded-xl bg-purple-50 dark:bg-purple-950/50 p-2 text-purple-600">
                  <Users size={16} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-slate-900 dark:text-white">{bookedSeats}</div>
                <p className="mt-1 text-[11px] text-slate-500 font-medium">
                  Ghế CONFIRMED + PENDING hiện tại
                </p>
              </CardContent>
            </Card>

            {/* Card 4: Active Vehicles */}
            <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Xe đang hoạt động</CardTitle>
                <div className="rounded-xl bg-amber-50 dark:bg-amber-950/50 p-2 text-amber-600">
                  <CarFront size={16} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-slate-900 dark:text-white">{activeVehicles}</div>
                <p className="mt-1 text-[11px] text-slate-500 font-medium">
                  {stats?.totalRoutes ?? 0} tuyến · {stats?.totalFares ?? 0} cấu hình giá
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ===== 2 Columns Grid: Overview BarChart & Recent Bookings ===== */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
            {/* Overview Card (4/7) */}
            <Card className="col-span-1 lg:col-span-4 rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-xs">
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Biểu Đồ Doanh Thu Tháng
                </CardTitle>
                <CardDescription className="text-xs">
                  Biểu đồ doanh thu từ các đơn đặt chỗ đã xác nhận trong năm {new Date().getFullYear()}
                </CardDescription>
              </CardHeader>
              <CardContent className="ps-2">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={monthlyRevenue}>
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) =>
                        value >= 1_000_000
                          ? `${(value / 1_000_000).toFixed(0)}tr`
                          : value >= 1_000
                            ? `${(value / 1_000).toFixed(0)}k`
                            : `${value}`
                      }
                    />
                    <Tooltip
                      formatter={(value: any) => [currency(Number(value) || 0), "Doanh thu"]}
                      labelStyle={{ fontWeight: 600 }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid hsl(var(--border))",
                        background: "hsl(var(--popover))",
                        color: "hsl(var(--popover-foreground))",
                        fontSize: "12px",
                      }}
                    />
                    <Bar
                      dataKey="total"
                      fill="#2563eb"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Bookings Card (3/7) */}
            <Card className="col-span-1 lg:col-span-3 rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                    Đặt Chỗ Gần Đây
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {totalBookings > 0
                      ? `Hiển thị 5 đơn đặt mới nhất trên hệ thống`
                      : "Chưa có đơn đặt chỗ nào"}
                  </CardDescription>
                </div>
                <Link
                  to="/admin/bookings"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 !no-underline"
                >
                  Tất cả <ArrowRight size={12} />
                </Link>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4">
                  {recentBookings.length > 0 ? (
                    recentBookings.map((booking) => (
                      <div key={booking.bookingId} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <Avatar className="h-8 w-8 rounded-lg">
                          <AvatarFallback className="rounded-lg bg-blue-100 dark:bg-blue-950 font-bold text-blue-600 text-xs">
                            {(booking.customerName || booking.origin || "?").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-1 flex-wrap items-center justify-between gap-1">
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                              {booking.customerName || "Khách hàng"}
                            </p>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1">
                              {booking.origin} → {booking.destination}
                            </p>
                          </div>
                          <div className="font-bold text-xs text-slate-900 dark:text-white">
                            +{currency(booking.totalFare)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-400">
                      Chưa có đơn đặt chỗ nào.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Hiệu Suất Khai Thác Hạ Tầng
              </CardTitle>
              <CardDescription className="text-xs">
                Chỉ số phủ mạng lưới hành lang vận chuyển và năng lực phương tiện.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-4 text-center py-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
                <div className="py-2">
                  <div className="text-3xl font-black text-slate-900 dark:text-white">{stats?.totalRoutes ?? 0}</div>
                  <p className="text-xs text-slate-500 font-medium mt-1">Tuyến đường khai thác</p>
                </div>
                <div className="py-2">
                  <div className="text-3xl font-black text-emerald-600">{activeVehicles}</div>
                  <p className="text-xs text-slate-500 font-medium mt-1">Đội phương tiện hoạt động</p>
                </div>
                <div className="py-2">
                  <div className="text-3xl font-black text-blue-600">{stats?.totalFares ?? 0}</div>
                  <p className="text-xs text-slate-500 font-medium mt-1">Cấu hình bảng cước vé</p>
                </div>
                <div className="py-2">
                  <div className="text-3xl font-black text-purple-600">{stats?.totalBookings ?? 0}</div>
                  <p className="text-xs text-slate-500 font-medium mt-1">Tổng đơn vé phục vụ</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
