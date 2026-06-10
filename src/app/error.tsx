"use client";

import { useEffect } from "react";

export default function MobileRootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Mobile app error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f0f2f5] text-center px-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">页面加载异常</h2>
      <p className="text-sm text-gray-500 mb-4">
        {error.message || "发生了未知错误，请稍后重试"}
      </p>
      <button
        onClick={reset}
        className="px-5 py-2.5 bg-[#3b82f6] text-white rounded-lg text-sm font-medium hover:bg-[#2563eb] transition-colors"
      >
        重新加载
      </button>
    </div>
  );
}