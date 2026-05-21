import type { Metadata } from "next";
import "./globals.css";
import { AuthWrapper } from "@/components/auth-wrapper";

export const metadata: Metadata = {
  title: "盎然内容 · 工作台",
  description: "AI 驱动的多平台内容创作平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="h-full">
        <AuthWrapper>
          {children}
        </AuthWrapper>
      </body>
    </html>
  );
}
