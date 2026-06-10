"use client";

interface CheckboxGroupProps {
  options: { label: string; value: string }[];
  values: string[];
  onChange: (values: string[]) => void;
}

export default function CheckboxGroup({
  options,
  values,
  onChange,
}: CheckboxGroupProps) {
  const toggle = (val: string) => {
    if (values.includes(val)) {
      onChange(values.filter((v) => v !== val));
    } else {
      onChange([...values, val]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map((opt) => {
        const selected = values.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={`flex items-center gap-1.5 px-3 py-2 border-[1.5px] rounded-lg text-[13px] cursor-pointer transition-all active:scale-[0.98] ${
              selected
                ? "border-[#3b82f6] bg-[#e8eefb] text-[#1e3a5f]"
                : "border-[#e2e8f0] bg-[#fafbfc] text-gray-700"
            }`}
          >
            <span
              className={`w-[18px] h-[18px] rounded-[4px] border-2 flex-shrink-0 flex items-center justify-center transition-colors text-[11px] font-bold ${
                selected
                  ? "border-[#3b82f6] bg-[#3b82f6] text-white"
                  : "border-gray-300"
              }`}
            >
              {selected ? "✓" : ""}
            </span>
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}