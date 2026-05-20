import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

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
        <div style={{ display: 'flex', height: '100%', minWidth: 1180 }}>
          <Sidebar />
          <main style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0 }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
