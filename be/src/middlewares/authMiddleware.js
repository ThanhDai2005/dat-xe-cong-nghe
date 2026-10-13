const { verifyAccessToken } = require("../auth/tokenService");

/**
 * Middleware xác thực Access Token từ header Authorization.
 * Gắn decoded payload vào req.user để các controller dùng tiếp.
 *
 * Dùng cho các route cần đăng nhập:
 *   router.get('/profile', requireAuth, profileController.get)
 */
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Bạn chưa đăng nhập. Vui lòng cung cấp Access Token",
    });
  }

  try {
    const decoded = await verifyAccessToken(token);
    req.user = decoded; // { sub (userId), role, status, jti, exp, iat }
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token đã hết hạn. Vui lòng làm mới token",
        code: "TOKEN_EXPIRED",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ hoặc đã bị thu hồi",
      code: "TOKEN_INVALID",
    });
  }
};

module.exports = { requireAuth };
