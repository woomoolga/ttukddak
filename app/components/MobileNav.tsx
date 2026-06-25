"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

interface MobileNavProps {
  items: { href: string; label: string }[];
}

export default function MobileNav({ items }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={toggle}
        style={{ WebkitTapHighlightColor: "transparent" }}
        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-muted"
        aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        )}
      </button>

      {open && (
        <div
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
          onClick={close}
        >
          <div
            style={{
              position: "absolute",
              top: "56px",
              left: 0,
              right: 0,
              background: "var(--background)",
              borderBottom: "1px solid var(--border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <nav style={{ padding: "8px 20px" }}>
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  style={{
                    display: "block",
                    padding: "14px 12px",
                    fontSize: "15px",
                    fontWeight: 500,
                    color: "var(--muted)",
                    textDecoration: "none",
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
