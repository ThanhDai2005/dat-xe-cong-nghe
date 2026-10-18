
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// CORS: cho phép mọi port trên localhost
// ========================================
const corsOptions = {
  origin: (origin, callback) => {
    // Cho phép request từ curl, Postman hoặc server-to-server
    if (!origin) {
      return callback(null, true);
    }

    const allowed =
      /^http:\/\/localhost:\d+$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);

    if (allowed) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked: ${origin}`));
  },

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],

  credentials: true,
};

// Phải đặt trước tất cả routes
app.use(cors(corsOptions));

// ========================================
// Middleware xử lý request
// ========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================================
// Routes
// ========================================
const authRoutes = require("./src/auth/authRoutes");
const adminRouter = require("./src/admin/adminRouter");

app.use("/api/auth", authRoutes);
app.use("/api/v1/admin", adminRouter);
app.use("/api/admin", adminRouter);

// ========================================
// Route kiểm tra server
// ========================================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend đang hoạt động",
  });
});

// ========================================
// 404 handler
// ========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route không tồn tại",
  });
});

// ========================================
// Error handler
// ========================================
app.use((err, req, res, next) => {
  if (err.message && err.message.startsWith("CORS blocked:")) {
    return res.status(403).json({
      success: false,
      message: err.message,
    });
  }

  console.error("Server error:", err);

  res.status(500).json({
    success: false,
    message: "Lỗi server nội bộ",
  });
});

// ========================================
// Start server
// ========================================
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
