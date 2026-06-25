"use client";

import { useState } from "react";
import Link from "next/link";

interface MobileNavProps {
  items: { href: string; label: string }[];
}

export default function MobileNav({ items }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        onTouchEnd={(e) => { e.preventDefault(); setOpen((prev) => !prev); }}
        className="relative z-[60] flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-brand-orange-light hover:text-brand-orange active:bg-brand-orange-light"
        aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          {open ? (
            <>
              <line x1="4" y1="4" x2="16" y2="16" />
              <line x1="16" y1="4" x2="4" y2="16" />
            </>
          ) : (
            <>
              <line x1="3" y1="6" x2="17" y2="6" />
              <line x1="3" y1="10" x2="17" y2="10" />
              <line x1="3" y1="14" x2="17" y2="14" />
            </>
          )}
        </svg>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-[55] bg-black/20"
            onClick={() => setOpen(false)}
          />
          <div className="fixed left-0 right-0 top-14 z-[60] border-b border-border bg-background/98 backdrop-blur-xl">
            <nav className="mx-auto max-w-5xl px-5 py-3">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-3 text-base font-medium text-muted transition-colors hover:bg-brand-orange-light hover:text-brand-orange active:bg-brand-orange-light"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
