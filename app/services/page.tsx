"use client";

import { useState } from "react";
import Link from "next/link";

// 고민 → 솔루션 매핑
const problems = [
  {
    id: "no-website",
    question: "홈페이지가 없어서 고객을 못 모으고 있어요",
    solutions: [
      { title: "자사몰/단독몰 제작", desc: "매출로 연결되는 온라인 쇼핑몰을 만들어드립니다" },
      { title: "커뮤니티 홈페이지", desc: "고객이 모이는 커뮤니티 사이트를 구축합니다" },
      { title: "네이버 스마트플레이스 최적화", desc: "검색에서 바로 노출되는 온라인 거점을 만듭니다" },
    ],
  },
  {
    id: "no-marketing",
    question: "우리 가게를 어떻게 홍보해야 할지 모르겠어요",
    solutions: [
      { title: "SNS 콘텐츠 제작", desc: "인스타그램, 유튜브 등 맞춤 콘텐츠를 만들어드립니다" },
      { title: "광고/전단/홍보물 디자인", desc: "눈에 띄는 오프라인 홍보물을 제작합니다" },
      { title: "영상 제작/편집", desc: "매출을 올리는 홍보 영상을 만듭니다" },
    ],
  },
  {
    id: "no-brand",
    question: "로고나 브랜드 이미지가 없어요",
    solutions: [
      { title: "브랜딩/CI/BI", desc: "사업의 첫인상을 만드는 브랜드 아이덴티티를 설계합니다" },
      { title: "제품/패키지 디자인", desc: "상품의 가치를 높이는 패키지를 디자인합니다" },
      { title: "문서/명함 디자인", desc: "전문적인 비즈니스 문서를 만들어드립니다" },
    ],
  },
  {
    id: "infra-problem",
    question: "컴퓨터/네트워크가 자꾸 문제가 생겨요",
    solutions: [
      { title: "컴퓨터 수리/조립", desc: "고장 진단부터 맞춤 조립까지 해결합니다", offline: true },
      { title: "네트워크 공사/수리", desc: "안정적인 네트워크 환경을 구축합니다", offline: true },
      { title: "자동 백업 설정", desc: "데이터 손실 걱정 없는 백업 시스템을 세팅합니다" },
    ],
  },
  {
    id: "time-waste",
    question: "반복 업무가 많아서 시간이 부족해요",
    solutions: [
      { title: "업무자동화", desc: "반복되는 수작업을 자동으로 처리하게 만듭니다" },
      { title: "생산성/백업 솔루션", desc: "효율적인 업무 환경을 설계합니다" },
    ],
  },
  {
    id: "other",
    question: "기타 다른 어려움이 있어요",
    solutions: [],
  },
];

// 전체 서비스 목록 (더보기용)
const allServices = [
  {
    name: "디자인",
    items: [
      "브랜딩/CI/BI", "제품/패키지 디자인", "광고/전단/홍보물",
      "컨텐츠 디자인", "사진촬영/리터칭/합성", "도서 표지&내지 디자인",
      "문서 디자인", "UI/UX",
    ],
  },
  {
    name: "개발",
    items: [
      "자사몰/단독몰 제작 및 운영", "커뮤니티 홈페이지 개발",
      "Front-end", "Back-end",
    ],
  },
  {
    name: "영상",
    items: ["영상제작/편집"],
  },
  {
    name: "IT 인프라",
    items: [
      { label: "네트워크 공사/수리", offline: true },
      { label: "컴퓨터 수리/조립", offline: true },
      "자동 백업 설정", "업무자동화",
    ],
  },
  {
    name: "생산성",
    items: ["생산성/백업 솔루션"],
  },
];

type ServiceItem = string | { label: string; offline: boolean };
function getLabel(item: ServiceItem): string {
  return typeof item === "string" ? item : item.label;
}
function isOffline(item: ServiceItem): boolean {
  return typeof item !== "string" && item.offline === true;
}

export default function ServicesPage() {
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null);
  const [showAllServices, setShowAllServices] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState("");

  // 견적 폼
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [detail, setDetail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const selected = problems.find((p) => p.id === selectedProblem);

  const handleRequestQuote = (solutionTitle?: string) => {
    if (solutionTitle) setSelectedSolution(solutionTitle);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-3xl flex-col items-center justify-center px-5">
        <div className="w-full max-w-md space-y-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            견적 요청이 완료되었습니다
          </h1>
          <p className="text-muted">
            확인 후 빠르게 연락드리겠습니다.
          </p>
          <Link
            href="/"
            className="inline-block rounded-2xl bg-brand-blue px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
      {/* Hero */}
      <div className="mb-16 space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          어떤 어려움이 있으세요?
        </h1>
        <p className="mx-auto max-w-lg text-lg text-muted">
          문제를 알려주시면, 딱 맞는 솔루션을
          <span className="text-brand-orange"> 뚝딱</span> 제안해드립니다
        </p>
      </div>

      {/* 고민 선택 */}
      <div className="mx-auto max-w-2xl space-y-3">
        {problems.map((problem) => (
          <button
            key={problem.id}
            type="button"
            onClick={() => {
              setSelectedProblem(
                selectedProblem === problem.id ? null : problem.id
              );
              setShowForm(false);
              if (problem.id === "other") {
                setSelectedSolution("");
                setShowForm(true);
              }
            }}
            className={`w-full rounded-2xl border p-5 text-left text-base font-medium transition-all active:scale-[0.99] ${
              selectedProblem === problem.id
                ? "border-brand-orange bg-brand-orange/5 dark:bg-brand-orange/10"
                : "border-border bg-card hover:border-brand-orange/30"
            }`}
          >
            {problem.question}
          </button>
        ))}
      </div>

      {/* 솔루션 추천 */}
      {selected && selected.solutions.length > 0 && !showForm && (
        <div className="mx-auto mt-10 max-w-2xl">
          <p className="mb-4 text-center text-sm font-medium text-brand-orange">
            이렇게 도와드릴 수 있어요
          </p>
          <div className="space-y-3">
            {selected.solutions.map((sol) => (
              <div
                key={sol.title}
                className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 transition-colors hover:border-brand-orange/30"
              >
                <div>
                  <p className="text-base font-semibold">{sol.title}</p>
                  <p className="mt-1 text-sm text-muted">{sol.desc}</p>
                  {"offline" in sol && sol.offline && (
                    <p className="mt-1 text-xs font-medium text-brand-orange">
                      대전/충남 지역만 가능
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRequestQuote(sol.title)}
                  className="shrink-0 rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                >
                  견적 요청
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 견적 요청 폼 */}
      {showForm && (
        <div className="mx-auto mt-10 max-w-lg">
          <div className="rounded-3xl border border-border bg-card p-8">
            <div className="mb-8 space-y-2 text-center">
              <h2 className="text-xl font-bold">견적 요청하기</h2>
              {selectedSolution && (
                <p className="text-sm text-brand-orange">{selectedSolution}</p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold">이름</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="홍길동"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm transition-all placeholder:text-muted/50 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold">연락처</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="010-1234-5678"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm transition-all placeholder:text-muted/50 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold">이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm transition-all placeholder:text-muted/50 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold">상세 내용</label>
                <textarea
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  rows={4}
                  placeholder="어떤 도움이 필요한지 자유롭게 설명해주세요."
                  className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm transition-all placeholder:text-muted/50 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-2xl bg-brand-orange px-5 py-4 text-base font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
              >
                견적 요청하기
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 전체 서비스 더보기 */}
      <div className="mx-auto mt-20 max-w-2xl text-center">
        <button
          type="button"
          onClick={() => setShowAllServices(!showAllServices)}
          className="text-sm font-medium text-muted transition-colors hover:text-brand-orange"
        >
          {showAllServices
            ? "접기"
            : "뚝딱이 할 수 있는 모든 서비스 보기"}
        </button>

        {showAllServices && (
          <div className="mt-8 space-y-8 text-left">
            {allServices.map((cat) => (
              <div key={cat.name}>
                <h3 className="mb-3 text-lg font-bold">{cat.name}</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {cat.items.map((item) => {
                    const label = getLabel(item);
                    const offline = isOffline(item);
                    return (
                      <div
                        key={label}
                        className="rounded-xl border border-border bg-card px-4 py-3"
                      >
                        <p className="text-sm font-medium">{label}</p>
                        {offline && (
                          <p className="text-xs text-brand-orange">
                            대전/충남 지역만 가능
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
