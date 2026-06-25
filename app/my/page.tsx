"use client";

import { useState } from "react";

const dummySaved = [
  {
    id: 1,
    title: "소상공인 정책자금",
    category: "정부지원금",
    deadline: "2026-07-31",
    amount: "최대 1억원",
  },
  {
    id: 2,
    title: "청년 창업 세액감면",
    category: "세금 혜택",
    deadline: "상시",
    amount: "5년간 50~100% 감면",
  },
  {
    id: 3,
    title: "고용촉진장려금",
    category: "고용 지원",
    deadline: "2026-12-31",
    amount: "월 60만원, 1년",
  },
];

export default function MyPage() {
  const [notifyNewBenefit, setNotifyNewBenefit] = useState(true);
  const [notifyDeadline, setNotifyDeadline] = useState(true);

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
      {/* Header */}
      <div className="mb-12 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          마이페이지
        </h1>
        <p className="text-muted">저장한 혜택과 설정을 관리하세요.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Saved Benefits (2/3) */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold">저장한 혜택</h2>
          <div className="space-y-3">
            {dummySaved.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-brand-orange/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="rounded-full bg-brand-orange-light px-2.5 py-0.5 text-xs font-medium text-brand-orange">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold">{item.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted">
                      <span>지원금액: {item.amount}</span>
                      <span>마감: {item.deadline}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar (1/3) */}
        <div className="space-y-6">
          {/* Notification Settings */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-bold">알림 설정</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">신규 혜택 알림</p>
                  <p className="text-xs text-muted">
                    새로운 지원사업이 등록되면 알려드립니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifyNewBenefit(!notifyNewBenefit)}
                  className={`relative h-7 w-12 rounded-full transition-colors ${
                    notifyNewBenefit ? "bg-brand-orange" : "bg-border"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
                      notifyNewBenefit
                        ? "left-0.5 translate-x-5"
                        : "left-0.5 translate-x-0"
                    }`}
                  />
                </button>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">마감일 알림</p>
                  <p className="text-xs text-muted">
                    저장한 혜택의 마감일이 다가오면 알려드립니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifyDeadline(!notifyDeadline)}
                  className={`relative h-7 w-12 rounded-full transition-colors ${
                    notifyDeadline ? "bg-brand-orange" : "bg-border"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
                      notifyDeadline
                        ? "left-0.5 translate-x-5"
                        : "left-0.5 translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Business Info */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-bold">내 사업자 정보</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted">상호명</p>
                <p className="text-sm font-medium">뚝딱 주식회사</p>
              </div>
              <div className="h-px bg-border" />
              <div>
                <p className="text-xs text-muted">사업자번호</p>
                <p className="text-sm font-medium tracking-wider">
                  123-45-67890
                </p>
              </div>
              <div className="h-px bg-border" />
              <div>
                <p className="text-xs text-muted">업종</p>
                <p className="text-sm font-medium">음식점업</p>
              </div>
              <div className="h-px bg-border" />
              <div>
                <p className="text-xs text-muted">소재지</p>
                <p className="text-sm font-medium">대전광역시 유성구</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
