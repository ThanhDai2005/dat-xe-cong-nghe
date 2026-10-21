# GoRide — Nền tảng đặt chuyến xe

GoRide là ứng dụng web đặt chuyến xe gồm giao diện đăng ký đăng nhập khách hàng, khu vực quản trị và REST API. Hệ thống hỗ trợ tìm chuyến, chọn điểm đón/trả, giữ ghế, tự động tính giá, thanh toán , thiết lập bảng giá và lên lịch vận hành chuyến xe.

## Mục lục

- [Chức năng chính](#chức-năng-chính)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Yêu cầu môi trường](#yêu-cầu-môi-trường)
- [Cài đặt và chạy dự án](#cài-đặt-và-chạy-dự-án)
- [API chính](#api-chính)
- [Quy tắc nghiệp vụ](#quy-tắc-nghiệp-vụ)
- [Cơ sở dữ liệu](#cơ-sở-dữ-liệu)
- [Kiểm thử và kiểm tra chất lượng](#kiểm-thử-và-kiểm-tra-chất-lượng)
- [Lưu ý triển khai](#lưu-ý-triển-khai)

## Chức năng chính

### Khách hàng

- Tìm tuyến theo điểm đi và điểm đến.
- Tìm chuyến theo tuyến, ngày đi và số ghế cần đặt.
- Xem chi tiết chuyến, phương tiện, điểm đón/trả và giá vé.
- Xem sơ đồ ghế và tình trạng chỗ trống theo thời gian thực.
- Chọn nhiều ghế, điểm đón, điểm trả và hình thức đặt xe.
- Giữ chỗ trong 15 phút và tự động tính tổng tiền.
- Thanh toán giả lập bằng tiền mặt, thẻ, MoMo, VNPay hoặc chuyển khoản.
- Xem kết quả thanh toán và chi tiết đơn đặt chuyến.

### Quản trị viên

- Đăng nhập khu vực quản trị tại `/admin/login`.
- Xem tuyến đường, phương tiện, hình thức đặt xe và loại xe.
- Tạo loại xe và gán loại xe cho phương tiện.
- Thiết lập giá theo tuyến, hình thức đặt xe và loại xe.
- Cập nhật hoặc ngừng áp dụng một cấu hình giá.
- Lên lịch và cập nhật chuyến xe.
- Theo dõi số ghế đã đặt trên từng chuyến.
- Mở, đóng nhận đặt chỗ hoặc hủy chuyến theo điều kiện nghiệp vụ.

### Xác thực và an toàn dữ liệu

- Access Token ký bằng RS256.
- Refresh Token được quản lý bằng Redis.
- Kiểm tra vai trò `CUSTOMER`, `DRIVER` và `ADMIN`.
- Giới hạn số lần đăng nhập sai tạm thời bằng Redis.
- Truy vấn MySQL có tham số và transaction cho các thao tác đặt vé, thanh toán và xếp lịch.
- Khóa dữ liệu khi giữ ghế để hạn chế đặt trùng trong các yêu cầu đồng thời.

## Công nghệ sử dụng

| Thành phần | Công nghệ |
| --- | --- |
| Frontend | React 19, TypeScript, Vite 8 |
| Giao diện | Tailwind CSS 4, Bootstrap 5, shadcn, Lucide React |
| Điều hướng | React Router 7 |
| Backend | Node.js, Express 5, CommonJS |
| Cơ sở dữ liệu | MySQL 8, mysql2 |
| Phiên đăng nhập | JWT RS256, Redis, ioredis |
| Mật khẩu | bcryptjs |
| Kiểm thử | Node.js Test Runner |

## Kiến trúc hệ thống

```mermaid
flowchart LR
    Customer[Khách hàng] --> FE[React + Vite]
    Admin[Quản trị viên] --> FE
    FE -->|REST / JSON| API[Express API]
    API -->|Dữ liệu nghiệp vụ| DB[(MySQL)]
    API -->|Phiên và chống brute-force| Redis[(Redis)]
```

Backend được chia theo miền nghiệp vụ:

- `auth`: đăng nhập, token và quản lý phiên.
- `customer`: danh mục tuyến/chuyến, đặt chỗ và thanh toán.
- `admin`: bảng giá, loại xe và lịch chạy chuyến.
- `middlewares`: xác thực request.
- `config`: cấu hình môi trường, MySQL và Redis.

## Cấu trúc thư mục

```text
dat-xe-cong-nghe/
├── be/
│   ├── certs/                  # Chứng chỉ kết nối MySQL SSL
│   ├── migrations/             # Migration nghiệp vụ đặt vé và quản trị
│   ├── scripts/                # Script migration và tạo khóa JWT
│   ├── src/
│   │   ├── .env                # Cấu hình backend, không commit
│   │   ├── admin/              # API và nghiệp vụ quản trị
│   │   ├── auth/               # Đăng nhập, token, refresh token
│   │   ├── config/             # Env và Redis
│   │   ├── customer/           # Đặt vé, danh mục, thanh toán
│   │   ├── middlewares/        # Middleware xác thực
│   │   ├── utils/              # Tiện ích múi giờ
│   │   └── database.js         # MySQL connection pool
│   ├── test/                   # Kiểm thử backend
│   └── index.js                # Điểm khởi chạy API
├── fe/
│   ├── public/                 # Tài nguyên tĩnh
│   └── src/
│       ├── components/         # UI dùng lại
│       ├── hooks/              # React hooks
│       ├── lib/                # HTTP client và tiện
│       ├── pages/              # Trang khách hàng và Admin
│       ├── routes/             # Cấu hình route
│       ├── services/           # Giao tiếp API
│       └── stores/             # Trạng thái xác thực
└── README.md
```

## Yêu cầu môi trường

- Node.js `20.19+` hoặc `22.12+`.
- npm.
- MySQL 8.
- Redis 6 trở lên.
- Chứng chỉ CA nếu MySQL yêu cầu SSL.

Dữ liệu nền cần có trước khi sử dụng toàn bộ luồng:

- Ít nhất một tài khoản `ADMIN` có trạng thái `ACTIVE`.
- Tuyến đường và điểm đón/trả đang hoạt động.
- Phương tiện đang hoạt động và có số ghế hợp lệ.
- Ít nhất một hình thức đặt xe.

## Cài đặt và chạy dự án

### 1. Cài dependency

```bash
cd be
npm install

cd ../fe
npm install
```

### 2. Cấu hình backend

Tạo file `be/src/.env`:

```dotenv
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
DB_SSL_CA=certs/ca.pem

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
```

`DB_SSL_CA` được tính tương đối từ thư mục `be`. Với cấu trúc mặc định, chứng chỉ đặt tại `be/certs/ca.pem`.

Có thể tạo cặp khóa JWT bằng lệnh:

```bash
cd be
node scripts/generateKeys.js
```

Sao chép hai biến được sinh ra vào `be/src/.env`. Không commit khóa riêng tư hoặc file `.env` lên Git.

### 3. Cấu hình frontend

Tạo file `fe/.env.local` nếu cần thay đổi cấu hình mặc định:

```dotenv
VITE_API_BASE_URL=http://localhost:3000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

Nếu không khai báo `VITE_API_BASE_URL`, frontend mặc định gọi `http://localhost:3000/api`.

### 4. Chạy migration

Các bảng `users`, `routes`, `stops` và `vehicles` là dữ liệu nền của hệ thống. Sau khi cấu hình database, chạy migration cho miền đặt vé và quản trị:

```bash
cd be
npm run db:migrate:booking
```

Script migration có thể chạy lại; các bảng, cột và index đã tồn tại sẽ được bỏ qua khi phù hợp.

### 5. Khởi động Redis

Đảm bảo Redis đang chạy đúng host, port và mật khẩu đã khai báo trong `be/src/.env`.

### 6. Chạy backend

```bash
cd be
node index.js
```

API mặc định chạy tại `http://localhost:3000`.

### 7. Chạy frontend

Mở terminal khác:

```bash
cd fe
npm run dev
```

Frontend Vite mặc định chạy tại `http://localhost:5173`.

## API chính

Response thành công tuân theo cấu trúc chung:

```json
{
  "success": true,
  "message": "Thành công",
  "data": {}
}
```

Các endpoint cần đăng nhập sử dụng header:

```http
Authorization: Bearer <accessToken>
```

### Xác thực

Base URL: `/api/auth`

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| POST | `/login` | Đăng nhập cơ bản |
| POST | `/v1/login` | Đăng nhập có kiểm tra vai trò và giới hạn thử sai |
| POST | `/refresh-token` | Làm mới phiên đăng nhập |
| POST | `/logout` | Thu hồi phiên đăng nhập |

### Khách hàng

Base URL: `/api/customer/v1`

| Method | Endpoint | Quyền | Mô tả |
| --- | --- | --- | --- |
| GET | `/routes/search` | Công khai | Tìm tuyến đường |
| GET | `/booking-types` | Công khai | Lấy hình thức đặt xe |
| GET | `/trips/search` | Công khai | Tìm chuyến còn chỗ |
| GET | `/trips/:id` | Công khai | Xem chi tiết chuyến |
| GET | `/trips/:id/seats` | Công khai | Xem tình trạng ghế |
| POST | `/bookings` | Customer | Tạo đơn và giữ ghế |
| GET | `/bookings/:id` | Customer | Xem chi tiết đơn |
| POST | `/payments/process` | Customer | Thanh toán giả lập |

### Quản trị

Base URL: `/api/v1/admin`. Toàn bộ endpoint yêu cầu tài khoản `ADMIN` đang hoạt động.

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| GET | `/routes` | Lấy danh sách tuyến |
| GET | `/vehicles` | Lấy danh sách phương tiện |
| GET | `/booking-types` | Lấy hình thức đặt xe |
| GET | `/vehicle-types` | Lấy danh sách loại xe |
| POST | `/vehicle-types` | Tạo loại xe |
| PATCH | `/vehicles/:id/type` | Gán loại xe cho phương tiện |
| GET | `/fares` | Lấy bảng giá đang áp dụng |
| POST | `/fares` | Tạo cấu hình giá |
| PUT | `/fares/:id` | Cập nhật giá |
| DELETE | `/fares/:id` | Ngừng áp dụng giá |
| GET | `/trips` | Lọc và lấy danh sách chuyến |
| POST | `/trips` | Lên lịch chuyến mới |
| PUT | `/trips/:id` | Cập nhật lịch chuyến |
| PATCH | `/trips/:id/status` | Mở, đóng hoặc hủy chuyến |

## Quy tắc nghiệp vụ

### Giá vé

1. Hệ thống ưu tiên giá khớp tuyến, hình thức đặt xe và loại xe.
2. Nếu chưa có giá theo loại xe, hệ thống dùng giá chung của tuyến và hình thức đặt.
3. Nếu chưa có bảng giá phù hợp, hệ thống dùng giá mặc định của chuyến.
4. Tổng tiền bằng giá mỗi ghế nhân số ghế đã chọn.
5. Mỗi tổ hợp giá đang hoạt động chỉ có một cấu hình.

### Đặt chỗ

- Ghế phải nằm trong sức chứa của phương tiện và chưa được giữ hoặc xác nhận.
- Điểm đón và trả phải thuộc cùng tuyến, đúng loại điểm và đúng thứ tự di chuyển.
- Một đơn chờ thanh toán giữ ghế trong 15 phút.
- Khi hết hạn, đơn chuyển sang `EXPIRED` và ghế được giải phóng.
- Việc tạo đơn và giữ ghế được thực hiện trong cùng transaction.

### Thanh toán 

- Số tiền gửi lên phải khớp chính xác với tổng tiền của đơn.
- Đơn phải còn thời hạn và thuộc đúng khách hàng đang đăng nhập.
- Thanh toán thành công chuyển đơn sang `CONFIRMED` và trạng thái thanh toán sang `PAID`.
- Mỗi đơn chỉ có một giao dịch thanh toán.

### Lịch chuyến

- Tuyến và phương tiện phải đang hoạt động.
- Giờ khởi hành phải nằm trong tương lai và được lưu theo UTC.
- Một phương tiện không thể có hai chuyến trùng thời gian.
- Chuyến có khách không thể đổi tuyến, xe, giờ chạy hoặc hủy trực tiếp.
- Chuyến đã hủy không thể mở lại.

## Cơ sở dữ liệu

Các bảng chính:

| Nhóm | Bảng |
| --- | --- |
| Dữ liệu nền | `users`, `routes`, `stops`, `vehicles` |
| Danh mục | `booking_types`, `vehicle_types` |
| Vận hành | `trips`, `fares` |
| Đặt chỗ | `bookings`, `booking_seats` |
| Thanh toán | `payments` |

Migration hiện có:

- `002_booking_payment_schema.sql`: bảng đặt vé, chuyến, giá và thanh toán.
- `003_booking_customer_details.sql`: thông tin liên hệ và ghi chú của khách.
- `004_admin_fares_vehicle_types.sql`: loại xe và giá theo loại xe.

## Kiểm thử và kiểm tra chất lượng

### Backend

```bash
cd be
npm test
```

Bộ test bao phủ validation, tính giá, transaction giữ ghế, thanh toán, xung đột lịch xe và quy tắc hủy chuyến.

### Frontend

```bash
cd fe
npm run build
npm run lint
```

## Lưu ý triển khai

- CORS hiện chỉ cho phép origin từ `localhost` và `127.0.0.1`; cần cấu hình danh sách domain khi triển khai thật.
- Không dùng thanh toán giả lập cho môi trường production.
- Không ghi log token, mật khẩu, khóa JWT hoặc thông tin kết nối database.
- Luôn sử dụng HTTPS cho frontend và API.
- Redis phải được bảo vệ bằng xác thực và network policy phù hợp.
- Cần có quy trình backup MySQL và quản lý migration trước khi phát hành.
- Đảm bảo múi giờ hiển thị là `Asia/Ho_Chi_Minh`; thời gian trong database được xử lý theo UTC.

## Giấy phép

Backend hiện khai báo giấy phép ISC trong `be/package.json`. Nếu dự án được phát hành công khai, nên bổ sung file `LICENSE` tương ứng.
