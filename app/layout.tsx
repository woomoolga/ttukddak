import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "뚝딱 - 사업자 맞춤 혜택 검색",
  description:
    "사업자번호 하나로 받을 수 있는 정부지원금, 세금 혜택, 마케팅 가이드를 한눈에 확인하세요.",
};

const navItems = [
  { href: "/", label: "혜택 조회" },
  { href: "/marketing", label: "마케팅 가이드" },
  { href: "/services", label: "IT 서비스" },
  { href: "/about", label: "뚝딱 소개" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-5">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-brand-blue"
            >
              뚝딱
            </Link>
            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-brand-orange-light hover:text-brand-orange"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t border-border">
          <div className="mx-auto flex h-14 max-w-3xl items-center justify-center px-5">
            <p className="text-xs text-muted">
              &copy; {new Date().getFullYear()} 뚝딱. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
