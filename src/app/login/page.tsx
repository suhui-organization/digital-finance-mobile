"use client";

import { login } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MobileLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("请输入账号和密码");
      return;
    }

    setLoading(true);
    try {
      await login(username, password);
      router.push("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "登录失败";
      if (msg.includes("AUTH_USER_NOT_FOUND")) {
        setError("用户不存在，请检查账号是否正确");
      } else if (msg.includes("AUTH_INVALID_CREDENTIALS")) {
        setError("密码错误，请重新输入");
      } else if (msg.includes("AUTH_ACCOUNT_DISABLED")) {
        setError("账号已被禁用，请联系管理员");
      } else if (msg.includes("AUTH_FORBIDDEN")) {
        setError("无权登录该系统，请检查账号角色");
      } else {
        setError("登录失败，请稍后重试");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="w-full max-w-[380px] mx-4">
        <div className="bg-[#1e3a5f] text-white p-6 rounded-[10px] mb-5 text-center shadow-[0_4px_12px_rgba(30,58,95,0.15)]">
          <h1 className="text-lg font-semibold tracking-[0.5px]">融资资质尽职审查</h1>
          <p className="text-xs opacity-85 mt-1">Digital Finance Mobile</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-5 text-center">用户登录</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">账号</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入账号"
                className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-lg text-sm bg-[#fafbfc] focus:outline-none focus:border-[#3b82f6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded-lg text-sm bg-[#fafbfc] focus:outline-none focus:border-[#3b82f6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#1e3a5f] text-white rounded-[10px] font-semibold text-sm tracking-[1px] active:scale-[0.97] transition-transform disabled:opacity-50"
            >
              {loading ? "登录中..." : "登 录"}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-4">
            账号由管理员创建，请联系管理员获取
          </p>
        </div>
      </div>
    </div>
  );
}