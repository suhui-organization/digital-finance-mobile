"use client";

import Link from "next/link";

interface SuccessModalProps {
  onReset: () => void;
  reviewId?: string | null;
}

export default function SuccessModal({ onReset }: SuccessModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[calc(100%-60px)] max-w-[360px] text-center shadow-xl">
        <div className="w-14 h-14 rounded-full bg-green-100 mx-auto mb-3 flex items-center justify-center text-2xl text-green-600">
          ✓
        </div>
        <h2 className="text-lg font-semibold mb-1.5">提交成功</h2>
        <p className="text-[13px] text-gray-500 mb-4">
          融资资质尽职审查报告已提交，请等待审核。
        </p>
        <button
          type="button"
          onClick={onReset}
          className="w-full py-3.5 bg-[#1e3a5f] text-white rounded-[10px] font-semibold text-base active:scale-[0.97] transition-transform mb-2"
        >
          确 定
        </button>
        <Link
          href="/lottery"
          className="block w-full py-3 bg-[#3b82f6] text-white rounded-[10px] font-semibold text-base text-center active:scale-[0.97] transition-transform"
        >
          🎁 去抽奖
        </Link>
      </div>
    </div>
  );
}