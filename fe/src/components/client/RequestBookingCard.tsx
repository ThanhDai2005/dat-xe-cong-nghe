import { Link } from "react-router-dom";
export default function RequestBookingCard() {
  return <section className="rounded-3xl bg-white p-7 text-slate-800 shadow-xl space-y-4">
    <h2 className="text-2xl font-bold">Đặt xe theo yêu cầu</h2>
    <p>Chọn điểm đón, điểm đến và khởi hành trước ít nhất 5 giờ. Giá được tính theo quãng đường và số khách.</p>
    <p>Tài xế phù hợp sẽ nhận yêu cầu. Thanh toán trực tiếp cho tài xế.</p>
    <Link to="/booking" className="block rounded-xl bg-blue-700 px-5 py-3 text-center font-bold text-white">Tạo yêu cầu đặt xe</Link>
    <Link to="/trips" className="block text-center text-blue-700">Tra cứu chuyến của tôi</Link>
  </section>;
}
