"use client";

import type { ReactNode } from "react";

interface FormSectionProps {
  number: number;
  title: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
  id?: string;
}

export default function FormSection({
  number,
  title,
  required = true,
  hint,
  children,
  id,
}: FormSectionProps) {
  return (
    <section
      id={id}
      className="bg-white rounded-[10px] p-4 mb-3 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]"
    >
      <div className="flex items-start gap-1.5 text-[15px] font-semibold text-gray-800 mb-3">
        <span className="text-[#1e3a5f] text-sm flex-shrink-0">{number}.</span>
        <span>{title}</span>
        {required && (
          <span className="text-red-500 text-sm flex-shrink-0 ml-0.5">*</span>
        )}
      </div>
      {hint && (
        <p className="text-[11px] text-gray-500 mb-2">{hint}</p>
      )}
      {children}
    </section>
  );
}