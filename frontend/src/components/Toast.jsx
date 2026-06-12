import { useEffect, useState } from "react";

export function Toast({ message, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) return;
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 3000);
    return () => clearTimeout(t);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div
      className={`fixed top-[70px] left-1/2 -translate-x-1/2 glass-dark text-white px-5 py-2.5 rounded-xl text-sm font-medium z-50 shadow-2xl whitespace-nowrap transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      }`}
    >
      {message}
    </div>
  );
}
