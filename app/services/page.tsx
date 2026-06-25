"use client";

import { useState } from "react";

const categories = [
  {
    name: "디자인",
    items: [
      "브랜딩/CI/BI",
      "제품/패키지 디자인",
      "광고/전단/홍보물",
      "컨텐츠 디자인",
      "사진촬영/리터칭/합성",
      "도서 표지&내지 디자인",
      "문서 디자인",
      "UI/UX",
    ],
  },
  {
    name: "개발",
    items: [
      "자사몰/단독몰 제작 및 운영",
      "커뮤니티 홈페이지 개발",
      "Front-end",
      "Back-end",
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
      "자동 백업 설정",
      "업무자동화",
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [checkedServices, setCheckedServices] = useState<Set<string>>(
    new Set()
  );
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [detail, setDetail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const toggleService = (label: string) => {
    setCheckedServices((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
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
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setCheckedServices(new Set());
              setName("");
              setPhone("");
              setEmail("");
              setDetail("");
            }}
            className="rounded-2xl bg-brand-blue px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
      {/* Hero */}
      <div className="mb-16 space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          IT 서비스
        </h1>
        <p className="mx-auto max-w-lg text-lg text-muted">
          디자인부터 인프라까지, 사업에 필요한 모든 IT를
          <br className="hidden sm:block" />
          <span className="text-brand-orange"> 한곳에서</span> 해결하세요.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="mb-10">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() =>
                setSelectedCategory(
                  selectedCategory === cat.name ? null : cat.name
                )
              }
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all active:scale-[0.97] ${
                selectedCategory === cat.name
                  ? "bg-brand-blue text-white"
                  : "border border-border bg-card text-foreground hover:border-brand-orange/30"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Service List */}
      <div className="mb-20 space-y-8">
        {categories
          .filter((cat) => !selectedCategory || cat.name === selectedCategory)
          .map((cat) => (
            <div key={cat.name}>
              <h2 className="mb-4 text-xl font-bold">{cat.name}</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {cat.items.map((item) => {
                  const label = getLabel(item);
                  const offline = isOffline(item);
                  return (
                    <div
                      key={label}
                      className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-brand-orange/30"
                    >
                      <p className="text-base font-semibold">{label}</p>
                      {offline && (
                        <p className="mt-1.5 text-xs font-medium text-brand-orange">
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

      {/* Quote Form */}
      <div className="rounded-3xl border border-border bg-card p-8 sm:p-12">
        <div className="mb-10 space-y-3 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            견적 요청하기
          </h2>
          <p className="text-muted">
            관심 있는 서비스를 선택하고 정보를 입력해주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-8">
          {/* Service Checkboxes */}
          <div className="space-y-4">
            <p className="text-sm font-semibold">관심 서비스 선택</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {categories.flatMap((cat) =>
                cat.items.map((item) => {
                  const label = getLabel(item);
                  return (
                    <label
                      key={label}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all ${
                        checkedServices.has(label)
                          ? "border-brand-orange bg-brand-orange-light font-medium"
                          : "border-border bg-card hover:border-brand-orange/30"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checkedServices.has(label)}
                        onChange={() => toggleService(label)}
                        className="sr-only"
                      />
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                          checkedServices.has(label)
                            ? "border-brand-orange bg-brand-orange text-white"
                            : "border-border bg-background"
                        }`}
                      >
                        {checkedServices.has(label) && (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="2,6 5,9 10,3" />
                          </svg>
                        )}
                      </span>
                      {label}
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Contact Fields */}
          <div className="space-y-4">
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
              <label className="mb-1.5 block text-sm font-semibold">
                연락처
              </label>
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
              <label className="mb-1.5 block text-sm font-semibold">
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm transition-all placeholder:text-muted/50 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                상세 내용
              </label>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                rows={5}
                placeholder="프로젝트에 대해 자유롭게 설명해주세요."
                className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm transition-all placeholder:text-muted/50 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-brand-blue px-5 py-4 text-base font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
          >
            견적 요청하기
          </button>
        </form>
      </div>
    </div>
  );
}
