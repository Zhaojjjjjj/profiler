import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "AI 人格画像系统",
	description: "基于深度访谈的 AI 人格分析工具",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="zh-CN">
			<body className="antialiased">{children}</body>
		</html>
	);
}
