import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import type { AuthResult, AuthUser } from "@/services/authService";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  remember: boolean;
  setSession: (result: AuthResult, remember?: boolean) => void;
  updateUser: (partial: Partial<AuthUser>) => void;
  logout: () => void;
}

/** "Ghi nhớ đăng nhập" bật -> localStorage, tắt -> sessionStorage */
const hybridStorage: StateStorage = {
  getItem: (k) => localStorage.getItem(k) ?? sessionStorage.getItem(k),
  setItem: (k, v) => {
    const remember = JSON.parse(v)?.state?.remember !== false;
    (remember ? sessionStorage : localStorage).removeItem(k);
    (remember ? localStorage : sessionStorage).setItem(k, v);
  },
  removeItem: (k) => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      remember: true,
      setSession: (r, remember = true) =>
        set({
          user: r.user,
          accessToken: r.accessToken,
          refreshToken: r.refreshToken ?? null,
          remember,
        }),
      updateUser: (partial) =>
        set((s) => (s.user ? { user: { ...s.user, ...partial } } : s)),
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    { name: "goride-auth", storage: createJSONStorage(() => hybridStorage) },
  ),
);
