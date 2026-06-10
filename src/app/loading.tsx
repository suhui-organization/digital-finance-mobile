export default function MobileRootLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f0f2f5]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">加载中...</p>
      </div>
    </div>
  );
}