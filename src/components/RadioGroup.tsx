"use client";

interface RadioGroupProps {
  name: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  variant?: "col-2" | "col-3" | "col-4";
}

export default function RadioGroup({
  options,
  value,
  onChange,
  variant = "col-2",
}: RadioGroupProps) {
  const cols = variant === "col-4" ? 4 : variant === "col-3" ? 3 : 2;

  return (
    <div
      className="flex flex-wrap gap-2.5"
      style={{ "--cols": cols } as React.CSSProperties}
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-1.5 px-3 py-2 border-[1.5px] rounded-lg text-[13px] cursor-pointer transition-all active:scale-[0.98] flex-1 min-w-0 ${
              selected
                ? "border-[#3b82f6] bg-[#e8eefb] text-[#1e3a5f]"
                : "border-[#e2e8f0] bg-[#fafbfc] text-gray-700"
            }`}
            style={{ flex: `1 1 calc(${100 / cols}% - 10px)` }}
          >
            <span
              className={`w-[18px] h-[18px] rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                selected ? "border-[#3b82f6]" : "border-gray-300"
              }`}
            >
              {selected && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
              )}
            </span>
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}