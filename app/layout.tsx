import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import MobileNav from "./components/MobileNav";
import ThemeToggle from "./components/ThemeToggle";

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
  openGraph: {
    title: "뚝딱 - 사업자 맞춤 혜택 검색",
    description: "사업자번호만 입력하면 받을 수 있는 모든 혜택을 찾아드립니다.",
    url: "https://ttukddak.woomoolga.com",
    siteName: "뚝딱",
    locale: "ko_KR",
    type: "website",
    images: [{ url: "https://ttukddak.woomoolga.com/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "뚝딱 - 사업자 맞춤 혜택 검색",
    description: "사업자번호만 입력하면 받을 수 있는 모든 혜택을 찾아드립니다.",
    images: ["https://ttukddak.woomoolga.com/og-image.jpg"],
  },
  verification: {
    google: "3T59mOhyYOegKlpC9pLQL9rw8t4Nm-WFIZoK1_e4gic",
    other: {
      "naver-site-verification": "d56e8c68f15fec7e90d890bcc1dd212f284678fb",
    },
  },
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
      suppressHydrationWarning
    >
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0782141543357042"
          crossOrigin="anonymous"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
        <script async src="https://portal.woomoolga.com/t.js" />
      </head>
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
              <div className="ml-1 border-l border-border pl-1">
                <ThemeToggle />
              </div>
            </nav>

            {/* Mobile Nav */}
            <MobileNav items={navItems} />
          </div>
        </header>

        {/* Main */}
        <main className="flex-1">{children}</main>

        {/* Cross Banner */}
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 16px 24px" }}>
          <a
            href="https://vibescan.woomoolga.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              padding: "16px 20px",
              background: "var(--color-surface, #f5f5f5)",
              border: "1px solid var(--color-border, #e5e5e5)",
              borderRadius: 12,
              textDecoration: "none",
              color: "inherit",
              textAlign: "center",
            }}
          >
            <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
              홈페이지 보안, 괜찮으신가요?
            </span>
            <span style={{ display: "block", fontSize: "0.75rem", color: "#888", marginTop: 4 }}>
              VibeScan — 무료 보안 검사로 내 사이트 점검하기
            </span>
          </a>
        </div>

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
                    <Link href="/privacy" className="text-xs text-muted hover:text-brand-orange transition-colors">개인정보처리방침</Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 border-t border-border pt-6 flex flex-col gap-2">
              <p className="text-xs text-muted">
                &copy; {new Date().getFullYear()} 뚝딱. All rights reserved.
              </p>
              <p className="text-xs text-muted">
                <a href="https://portal.woomoolga.com" target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-brand-orange transition-colors">woomoolga</a>
                <span className="mx-2">·</span>
                <a href="https://vibescan.woomoolga.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-orange transition-colors">VibeScan</a>
                <span className="mx-2">·</span>
                <a href="https://ttukddak.woomoolga.com" className="hover:text-brand-orange transition-colors">뚝딱</a>
                <span className="mx-2">·</span>
                <a href="https://bogopa.woomoolga.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-orange transition-colors">보고파</a>
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
