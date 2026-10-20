import { useState, useEffect, useCallback } from "react";
import type { AuthUser } from "@/services/auth.service";
import {
  getUser,
  isAuthenticated as checkAuth,
  clearAuth,
  getProfile,
  normalizeAuthUser,
} from "@/services/auth.service";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => checkAuth());
  const [user, setUser] = useState<AuthUser | null>(() => getUser());
  const [loading, setLoading] = useState(false);

  const updateAuthState = useCallback(() => {
    const authed = checkAuth();
    setIsAuthenticated(authed);
    setUser(getUser());
  }, []);

  useEffect(() => {
    window.addEventListener("auth-change", updateAuthState);
    window.addEventListener("storage", updateAuthState);

    // Nếu đã đăng nhập nhưng chưa có dữ liệu user trong localStorage, lấy profile từ backend
    if (checkAuth() && !getUser()) {
      setLoading(true);
      getProfile()
        .then((res) => {
          if (res?.data) {
            const profile = normalizeAuthUser(res.data);
            localStorage.setItem("user", JSON.stringify(profile));
            setUser(profile);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }

    return () => {
      window.removeEventListener("auth-change", updateAuthState);
      window.removeEventListener("storage", updateAuthState);
    };
  }, [updateAuthState]);

  const logout = useCallback(() => {
    clearAuth();
    updateAuthState();
  }, [updateAuthState]);

  return {
    isAuthenticated,
    user,
    loading,
    logout,
  };
};
