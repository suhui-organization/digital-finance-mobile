"use client";

interface CreditQueryInputProps {
  value1m: number;
  value3m: number;
  value6m: number;
  onChange1m: (v: number) => void;
  onChange3m: (v: number) => void;
  onChange6m: (v: number) => void;
}

export default function CreditQueryInput({
  value1m, value3m, value6m,
  onChange1m, onChange3m, onChange6m,
}: CreditQueryInputProps) {
  const inputCls = "w-[60px] text-center px-2 py-2 border border-gray-200 rounded-lg text-sm bg-[#fafbfc] focus:outline-none focus:border-[#3b82f6]";
  return (
    <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500">
      <span className="whitespace-nowrap">近1月查询</span>
      <input type="number" min={0} step={1} value={value1m || ""} placeholder="0"
        onChange={(e) => onChange1m(parseInt(e.target.value) || 0)} className={inputCls} />
      <span className="whitespace-nowrap">次，</span>
      <span className="whitespace-nowrap">近3月查询</span>
      <input type="number" min={0} step={1} value={value3m || ""} placeholder="0"
        onChange={(e) => onChange3m(parseInt(e.target.value) || 0)} className={inputCls} />
      <span className="whitespace-nowrap">次，</span>
      <span className="whitespace-nowrap">近6月查询</span>
      <input type="number" min={0} step={1} value={value6m || ""} placeholder="0"
        onChange={(e) => onChange6m(parseInt(e.target.value) || 0)} className={inputCls} />
      <span className="whitespace-nowrap">次</span>
    </div>
  );
}