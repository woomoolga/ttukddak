"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function formatBizNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

function getRawDigits(formatted: string): string {
  return formatted.replace(/\D/g, "");
}

const features = [
  {
    title: "정확한 혜택 정보",
    description:
      "사업자등록번호 기반으로 업종, 지역, 사업 규모에 딱 맞는 정부지원금과 세금 혜택을 찾아드립니다.",
  },
  {
    title: "AI 맞춤 마케팅",
    description:
      "사업 특성을 분석해서 매출을 올릴 수 있는 마케팅 전략과 실행 가이드를 제안합니다.",
  },
  {
    title: "IT 원스톱 서비스",
    description:
      "홈페이지, 키오스크, 포스기 등 사업에 필요한 IT 솔루션을 한 곳에서 비교하고 도입할 수 있습니다.",
  },
];

export default function Home() {
  const [rawDigits, setRawDigits] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const isValid = rawDigits.length === 10;
  const displayValue = formatBizNumber(rawDigits);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setIsLoading(true);
    router.push(`/result?biz=${rawDigits}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setRawDigits(digits);
  };

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="flex min-h-[calc(100vh-7rem)] flex-col items-center justify-center px-5 bg-web-pattern">
        <div className="w-full max-w-lg space-y-10 text-center">
          <div className="space-y-4">
            <h1 className="text-[2rem] font-extrabold leading-snug tracking-tight sm:text-[2.75rem] sm:leading-tight">
              사업자번호를 입력하면
              <br />
              받을 수 있는 모든 혜택을
              <br />
              <span className="text-brand-orange">찾아드립니다</span>
            </h1>
            <p className="text-base text-muted sm:text-lg">
              정부지원금, 세금 혜택, 마케팅 가이드까지 한번에
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              inputMode="numeric"
              value={displayValue}
              onChange={handleChange}
              onInput={(e) => {
                const target = e.target as HTMLInputElement;
                const digits = target.value.replace(/\D/g, "").slice(0, 10);
                setRawDigits(digits);
              }}
              placeholder="000-00-00000"
              maxLength={14}
              className="w-full rounded-2xl border border-border bg-card px-6 py-4 text-center text-xl font-semibold tracking-widest transition-all placeholder:text-muted/40 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
              autoFocus
            />
            <button
              type="submit"
              disabled={!isValid || isLoading}
              className="w-full rounded-2xl bg-brand-orange px-6 py-4 text-base font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? "조회 중..." : "혜택 조회하기"}
            </button>
            <p className="text-xs text-muted pt-1">
              조회는 무료이며, 입력된 정보는 저장되지 않습니다.
            </p>
          </form>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-surface px-5 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-xl font-bold tracking-tight sm:text-2xl">
            왜 뚝딱인가요?
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-border bg-card p-7 transition-colors hover:border-brand-orange/30"
              >
                <h3 className="text-base font-bold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-20">
        <div className="mx-auto max-w-lg text-center space-y-5">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            지금 바로 시작하세요
          </h2>
          <p className="text-sm text-muted">
            사업자번호 10자리만 입력하면, 30초 안에 맞춤 혜택을 확인할 수 있습니다.
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="rounded-2xl bg-brand-blue px-8 py-3.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
          >
            혜택 조회하러 가기
          </button>
        </div>
      </section>
    </div>
  );
}
