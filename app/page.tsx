"use client";

import { useState } from "react";

export default function Home() {
  const [bizNumber, setBizNumber] = useState("");

  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-3xl flex-col items-center justify-center px-5">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Hero */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            사업자번호 하나로
            <br />
            <span className="text-brand-orange">맞춤 혜택</span>을 찾아보세요
          </h1>
          <p className="text-base text-muted">
            정부지원금, 세금 혜택, 마케팅 가이드까지 한눈에
          </p>
        </div>

        {/* Input */}
        <div className="space-y-4">
          <input
            type="text"
            value={bizNumber}
            onChange={(e) => setBizNumber(e.target.value)}
            placeholder="사업자번호 10자리 입력 (예: 123-45-67890)"
            maxLength={12}
            className="w-full rounded-2xl border border-border bg-card px-5 py-4 text-center text-lg font-medium tracking-wider transition-all placeholder:text-muted/50 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
          />
          <button
            type="button"
            className="w-full rounded-2xl bg-brand-blue px-5 py-4 text-base font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
          >
            혜택 조회하기
          </button>
        </div>

        {/* Sub info */}
        <p className="text-xs text-muted">
          조회는 무료이며, 입력된 정보는 저장되지 않습니다.
        </p>
      </div>
    </div>
  );
}
