"use client";

import { clearCachedUser, clearTokens, isAuthenticated, listMyReviews, type ReviewResponse } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function ReportsPage() {
  const router = useRouter();
  const [authChecked] = useState(() => isAuthenticated());
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const fetchData = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await listMyReviews(p, pageSize);
      setReviews(res.data);
      setTotalCount(res.total_count);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "加载失败";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authChecked) {
      clearTokens();
      clearCachedUser();
      router.push("/login");
      return;
    }
    fetchData(1);
  }, [authChecked, fetchData, router]);

  // Auth guard
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">
        验证身份中...
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  const goPrev = () => {
    const np = page - 1;
    setPage(np);
    fetchData(np);
  };
  const goNext = () => {
    const np = page + 1;
    setPage(np);
    fetchData(np);
  };

  return (
    <div className="pb-20">
      <div className="bg-[#1e3a5f] text-white p-5 rounded-[10px] mb-4 text-center shadow-[0_4px_12px_rgba(30,58,95,0.15)]">
        <h1 className="text-lg font-semibold tracking-[0.5px]">已填报数据</h1>
        <p className="text-xs opacity-85 mt-1">查看历史填报记录与状态</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-sm text-gray-400">
          加载中...
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm">
          <p className="text-sm text-gray-400 mb-3">{error}</p>
          <button
            onClick={() => fetchData(page)}
            className="text-sm text-[#3b82f6] underline"
          >
            重试
          </button>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center shadow-sm">
          <p className="text-3xl mb-3">📋</p>
          <p className="text-sm text-gray-400 mb-4">暂无填报记录</p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-[#1e3a5f] text-white text-sm rounded-lg font-medium"
          >
            去填写
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {reviews.map((r) => (
              <Link
                key={r.id}
                href={`/reports/${r.id}`}
                className="block bg-white rounded-xl p-4 shadow-sm border border-gray-50 hover:border-[#bfdbfe] transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm text-gray-800">{r.customer_name}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      r.customer_type === "enterprise"
                        ? "bg-[#fef3c7] text-[#92400e]"
                        : "bg-[#eff6ff] text-[#3b82f6]"
                    }`}
                  >
                    {r.customer_type === "enterprise" ? "企业" : "个人"}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>{r.loan_amount?.toLocaleString()} 元</span>
                  <span>{r.credit_status}</span>
                  {r.can_match ? (
                    <span className="text-green-600">已匹配</span>
                  ) : (
                    <span className="text-gray-400">未匹配</span>
                  )}
                </div>
                <div className="text-[11px] text-gray-300 mt-1.5">
                  {new Date(r.created_at).toLocaleString("zh-CN")}
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-4 text-sm">
              <button
                disabled={page <= 1}
                onClick={goPrev}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-30"
              >
                上一页
              </button>
              <span className="text-gray-400 text-xs">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={goNext}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-30"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}