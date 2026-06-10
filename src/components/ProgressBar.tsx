"use client";

interface ProgressBarProps {
  filled: number;
  total: number;
}

export default function ProgressBar({ filled, total }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((filled / total) * 100) : 0;

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center text-xs text-gray-500 mb-1 px-1">
        <span>填写进度</span>
        <span>
          {filled}/{total} 题
        </span>
      </div>
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#1e3a5f] rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}