"use client";

import {
  login as apiLogin,
  getLotteryActivity,
  lotteryDraw,
  type LotteryActivity,
  type LotteryDrawResponse,
} from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LotteryPage() {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<LotteryDrawResponse | null>(null);
  const [angle, setAngle] = useState(0);
  const [activity, setActivity] = useState<LotteryActivity | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [drawCount, setDrawCount] = useState(0);

  // Auto-login and load activity
  useEffect(() => {
    apiLogin("admin", "admin")
      .then(() => {
        setAuthReady(true);
        return getLotteryActivity();
      })
      .then((a) => setActivity(a))
      .catch(() => {});
  }, []);

  const activePrizes = activity?.prizes.filter((p) => p.name !== "谢谢参与") || [];
  const prizeLabels = [...activePrizes.map((p) => p.name), "谢谢参与"];
  // Ensure we have at least the defaults
  const displayPrizes = prizeLabels.length >= 2 ? prizeLabels : ["优惠券 50 元", "免息券 30 天", "感恩奖", "谢谢参与"];

  const spin = async () => {
    if (spinning || !authReady) return;
    setSpinning(true);
    setResult(null);

    try {
      const res = await lotteryDraw();
      const wonIndex = res.won
        ? displayPrizes.findIndex((p) => p === res.prize?.name)
        : displayPrizes.length - 1; // "谢谢参与"

      const targetIndex = wonIndex >= 0 ? wonIndex : displayPrizes.length - 1;
      const segmentAngle = 360 / displayPrizes.length;
      const targetAngle = 360 * 5 + segmentAngle * targetIndex + segmentAngle / 2;
      setAngle((prev) => prev + targetAngle);

      setTimeout(() => {
        setSpinning(false);
        setResult(res);
        setDrawCount((c) => c + 1);
      }, 4000);
    } catch {
      setSpinning(false);
    }
  };

  const segmentAngle = 360 / displayPrizes.length;

  return (
    <div className="flex flex-col items-center">
      <div className="bg-[#1e3a5f] text-white p-5 w-full rounded-[10px] mb-6 text-center shadow-[0_4px_12px_rgba(30,58,95,0.15)]">
        <h1 className="text-lg font-semibold">🎁 幸运大转盘</h1>
        <p className="text-xs opacity-85 mt-1">
          {activity?.is_active
            ? "审查完成即可参与抽奖"
            : "活动未开启"}
        </p>
      </div>

      <div className="relative w-72 h-72 mb-6">
        {/* Wheel */}
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          style={{
            transform: `rotate(${angle}deg)`,
            transition: spinning
              ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
              : "transform 0.5s ease-out",
          }}
        >
          {displayPrizes.map((_, i) => {
            const startAngle = i * segmentAngle;
            const endAngle = (i + 1) * segmentAngle;
            const startRad = ((startAngle - 90) * Math.PI) / 180;
            const endRad = ((endAngle - 90) * Math.PI) / 180;
            const r = 90;
            const x1 = 100 + r * Math.cos(startRad);
            const y1 = 100 + r * Math.sin(startRad);
            const x2 = 100 + r * Math.cos(endRad);
            const y2 = 100 + r * Math.sin(endRad);
            const fill = i % 2 === 0 ? "#1e3a5f" : "#3b82f6";
            return (
              <path
                key={i}
                d={`M100,100 L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z`}
                fill={fill}
                stroke="#fff"
                strokeWidth="1.5"
              />
            );
          })}
          <circle cx="100" cy="100" r="16" fill="#fff" stroke="#1e3a5f" strokeWidth="2" />
        </svg>

        {/* Pointer */}
        <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[24px] border-l-transparent border-r-transparent border-t-[#dc2626] z-10" />
      </div>

      <button
        type="button"
        onClick={spin}
        disabled={spinning || !authReady}
        className="w-full max-w-[280px] py-4 bg-[#1e3a5f] text-white rounded-[10px] font-semibold text-lg disabled:opacity-50 active:scale-[0.97] transition-transform shadow-[0_4px_12px_rgba(30,58,95,0.3)]"
      >
        {spinning ? "抽奖中..." : authReady ? "开始抽奖" : "连接服务器中..."}
      </button>

      {result && (
        <div className="mt-4 text-center">
          {result.won ? (
            <>
              <p className="text-sm text-gray-500">🎉 恭喜获得</p>
              <p className="text-xl font-semibold text-[#1e3a5f] mt-1">{result.prize?.name}</p>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500">😊 {result.message || "谢谢参与"}</p>
            </>
          )}
        </div>
      )}

      {drawCount > 0 && !spinning && (
        <div className="mt-2 text-xs text-gray-400">已抽 {drawCount} 次</div>
      )}

      <div className="mt-6 flex gap-4">
        {activePrizes.length > 0 && (
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-2">奖品池</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-[280px]">
              {activePrizes.map((p) => (
                <span key={p.id} className="text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-md px-2 py-1">
                  {p.name} ×{p.stock > 0 ? p.stock : "∞"}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <Link
        href="/"
        className="mt-6 text-sm text-[#3b82f6] underline"
      >
        ← 返回填写
      </Link>
    </div>
  );
}
