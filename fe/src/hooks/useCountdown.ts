import { useCallback, useEffect, useState } from "react";

/** Đếm ngược từ `initial` giây về 0. Tự chạy khi mount; gọi restart() để đếm lại. */
export function useCountdown(initial = 60) {
  const [seconds, setSeconds] = useState(initial);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const restart = useCallback(() => setSeconds(initial), [initial]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return { seconds, isFinished: seconds <= 0, restart, formatted: `${mm}:${ss}` };
}
