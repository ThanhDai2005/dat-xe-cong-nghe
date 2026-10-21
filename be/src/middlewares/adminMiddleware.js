/**
 * Middleware phân quyền chỉ cho phép role ADMIN truy cập.
 * Cần được đặt sau requireAuth:
 *   router.use(requireAuth, requireAdmin);
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Yêu cầu xác thực tài khoản",
      code: "UNAUTHORIZED",
    });
  }

  const role = (req.user.role || "").toUpperCase();
  if (role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền truy cập chức năng này (Yêu cầu quyền ADMIN)",
      code: "FORBIDDEN",
    });
  }

  next();
};

module.exports = { requireAdmin };
