"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// 더미 데이터
const DUMMY_BIZ_INFO = {
  name: "주식회사 테스트컴퍼니",
  type: "법인사업자",
  industry: "소프트웨어 개발업",
  region: "서울특별시 강남구",
  established: "2023-03-15",
};

const DUMMY_BENEFITS = [
  {
    id: 1,
    category: "정부지원금",
    title: "중소기업 디지털 전환 지원사업",
    amount: "최대 3,000만원",
    eligibility: "매출 100억 이하 중소기업",
    deadline: "2026-07-31",
    dDay: 36,
    description:
      "클라우드, AI, 데이터 분석 등 디지털 기술 도입 비용의 50%를 지원합니다.",
  },
  {
    id: 2,
    category: "세금 혜택",
    title: "중소기업 특별세액감면",
    amount: "법인세 최대 30% 감면",
    eligibility: "수도권 소재 중소기업",
    deadline: "2026-12-31",
    dDay: 189,
    description:
      "중소기업기본법에 따른 중소기업이 감면 대상 업종을 영위하는 경우 법인세를 감면받을 수 있습니다.",
  },
  {
    id: 3,
    category: "정부지원금",
    title: "청년 추가고용 장려금",
    amount: "1인당 연 900만원 (3년간)",
    eligibility: "청년 정규직 신규 채용 기업",
    deadline: "2026-08-15",
    dDay: 51,
    description:
      "만 15~34세 청년을 정규직으로 신규 채용한 중소기업에 인건비를 지원합니다.",
  },
  {
    id: 4,
    category: "인증/인허가",
    title: "벤처기업 인증",
    amount: "세금 감면 + 금융 우대",
    eligibility: "기술성 평가 우수 기업",
    deadline: "상시 접수",
    dDay: null,
    description:
      "벤처기업 인증을 받으면 법인세 감면, 취득세 면제, 정책자금 우대 등 다양한 혜택을 받을 수 있습니다.",
  },
  {
    id: 5,
    category: "마케팅 지원",
    title: "수출바우처 사업",
    amount: "최대 1억원 바우처",
    eligibility: "수출 실적 또는 수출 계획 보유 기업",
    deadline: "2026-09-30",
    dDay: 97,
    description:
      "해외 마케팅, 통번역, 디자인, 법률자문 등 수출에 필요한 서비스를 바우처로 이용할 수 있습니다.",
  },
];

function getCategoryColor(category: string): string {
  switch (category) {
    case "정부지원금":
      return "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
    case "세금 혜택":
      return "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300";
    case "인증/인허가":
      return "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300";
    case "마케팅 지원":
      return "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300";
    default:
      return "bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
  }
}

function ResultContent() {
  const searchParams = useSearchParams();
  const biz = searchParams.get("biz") || "";
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const formatted = biz
    ? `${biz.slice(0, 3)}-${biz.slice(3, 5)}-${biz.slice(5)}`
    : "";

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setEmailSent(true);
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:py-16">
      {/* Back */}
      <Link
        href="/"
        className="mb-8 inline-block text-sm font-medium text-muted transition-colors hover:text-brand-orange"
      >
        &larr; 다시 조회하기
      </Link>

      {/* Biz Info Card */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted">사업자번호</p>
            <p className="text-lg font-bold tracking-wider">{formatted}</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <div>
              <p className="text-xs text-muted">업종</p>
              <p className="font-medium">{DUMMY_BIZ_INFO.industry}</p>
            </div>
            <div>
              <p className="text-xs text-muted">지역</p>
              <p className="font-medium">{DUMMY_BIZ_INFO.region}</p>
            </div>
            <div>
              <p className="text-xs text-muted">사업자 유형</p>
              <p className="font-medium">{DUMMY_BIZ_INFO.type}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-8 mb-6 flex items-baseline justify-between">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          받을 수 있는 혜택{" "}
          <span className="text-brand-orange">{DUMMY_BENEFITS.length}건</span>
        </h1>
        <p className="text-xs text-muted">마감일순 정렬</p>
      </div>

      {/* Benefit Cards */}
      <div className="space-y-4">
        {DUMMY_BENEFITS.map((benefit) => {
          const isExpanded = expandedId === benefit.id;
          return (
            <div
              key={benefit.id}
              className="rounded-2xl border border-border bg-card transition-all hover:border-brand-orange/30"
            >
              <button
                type="button"
                onClick={() =>
                  setExpandedId(isExpanded ? null : benefit.id)
                }
                className="w-full p-6 text-left"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-block rounded-lg px-2.5 py-1 text-xs font-semibold ${getCategoryColor(benefit.category)}`}
                      >
                        {benefit.category}
                      </span>
                      {benefit.dDay !== null && benefit.dDay <= 60 && (
                        <span className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 dark:bg-red-950 dark:text-red-400">
                          D-{benefit.dDay}
                        </span>
                      )}
                    </div>
                    <h2 className="text-base font-bold sm:text-lg">
                      {benefit.title}
                    </h2>
                    <p className="text-sm text-muted">{benefit.eligibility}</p>
                  </div>
                  <div className="flex flex-col items-start sm:items-end sm:text-right shrink-0">
                    <p className="text-base font-bold text-brand-orange">
                      {benefit.amount}
                    </p>
                    <p className="text-xs text-muted mt-1">
                      마감 {benefit.deadline}
                    </p>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border px-6 pb-6 pt-4 space-y-4">
                  <p className="text-sm leading-relaxed text-muted">
                    {benefit.description}
                  </p>
                  <button
                    type="button"
                    className="rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
                  >
                    신청 방법 보기
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Email Section */}
      <div className="mt-12 rounded-2xl border border-border bg-surface p-6 sm:p-8">
        {emailSent ? (
          <div className="text-center space-y-2">
            <p className="text-base font-bold">전송 완료</p>
            <p className="text-sm text-muted">
              입력하신 이메일로 혜택 리포트를 발송했습니다.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <p className="text-base font-bold">
                결과를 이메일로 받아보세요
              </p>
              <p className="text-sm text-muted">
                혜택 목록과 신청 방법을 정리한 리포트를 보내드립니다.
              </p>
            </div>
            <form
              onSubmit={handleEmailSubmit}
              className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 주소 입력"
                required
                className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm transition-all placeholder:text-muted/40 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-brand-orange px-6 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
              >
                전송하기
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-muted">불러오는 중...</p>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
