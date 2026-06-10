"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "info" | "success" | "error";
  onClose: () => void;
}

export default function Toast({ message, type = "info", onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === "success"
      ? "bg-green-600"
      : type === "error"
        ? "bg-red-600"
        : "bg-[#1e3a5f]";

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div
        className={`${bgColor} text-white px-5 py-2.5 rounded-lg text-[13px] whitespace-nowrap shadow-lg`}
      >
        {message}
      </div>
    </div>
  );
}