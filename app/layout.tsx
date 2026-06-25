import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import MobileNav from "./components/MobileNav";

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
  { href: "/about", label: "소개" },
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
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-brand-blue"
            >
              뚝딱
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden items-center gap-1 sm:flex">
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

            {/* Mobile Nav */}
            <MobileNav items={navItems} />
          </div>
        </header>

        {/* Main */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t border-border bg-surface">
          <div className="mx-auto max-w-5xl px-5 py-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <p className="text-sm font-bold text-brand-blue">뚝딱</p>
                <p className="text-xs text-muted leading-relaxed">
                  사업자를 위한 올인원 혜택 검색 서비스
                </p>
              </div>
              <div className="flex gap-8">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-foreground">서비스</p>
                  <div className="flex flex-col gap-1.5">
                    <Link href="/" className="text-xs text-muted hover:text-brand-orange transition-colors">혜택 조회</Link>
                    <Link href="/marketing" className="text-xs text-muted hover:text-brand-orange transition-colors">마케팅 가이드</Link>
                    <Link href="/services" className="text-xs text-muted hover:text-brand-orange transition-colors">IT 서비스</Link>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-foreground">회사</p>
                  <div className="flex flex-col gap-1.5">
                    <Link href="/about" className="text-xs text-muted hover:text-brand-orange transition-colors">소개</Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 border-t border-border pt-6">
              <p className="text-xs text-muted">
                &copy; {new Date().getFullYear()} 뚝딱. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
