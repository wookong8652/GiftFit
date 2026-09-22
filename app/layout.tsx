import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GiftFit",
  description: "취향에 맞는 특별한 선물을 찾아보세요.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}