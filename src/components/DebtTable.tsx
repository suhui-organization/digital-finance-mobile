"use client";

import type { DebtDetail } from "@/lib/types";

interface DebtTableProps {
  items: DebtDetail[];
  onChange: (items: DebtDetail[]) => void;
}

const loanMethods = ["信用贷款", "抵押贷款", "担保贷款", "信用卡", "其他"];
const repayMethods = ["等额本息", "等额本金", "先息后本", "到期还本", "随借随还", "其他"];

export default function DebtTable({ items, onChange }: DebtTableProps) {
  const MAX = 5;
  const MIN = 1;

  const updateItem = (idx: number, field: keyof DebtDetail, val: string | number) => {
    const next = items.map((item, i) => (i === idx ? { ...item, [field]: val } : item));
    onChange(next);
  };

  const addRow = () => {
    if (items.length >= MAX) return;
    onChange([...items, { institution: "", totalAmount: 0, balance: 0, loanMethod: "", loanDue: "", repaymentMethod: "" }]);
  };

  const removeRow = (idx: number) => {
    if (items.length <= MIN) return;
    onChange(items.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <p className="text-[11px] text-gray-500 mb-2">此题最少需添加1行记录，最多可添加5行记录</p>
      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full border-collapse text-[11px] min-w-[720px]">
          <thead>
            <tr>
              {["贷款机构（含信用卡）*", "贷款总额 *", "余额 *", "贷款方式 *", "贷款期至 *", "还款方式 *", ""].map((h, i) => (
                <th key={i} className="bg-[#f8fafc] p-2 text-left font-medium text-[10px] text-gray-500 border-b-2 border-gray-200 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-100">
                <td className="p-1">
                  <input type="text" placeholder="请输入" value={item.institution}
                    onChange={(e) => updateItem(idx, "institution", e.target.value)}
                    className="w-full px-1.5 py-1.5 border border-gray-200 rounded-md text-xs bg-[#fafbfc] focus:outline-none focus:border-[#3b82f6]" />
                </td>
                <td className="p-1">
                  <input type="number" placeholder="0" value={item.totalAmount || ""}
                    onChange={(e) => updateItem(idx, "totalAmount", parseFloat(e.target.value) || 0)}
                    className="w-full px-1.5 py-1.5 border border-gray-200 rounded-md text-xs bg-[#fafbfc] focus:outline-none focus:border-[#3b82f6]" />
                </td>
                <td className="p-1">
                  <input type="number" placeholder="0" value={item.balance || ""}
                    onChange={(e) => updateItem(idx, "balance", parseFloat(e.target.value) || 0)}
                    className="w-full px-1.5 py-1.5 border border-gray-200 rounded-md text-xs bg-[#fafbfc] focus:outline-none focus:border-[#3b82f6]" />
                </td>
                <td className="p-1">
                  <select value={item.loanMethod}
                    onChange={(e) => updateItem(idx, "loanMethod", e.target.value)}
                    className="w-full px-1 py-1.5 border border-gray-200 rounded-md text-xs bg-[#fafbfc] focus:outline-none focus:border-[#3b82f6]">
                    <option value="">请选择</option>
                    {loanMethods.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </td>
                <td className="p-1">
                  <input type="text" placeholder="如 2026-12" value={item.loanDue}
                    onChange={(e) => updateItem(idx, "loanDue", e.target.value)}
                    className="w-full px-1.5 py-1.5 border border-gray-200 rounded-md text-xs bg-[#fafbfc] focus:outline-none focus:border-[#3b82f6]" />
                </td>
                <td className="p-1">
                  <select value={item.repaymentMethod}
                    onChange={(e) => updateItem(idx, "repaymentMethod", e.target.value)}
                    className="w-full px-1 py-1.5 border border-gray-200 rounded-md text-xs bg-[#fafbfc] focus:outline-none focus:border-[#3b82f6]">
                    <option value="">请选择</option>
                    {repayMethods.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </td>
                <td className="p-1 text-center">
                  <button type="button" onClick={() => removeRow(idx)}
                    className="w-7 h-7 rounded-full border border-red-500 text-red-500 flex items-center justify-center text-sm active:bg-red-500 active:text-white transition-colors">−</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={addRow} disabled={items.length >= MAX}
        className="w-full mt-2 py-2.5 text-[#3b82f6] bg-[#e8eefb] rounded-lg text-[13px] font-medium disabled:opacity-50 active:scale-[0.98] transition-transform">
        {items.length >= MAX ? `已达最大行数（${MAX}行）` : "＋ 添加一条记录"}
      </button>
    </div>
  );
}