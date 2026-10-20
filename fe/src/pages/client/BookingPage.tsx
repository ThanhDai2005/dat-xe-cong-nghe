
import { useState, type FormEvent, type ChangeEvent } from "react";
import {
  MapPin,
  Navigation,
  CalendarDays,
  Users,
  Wallet,
  CarFront,
  ClipboardList,
  ShieldCheck,
  RotateCcw,
  ArrowRight,
  Clock3,
  CircleDollarSign,
} from "lucide-react";

type BookingForm = {
  customer_account_id: string;
  accepted_driver_id: string;
  pickup_position: string;
  pickup_address: string;
  destination_position: string;
  destination_address: string;
  requested_departure_at: string;
  seat_count: string;
  fare_per_seat: string;
  status: string;
  commission_policy_id: string;
  driver_rate_at_accept: string;
};

const initialForm: BookingForm = {
  customer_account_id: "",
  accepted_driver_id: "",
  pickup_position: "",
  pickup_address: "",
  destination_position: "",
  destination_address: "",
  requested_departure_at: "",
  seat_count: "4",
  fare_per_seat: "",
  status: "pending",
  commission_policy_id: "",
  driver_rate_at_accept: "",
};

type FieldProps = {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
};

const Field = ({
  label,
  required = false,
  error,
  hint,
  icon,
  children,
}: FieldProps) => (
  <div className="min-w-0">
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>

    {icon ? (
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </span>
        {children}
      </div>
    ) : (
      children
    )}

    {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    {!error && hint && (
      <p className="mt-1.5 text-xs leading-5 text-slate-400">{hint}</p>
    )}
  </div>
);

const inputClass =
  "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

const iconInputClass = `${inputClass} pl-11`;

const SectionHeading = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="mb-6 flex items-center gap-3.5">
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
      {icon}
    </div>
    <div className="min-w-0">
      <h2 className="text-base font-bold text-slate-900 sm:text-lg">
        {title}
      </h2>
      <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
        {description}
      </p>
    </div>
  </div>
);

const BookingPage = () => {
  const [form, setForm] = useState<BookingForm>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;

    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setMessage("");
  };

  const handleReset = () => {
    setForm(initialForm);
    setErrors({});
    setMessage("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};

    if (!form.customer_account_id.trim()) {
      nextErrors.customer_account_id = "Vui lòng nhập mã tài khoản khách hàng.";
    } else if (
      !Number.isSafeInteger(Number(form.customer_account_id)) ||
      Number(form.customer_account_id) <= 0
    ) {
      nextErrors.customer_account_id = "Mã tài khoản phải là số nguyên dương.";
    }

    if (!form.pickup_address.trim()) {
      nextErrors.pickup_address = "Vui lòng nhập điểm đón.";
    }

    if (!form.destination_address.trim()) {
      nextErrors.destination_address = "Vui lòng nhập điểm đến.";
    }

    if (!form.requested_departure_at) {
      nextErrors.requested_departure_at =
        "Vui lòng chọn thời gian khởi hành.";
    }

    if (!form.seat_count || !Number.isInteger(Number(form.seat_count))) {
      nextErrors.seat_count = "Số ghế phải là số nguyên.";
    } else if (Number(form.seat_count) < 1) {
      nextErrors.seat_count = "Số ghế phải lớn hơn 0.";
    }

    if (
      form.fare_per_seat !== "" &&
      (!Number.isFinite(Number(form.fare_per_seat)) ||
        Number(form.fare_per_seat) < 0)
    ) {
      nextErrors.fare_per_seat = "Giá mỗi ghế không hợp lệ.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setMessage("");
      return;
    }

    const payload = {
      customer_account_id: Number(form.customer_account_id),
      accepted_driver_id: form.accepted_driver_id
        ? Number(form.accepted_driver_id)
        : null,
      pickup_position: form.pickup_position || null,
      pickup_address: form.pickup_address.trim(),
      destination_position: form.destination_position || null,
      destination_address: form.destination_address.trim(),
      requested_departure_at: form.requested_departure_at,
      seat_count: Number(form.seat_count),
      fare_per_seat:
        form.fare_per_seat === "" ? null : Number(form.fare_per_seat),
      status: form.status,
      commission_policy_id: form.commission_policy_id
        ? Number(form.commission_policy_id)
        : null,
      driver_rate_at_accept:
        form.driver_rate_at_accept === ""
          ? null
          : Number(form.driver_rate_at_accept),
    };

    // Chưa gọi API. Kết nối endpoint Spring Boot tại đây.
    console.log("BOOKING_REQUEST payload:", payload);
    setMessage(
      "Dữ liệu hợp lệ. Chưa lưu vào cơ sở dữ liệu vì chưa kết nối API."
    );
  };

  const formatCurrency = (value: string) => {
    if (value === "" || !Number.isFinite(Number(value))) {
      return "Chưa xác định";
    }

    return `${Number(value).toLocaleString("vi-VN")} đ`;
  };

  const departureLabel = form.requested_departure_at
    ? form.requested_departure_at.replace("T", " ")
    : "Chưa chọn thời gian";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 sm:py-9 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
              <CarFront size={16} />
              GORIDE BOOKING
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Tạo yêu cầu đặt xe
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Nhập thông tin chuyến đi để tạo yêu cầu đặt xe của bạn.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Yêu cầu đặt xe mới
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
            {/* Form chính */}
            <div className="space-y-6 lg:col-span-8">
              {/* Lộ trình */}
              <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
                <SectionHeading
                  icon={<Navigation size={21} />}
                  title="Thông tin chuyến đi"
                  description="Cung cấp điểm đón, điểm đến và thời gian khởi hành."
                />

                <div className="space-y-5">
                  <Field
                    label="Điểm đón"
                    required
                    error={errors.pickup_address}
                    icon={<MapPin size={19} className="text-emerald-600" />}
                  >
                    <input
                      name="pickup_address"
                      value={form.pickup_address}
                      onChange={handleChange}
                      placeholder="Nhập địa chỉ đón"
                      className={`${iconInputClass} ${
                        errors.pickup_address ? "border-red-400" : ""
                      }`}
                    />
                  </Field>

                  <Field
                    label="Tọa độ điểm đón (point)"
                    hint="Nhập tọa độ theo định dạng mà backend quy định."
                  >
                    <input
                      name="pickup_position"
                      value={form.pickup_position}
                      onChange={handleChange}
                      placeholder="Tọa độ điểm đón"
                      className={inputClass}
                    />
                  </Field>

                  <div className="ml-5 h-5 border-l-2 border-dashed border-slate-200" />

                  <Field
                    label="Điểm đến"
                    required
                    error={errors.destination_address}
                    icon={<Navigation size={18} className="text-red-500" />}
                  >
                    <input
                      name="destination_address"
                      value={form.destination_address}
                      onChange={handleChange}
                      placeholder="Nhập địa chỉ điểm đến"
                      className={`${iconInputClass} ${
                        errors.destination_address ? "border-red-400" : ""
                      }`}
                    />
                  </Field>

                  <Field
                    label="Tọa độ điểm đến (point)"
                    hint="Có thể tích hợp Google Maps để lấy tọa độ tự động."
                  >
                    <input
                      name="destination_position"
                      value={form.destination_position}
                      onChange={handleChange}
                      placeholder="Tọa độ điểm đến"
                      className={inputClass}
                    />
                  </Field>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field
                      label="Thời gian khởi hành"
                      required
                      error={errors.requested_departure_at}
                      icon={<CalendarDays size={18} />}
                    >
                      <input
                        name="requested_departure_at"
                        type="datetime-local"
                        value={form.requested_departure_at}
                        onChange={handleChange}
                        className={`${iconInputClass} ${
                          errors.requested_departure_at
                            ? "border-red-400"
                            : ""
                        }`}
                      />
                    </Field>

                    <Field
                      label="Số ghế"
                      required
                      error={errors.seat_count}
                      icon={<Users size={18} />}
                    >
                      <input
                        name="seat_count"
                        type="number"
                        min="1"
                        step="1"
                        value={form.seat_count}
                        onChange={handleChange}
                        className={`${iconInputClass} ${
                          errors.seat_count ? "border-red-400" : ""
                        }`}
                      />
                    </Field>
                  </div>
                </div>
              </section>

              {/* Tài khoản và trạng thái */}
              <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
                <SectionHeading
                  icon={<ClipboardList size={21} />}
                  title="Thông tin yêu cầu"
                  description="Các mã liên kết và trạng thái trong BOOKING_REQUEST."
                />

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field
                    label="Mã tài khoản khách hàng"
                    required
                    error={errors.customer_account_id}
                  >
                    <input
                      name="customer_account_id"
                      type="number"
                      min="1"
                      value={form.customer_account_id}
                      onChange={handleChange}
                      placeholder="customer_account_id"
                      className={`${inputClass} ${
                        errors.customer_account_id ? "border-red-400" : ""
                      }`}
                    />
                  </Field>

                  <Field
                    label="Mã tài xế tiếp nhận"
                    hint="Thường do hệ thống cập nhật khi tài xế nhận chuyến."
                  >
                    <input
                      name="accepted_driver_id"
                      type="number"
                      min="1"
                      value={form.accepted_driver_id}
                      onChange={handleChange}
                      placeholder="accepted_driver_id"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Mã chính sách hoa hồng">
                    <input
                      name="commission_policy_id"
                      type="number"
                      min="1"
                      value={form.commission_policy_id}
                      onChange={handleChange}
                      placeholder="commission_policy_id"
                      className={inputClass}
                    />
                  </Field>

                  <Field
                    label="Trạng thái yêu cầu"
                    hint="Cần đồng bộ với enum trạng thái backend."
                  >
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="pending">Chờ xử lý</option>
                      <option value="accepted">Đã tiếp nhận</option>
                      <option value="in_progress">Đang thực hiện</option>
                      <option value="completed">Hoàn thành</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  </Field>
                </div>
              </section>

              {/* Giá cước */}
              <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
                <SectionHeading
                  icon={<Wallet size={21} />}
                  title="Thông tin giá cước"
                  description="Các trường giá trị decimal trong cơ sở dữ liệu."
                />

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field
                    label="Giá mỗi ghế"
                    error={errors.fare_per_seat}
                    hint="Giá cần được xác thực theo chính sách hệ thống."
                    icon={<CircleDollarSign size={18} />}
                  >
                    <input
                      name="fare_per_seat"
                      type="number"
                      min="0"
                      step="any"
                      value={form.fare_per_seat}
                      onChange={handleChange}
                      placeholder="Nhập giá mỗi ghế"
                      className={`${iconInputClass} ${
                        errors.fare_per_seat ? "border-red-400" : ""
                      }`}
                    />
                  </Field>

                  <Field
                    label="Tỷ lệ tài xế khi tiếp nhận"
                    hint="Đơn vị lưu trữ cần thống nhất với backend."
                    icon={<Wallet size={18} />}
                  >
                    <input
                      name="driver_rate_at_accept"
                      type="number"
                      min="0"
                      step="any"
                      value={form.driver_rate_at_accept}
                      onChange={handleChange}
                      placeholder="driver_rate_at_accept"
                      className={iconInputClass}
                    />
                  </Field>
                </div>
              </section>
            </div>

            {/* Tóm tắt */}
            <aside className="space-y-5 lg:sticky lg:top-6 lg:col-span-4">
              <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="bg-emerald-600 px-5 py-5 text-white sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                      <CarFront size={24} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">
                        Tóm tắt chuyến đi
                      </h2>
                      <p className="mt-1 text-xs text-emerald-50">
                        Thông tin đặt xe
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="space-y-5">
                    <div className="flex gap-3">
                      <span className="mt-1 flex h-3 w-3 shrink-0 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
                      <div className="min-w-0 flex-1">
                        <p className="mb-1 text-xs text-slate-400">
                          ĐIỂM ĐÓN
                        </p>
                        <p className="break-words text-sm font-semibold text-slate-800">
                          {form.pickup_address || "Chưa nhập điểm đón"}
                        </p>
                      </div>
                    </div>

                    <div className="ml-1.5 h-6 border-l-2 border-dashed border-slate-200" />

                    <div className="flex gap-3">
                      <span className="mt-1 flex h-3 w-3 shrink-0 rounded-full bg-red-500 ring-4 ring-red-50" />
                      <div className="min-w-0 flex-1">
                        <p className="mb-1 text-xs text-slate-400">
                          ĐIỂM ĐẾN
                        </p>
                        <p className="break-words text-sm font-semibold text-slate-800">
                          {form.destination_address || "Chưa nhập điểm đến"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="my-6 border-t border-dashed border-slate-200" />

                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex shrink-0 items-center gap-2 text-xs text-slate-500">
                        <Clock3 size={16} />
                        Khởi hành
                      </span>
                      <span className="max-w-[60%] break-words text-right text-xs font-semibold text-slate-800">
                        {departureLabel}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-xs text-slate-500">
                        <Users size={16} />
                        Số ghế
                      </span>
                      <span className="text-sm font-bold text-slate-800">
                        {form.seat_count || "—"}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <span className="flex items-center gap-2 text-xs text-slate-500">
                        <Wallet size={16} />
                        Giá mỗi ghế
                      </span>
                      <span className="max-w-[60%] break-words text-right text-sm font-bold text-slate-800">
                        {formatCurrency(form.fare_per_seat)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl bg-emerald-50 p-4">
                    <p className="text-xs font-medium text-emerald-800">
                      Giá mỗi ghế đã nhập
                    </p>
                    <p className="mt-2 break-words text-2xl font-extrabold text-emerald-700">
                      {formatCurrency(form.fare_per_seat)}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-emerald-800/70">
                      Chưa phải tổng giá chuyến đi. Không tự động tính giá
                      hoặc phụ phí khi chưa có quy tắc nghiệp vụ.
                    </p>
                  </div>

                  <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                    <ShieldCheck
                      size={19}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />
                    <p className="text-xs leading-5 text-slate-500">
                      Backend cần xác thực tài khoản, tài xế, chính sách
                      hoa hồng và trạng thái trước khi lưu.
                    </p>
                  </div>
                </div>
              </section>

              <button
                type="submit"
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/15 transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 active:scale-[0.99]"
              >
                Tạo yêu cầu đặt xe
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <RotateCcw size={16} />
                Nhập lại thông tin
              </button>

              {message && (
                <div
                  role="status"
                  className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800"
                >
                  {message}
                </div>
              )}
            </aside>
          </div>
        </form>
      </div>
    </main>
  );
};

export default BookingPage;
