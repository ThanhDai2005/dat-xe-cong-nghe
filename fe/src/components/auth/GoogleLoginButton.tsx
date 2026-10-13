import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (c: { client_id: string; callback: (r: { credential: string }) => void }) => void;
          renderButton: (el: HTMLElement, o: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const GSI_SRC = "https://accounts.google.com/gsi/client";
const CLIENT_ID: string | undefined = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const loadGsi = () =>
  new Promise<void>((resolve, reject) => {
    if (window.google) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
    const s = existing ?? Object.assign(document.createElement("script"), { src: GSI_SRC, async: true });
    s.addEventListener("load", () => resolve());
    s.addEventListener("error", () => reject(new Error("gsi")));
    if (!existing) document.head.appendChild(s);
  });

interface Props {
  onCredential: (idToken: string) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
}

/** Nút giao diện theo Stitch, phủ lên trên là nút Google Identity Services (trong suốt) để lấy idToken. */
export const GoogleLoginButton = ({ onCredential, onError, disabled }: Props) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const cbRef = useRef({ onCredential, onError });
  const [ready, setReady] = useState(false);

  useEffect(() => { cbRef.current = { onCredential, onError }; });

  useEffect(() => {
    if (!CLIENT_ID || !hostRef.current) return;
    let cancelled = false;
    loadGsi()
      .then(() => {
        if (cancelled || !hostRef.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (r) => cbRef.current.onCredential(r.credential),
        });
        window.google.accounts.id.renderButton(hostRef.current, {
          type: "standard", theme: "outline", size: "large",
          width: Math.min(400, hostRef.current.offsetWidth),
        });
        setReady(true);
      })
      .catch(() => cbRef.current.onError?.("Không tải được Google. Vui lòng kiểm tra kết nối mạng."));
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="relative">
      <div
        aria-hidden
        className="w-full h-12 rounded-xl bg-white hover:bg-[#f2f3ff] shadow-sm flex items-center justify-center gap-2 font-semibold text-[15px] text-[#131b2e] transition-all"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Đăng nhập với Google
      </div>
      <div
        ref={hostRef}
        className={`absolute inset-0 overflow-hidden opacity-0 ${disabled || !ready ? "pointer-events-none" : ""}`}
      />
    </div>
  );
};
