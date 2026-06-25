"use client";

import { useState } from "react";

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

const dummyResults: Record<
  string,
  { title: string; tips: string[] }[]
> = {
  default: [
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
  ],
};

export default function MarketingPage() {
  const [mode, setMode] = useState<"biz" | "manual">("manual");
  const [bizNumber, setBizNumber] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = () => {
    if (mode === "biz" && !bizNumber.trim()) return;
    if (mode === "manual" && !selectedIndustry) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowResult(true);
    }, 1200);
  };

  const results = dummyResults.default;

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
      {/* Hero */}
      <div className="mb-16 space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          마케팅 가이드
        </h1>
        <p className="mx-auto max-w-lg text-lg text-muted">
          업종에 맞는 마케팅 전략을
          <span className="text-brand-orange"> AI가 분석</span>합니다
        </p>
      </div>

      {/* Input Section */}
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

      {/* Results */}
      {showResult && (
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-sm font-medium text-brand-orange">
              {mode === "biz"
                ? `사업자번호 ${bizNumber} 분석 결과`
                : `${selectedIndustry} 업종 분석 결과`}
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              맞춤 마케팅 전략
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {results.map((section) => (
              <div
                key={section.title}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <h3 className="mb-4 text-lg font-bold">{section.title}</h3>
                <ul className="space-y-3">
                  {section.tips.map((tip, i) => (
                    <li key={i} className="flex gap-3 text-sm text-muted">
                      <span className="mt-0.5 shrink-0 text-xs font-bold text-brand-orange">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
