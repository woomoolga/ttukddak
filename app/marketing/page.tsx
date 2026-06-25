"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface BusinessInfo {
  businessNumber: string;
  businessName: string;
  representative: string;
  industry: string;
  businessType: string;
  address: string;
  status: string;
  taxType: string;
  establishedDate: string;
  employeeCount: string;
}

interface PlatformResult {
  name: string;
  status: "found" | "not_found" | "unknown";
  count?: number;
  url: string | null;
  guideUrl: string;
  guideLabel: string;
}

const industryOptions = [
  "음식점/카페",
  "소매/유통",
  "서비스업",
  "제조업",
  "교육/학원",
  "의료/건강",
  "숙박/관광",
  "IT/스타트업",
  "건설/인테리어",
  "기타",
];

const dummyResults: { title: string; tips: string[] }[] = [
  {
    title: "SNS 마케팅 전략",
    tips: [
      "인스타그램 비즈니스 계정으로 전환하고 인사이트를 활용하세요.",
      "주 3~4회 이상 꾸준한 게시물 발행이 중요합니다.",
      "릴스(짧은 영상) 콘텐츠의 도달률이 일반 게시물 대비 2~3배 높습니다.",
      "고객 후기와 사용 사례를 콘텐츠로 재가공하세요.",
    ],
  },
  {
    title: "오프라인 마케팅",
    tips: [
      "매장 반경 1km 내 아파트 단지 대상 전단 배포가 효과적입니다.",
      "첫 방문 고객 대상 할인 쿠폰으로 재방문율을 높이세요.",
      "지역 커뮤니티(맘카페, 지역 밴드)에 적극 참여하세요.",
      "계절별 이벤트와 연계한 프로모션을 기획하세요.",
    ],
  },
  {
    title: "온라인 광고",
    tips: [
      "네이버 스마트플레이스 등록은 필수입니다.",
      "구글 비즈니스 프로필을 최적화하세요.",
      "월 예산 30만원 이하라면 네이버 검색광고에 집중하세요.",
      "리타겟팅 광고로 방문 고객을 다시 유입시키세요.",
    ],
  },
  {
    title: "추천 플랫폼",
    tips: [
      "네이버 블로그 - 검색 유입에 가장 효과적인 채널입니다.",
      "카카오톡 채널 - 기존 고객과의 소통에 최적화되어 있습니다.",
      "당근마켓 비즈프로필 - 지역 기반 고객 확보에 유리합니다.",
      "배달의민족/쿠팡이츠 - 음식점이라면 필수 플랫폼입니다.",
    ],
  },
];

function generateTips(platforms: PlatformResult[]): string[] {
  const tips: string[] = [];
  for (const p of platforms) {
    if (p.status === "found" && p.count !== undefined && p.count < 10) {
      if (p.name === "네이버 쇼핑") {
        tips.push(
          `네이버 쇼핑에 상품 ${p.count}개는 노출에 불리합니다. 최소 10개 이상 등록하세요.`
        );
      } else if (p.name === "옥션" || p.name === "지마켓") {
        tips.push(
          `${p.name}에 상품 ${p.count}개는 노출에 불리합니다. 최소 10개 이상 등록하세요.`
        );
      }
    }
    if (p.status === "not_found") {
      if (p.name === "네이버 쇼핑") {
        tips.push(
          "네이버 스마트스토어 입점 시 검색 유입이 크게 늘어납니다."
        );
      } else if (p.name === "네이버 플레이스") {
        tips.push(
          "네이버 플레이스 등록은 무료이며, 지도 검색 노출에 필수입니다."
        );
      } else if (p.name === "옥션" || p.name === "지마켓") {
        tips.push(
          `${p.name} 입점으로 추가 판매 채널을 확보하세요.`
        );
      }
    }
  }
  // 항상 추가하는 일반 팁
  tips.push(
    "인스타그램 비즈니스 계정으로 전환하면 인사이트를 활용할 수 있습니다."
  );
  if (tips.length < 4) {
    tips.push(
      "네이버 블로그를 운영하면 검색 유입이 크게 늘어납니다."
    );
  }
  return tips;
}

function PlatformSection({ platforms }: { platforms: PlatformResult[] }) {
  const found = platforms.filter((p) => p.status === "found");
  const notFound = platforms.filter((p) => p.status === "not_found");
  const unknown = platforms.filter((p) => p.status === "unknown");
  const tips = generateTips(platforms);

  return (
    <div className="space-y-6">
      {/* 사용 중인 플랫폼 */}
      {found.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 text-base font-bold">사용 중인 플랫폼</h3>
          <div className="space-y-3">
            {found.map((p) => (
              <div
                key={p.name}
                className="flex flex-col gap-2 rounded-xl bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex shrink-0 items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-600 dark:text-green-400">
                    감지됨
                  </span>
                  <span className="text-sm font-medium">{p.name}</span>
                  {p.count !== undefined && p.count > 0 && (
                    <span className="text-xs text-muted">
                      상품 {p.count}개
                    </span>
                  )}
                </div>
                <div className="flex gap-2 pl-[4.5rem] sm:pl-0">
                  {p.url && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-background"
                    >
                      검색 결과 보기
                    </a>
                  )}
                  <a
                    href={p.guideUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-brand-blue/10 px-3 py-1.5 text-xs font-medium text-brand-blue transition-colors hover:bg-brand-blue/20"
                  >
                    {p.guideLabel}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 미사용 플랫폼 */}
      {notFound.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 text-base font-bold">미사용 플랫폼</h3>
          <div className="space-y-3">
            {notFound.map((p) => (
              <div
                key={p.name}
                className="flex flex-col gap-2 rounded-xl bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex shrink-0 items-center rounded-full bg-gray-500/10 px-2.5 py-0.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    미등록
                  </span>
                  <span className="text-sm font-medium">{p.name}</span>
                </div>
                <div className="pl-[4.5rem] sm:pl-0">
                  <a
                    href={p.guideUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-brand-orange/10 px-3 py-1.5 text-xs font-medium text-brand-orange transition-colors hover:bg-brand-orange/20"
                  >
                    {p.guideLabel}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 직접 확인 */}
      {unknown.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 text-base font-bold">직접 확인</h3>
          <div className="space-y-3">
            {unknown.map((p) => (
              <div
                key={p.name}
                className="flex flex-col gap-2 rounded-xl bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex shrink-0 items-center rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                    확인 필요
                  </span>
                  <span className="text-sm font-medium">{p.name}</span>
                </div>
                <div className="flex gap-2 pl-[4.5rem] sm:pl-0">
                  {p.url && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-background"
                    >
                      확인하기
                    </a>
                  )}
                  <a
                    href={p.guideUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-brand-blue/10 px-3 py-1.5 text-xs font-medium text-brand-blue transition-colors hover:bg-brand-blue/20"
                  >
                    {p.guideLabel}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 챙겨야 할 것들 */}
      {tips.length > 0 && (
        <div className="rounded-2xl border border-brand-orange/30 bg-card p-6">
          <h3 className="mb-4 text-base font-bold">챙겨야 할 것들</h3>
          <ul className="space-y-3">
            {tips.map((tip, i) => (
              <li key={i} className="flex gap-3 text-sm text-muted">
                <span className="mt-0.5 shrink-0 text-xs font-bold text-brand-orange">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 혼자 하기 어려우시면? */}
      <div className="rounded-2xl border border-border bg-surface p-6 text-center sm:p-8">
        <p className="text-base font-bold">혼자 하기 어려우시면?</p>
        <p className="mt-1 text-sm text-muted">
          뚝딱이 도와드립니다
        </p>
        <Link
          href="/services"
          className="mt-5 inline-block rounded-xl bg-brand-orange px-8 py-3.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
        >
          IT 서비스 견적 받기
        </Link>
      </div>
    </div>
  );
}

function MarketingContent() {
  const searchParams = useSearchParams();
  const biz = searchParams.get("biz") || "";

  const [bizInfo, setBizInfo] = useState<BusinessInfo | null>(null);
  const [bizLoading, setBizLoading] = useState(false);

  const [mode, setMode] = useState<"biz" | "manual">(biz ? "biz" : "manual");
  const [bizNumber, setBizNumber] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);

  // 플랫폼 체크
  const [platforms, setPlatforms] = useState<PlatformResult[]>([]);
  const [platformLoading, setPlatformLoading] = useState(false);

  // 혜택 조회에서 넘어온 경우 자동으로 사업자 정보 가져오기
  useEffect(() => {
    if (!biz || biz.length !== 10) return;

    setBizLoading(true);
    fetch("/api/business", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessNumber: biz }),
    })
      .then((res) => res.json())
      .then((data: BusinessInfo) => {
        setBizInfo(data);
        setBizNumber(
          `${biz.slice(0, 3)}-${biz.slice(3, 5)}-${biz.slice(5)}`
        );
        // 자동으로 분석 시작
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          setShowResult(true);
        }, 1200);

        // 플랫폼 체크 시작
        if (data.businessName) {
          setPlatformLoading(true);
          fetch("/api/platform-check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ businessName: data.businessName }),
          })
            .then((res) => res.json())
            .then((result) => {
              if (result.platforms) {
                setPlatforms(result.platforms);
              }
            })
            .catch(() => {})
            .finally(() => setPlatformLoading(false));
        }
      })
      .catch(() => {})
      .finally(() => setBizLoading(false));
  }, [biz]);

  const handleAnalyze = () => {
    if (mode === "biz" && !bizNumber.trim()) return;
    if (mode === "manual" && !selectedIndustry) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowResult(true);
    }, 1200);
  };

  const displayName = bizInfo?.businessName || "";
  const displayIndustry = bizInfo?.industry || selectedIndustry;
  const displayRegion = bizInfo?.address?.split(" ").slice(0, 2).join(" ") || "";

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
      {/* Hero */}
      <div className="mb-16 space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          마케팅 가이드
        </h1>
        {bizInfo ? (
          <p className="mx-auto max-w-lg text-lg text-muted">
            <span className="font-semibold text-foreground">{displayName}</span>에 맞는 마케팅 전략을
            <span className="text-brand-orange"> AI가 분석</span>합니다
          </p>
        ) : (
          <p className="mx-auto max-w-lg text-lg text-muted">
            업종에 맞는 마케팅 전략을
            <span className="text-brand-orange"> AI가 분석</span>합니다
          </p>
        )}
      </div>

      {/* 사업자 정보 카드 (혜택 조회에서 넘어온 경우) */}
      {bizInfo && (
        <div className="mx-auto mb-8 max-w-lg rounded-2xl border border-brand-orange/30 bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold">{displayName}</p>
              <p className="mt-1 text-xs text-muted">{displayIndustry}</p>
              {displayRegion && (
                <p className="text-xs text-muted">{displayRegion}</p>
              )}
            </div>
            <Link
              href={`/result?biz=${biz}`}
              className="text-xs text-brand-orange hover:underline"
            >
              혜택 조회로 돌아가기
            </Link>
          </div>
        </div>
      )}

      {/* Input Section (사업자 정보 없을 때만 표시) */}
      {!bizInfo && !bizLoading && (
        <div className="mx-auto mb-16 max-w-lg">
          <div className="rounded-3xl border border-border bg-card p-8">
            {/* Mode Toggle */}
            <div className="mb-8 flex rounded-xl bg-surface p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("biz");
                  setShowResult(false);
                }}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
                  mode === "biz"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted"
                }`}
              >
                사업자번호 입력
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("manual");
                  setShowResult(false);
                }}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
                  mode === "manual"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted"
                }`}
              >
                업종 직접 선택
              </button>
            </div>

            {mode === "biz" ? (
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold">
                    사업자번호
                  </label>
                  <input
                    type="text"
                    value={bizNumber}
                    onChange={(e) => setBizNumber(e.target.value)}
                    placeholder="123-45-67890"
                    maxLength={12}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm tracking-wider transition-all placeholder:text-muted/50 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                  />
                </div>
                <p className="text-xs text-muted">
                  사업자번호로 업종을 자동 판별하여 맞춤 전략을 제공합니다.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold">
                    업종 선택
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {industryOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setSelectedIndustry(
                            selectedIndustry === opt ? "" : opt
                          );
                          setShowResult(false);
                        }}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-all active:scale-[0.97] ${
                          selectedIndustry === opt
                            ? "bg-brand-blue text-white"
                            : "border border-border bg-background hover:border-brand-orange/30"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading}
              className="mt-6 w-full rounded-2xl bg-brand-blue px-5 py-4 text-base font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "분석 중..." : "마케팅 전략 받기"}
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {(loading || bizLoading) && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
          <p className="text-sm text-muted">
            {displayName
              ? `${displayName}에 맞는 마케팅 전략을 분석하고 있습니다...`
              : "마케팅 전략을 분석하고 있습니다..."}
          </p>
        </div>
      )}

      {/* Results */}
      {showResult && !loading && (
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-sm font-medium text-brand-orange">
              {displayName
                ? `${displayName} 맞춤 분석 결과`
                : mode === "biz"
                  ? `사업자번호 ${bizNumber} 분석 결과`
                  : `${selectedIndustry} 업종 분석 결과`}
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              온라인 현황 진단
            </h2>
            <p className="mt-1 text-sm text-muted">
              놓치고 있는 부분을 찾아드립니다
            </p>
          </div>

          {/* 온라인 활동 현황 (biz 파라미터가 있을 때만) */}
          {bizInfo && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-bold tracking-tight">
                  온라인 활동 현황
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {displayName}의 주요 플랫폼 활동을 확인했습니다
                </p>
              </div>

              {platformLoading ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-12 space-y-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-blue border-t-transparent" />
                  <p className="text-sm text-muted">
                    온라인 플랫폼을 검색하고 있습니다...
                  </p>
                </div>
              ) : platforms.length > 0 ? (
                <PlatformSection platforms={platforms} />
              ) : (
                <div className="rounded-2xl border border-border bg-card p-6 text-center">
                  <p className="text-sm text-muted">
                    플랫폼 정보를 불러오지 못했습니다.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* IT 서비스 CTA (biz 없을 때만, biz 있으면 PlatformSection에 포함) */}
          {!bizInfo && (
            <div className="mt-8 rounded-2xl border border-border bg-surface p-6 sm:p-8 text-center">
              <p className="text-base font-bold">
                마케팅 실행이 필요하신가요?
              </p>
              <p className="mt-1 text-sm text-muted">
                홈페이지 제작, 로고 디자인, 광고 제작까지 뚝딱이 도와드립니다
              </p>
              <Link
                href="/services"
                className="mt-5 inline-block rounded-xl bg-brand-orange px-8 py-3.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
              >
                IT 서비스 견적 받기
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MarketingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-muted">불러오는 중...</p>
        </div>
      }
    >
      <MarketingContent />
    </Suspense>
  );
}
