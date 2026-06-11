import ClientLayout from "@/components/ClientLayout";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "融资资质尽职审查报告",
  description: "数字金融审查 & 抽奖系统",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="flex justify-center min-h-screen pb-16">
        <div className="w-full max-w-[420px] px-4 pt-4">
          <ClientLayout>{children}</ClientLayout>
        </div>
      </body>
    </html>
  );
}
