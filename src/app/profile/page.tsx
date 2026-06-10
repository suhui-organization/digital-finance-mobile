"use client";

import { clearCachedUser, clearTokens, getCachedUser, isAuthenticated, logout } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

const ROLE_LABELS: Record<string, string> = {
  super_admin: "超级管理员",
  admin: "管理员",
  mobile_user: "移动用户",
};

const STATUS_LABELS: Record<string, string> = {
  active: "正常",
  disabled: "已禁用",
};

export default function ProfilePage() {
  const router = useRouter();
  const [authChecked] = useState(() => isAuthenticated());
  const user = getCachedUser();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch { /* best effort */ }
    clearTokens();
    clearCachedUser();
    router.push("/login");
  }, [router]);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">
        验证身份中...
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="bg-[#1e3a5f] text-white p-5 rounded-[10px] mb-4 text-center shadow-[0_4px_12px_rgba(30,58,95,0.15)]">
        <h1 className="text-lg font-semibold tracking-[0.5px]">我的</h1>
        <p className="text-xs opacity-85 mt-1">账户信息与设置</p>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
          <div className="w-14 h-14 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white text-xl font-semibold">
            {(user?.display_name || user?.username || "U")[0].toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-gray-800">
              {user?.display_name || "--"}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              @{user?.username || "--"}
            </div>
          </div>
        </div>

        <ProfileRow label="角色" value={ROLE_LABELS[user?.role || ""] || user?.role || "--"} />
        <ProfileRow
          label="状态"
          value={STATUS_LABELS[user?.status || ""] || user?.status || "--"}
          valueClass={user?.status === "disabled" ? "text-red-500" : "text-green-600"}
        />

        <div className="pt-4 border-t border-gray-100 space-y-2">
          <Link
            href="/"
            className="block w-full text-center py-2.5 bg-[#1e3a5f] text-white text-sm rounded-lg font-medium"
          >
            去填报
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="block w-full text-center py-2.5 border border-gray-200 text-gray-500 text-sm rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {loggingOut ? "退出中..." : "退出登录"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-400">{label}</span>
      <span className={`text-sm font-medium ${valueClass || "text-gray-700"}`}>
        {value}
      </span>
    </div>
  );
}