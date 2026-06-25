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
  source: { nts: boolean; bizno: boolean };
}

interface TaxGuideData {
  industryCode: string;
  industryName: string;
  standardRate: number;
  simpleRate: number;
  category: string;
  deductibleItems: string[];
}

interface TaxGuideResponse {
  matched: boolean;
  data?: TaxGuideData;
  similar?: TaxGuideData[];
  message?: string;
}

// 업종/지역별 혜택 데이터 (나중에 기업마당 API 연동)
interface Benefit {
  id: number;
  category: string;
  title: string;
  amount: string;
  eligibility: string;
  deadline: string;
  dDay: number | null;
  description: string;
}

// 공통 혜택 (모든 사업자)
const COMMON_BENEFITS: Benefit[] = [
  {
    id: 100,
    category: "세금 혜택",
    title: "중소기업 특별세액감면",
    amount: "법인세 최대 30% 감면",
    eligibility: "중소기업기본법상 중소기업",
    deadline: "2026-12-31",
    dDay: 189,
    description: "중소기업이 감면 대상 업종을 영위하는 경우 법인세 또는 소득세를 감면받을 수 있습니다.",
  },
  {
    id: 101,
    category: "정부지원금",
    title: "청년 추가고용 장려금",
    amount: "1인당 연 900만원 (3년간)",
    eligibility: "청년 정규직 신규 채용 기업",
    deadline: "2026-08-15",
    dDay: 51,
    description: "만 15~34세 청년을 정규직으로 신규 채용한 중소기업에 인건비를 지원합니다.",
  },
  {
    id: 102,
    category: "정부지원금",
    title: "중소기업 디지털 전환 지원사업",
    amount: "최대 3,000만원",
    eligibility: "매출 100억 이하 중소기업",
    deadline: "2026-07-31",
    dDay: 36,
    description: "클라우드, AI, 데이터 분석 등 디지털 기술 도입 비용의 50%를 지원합니다.",
  },
];

// 업종별 혜택
const INDUSTRY_BENEFITS: Record<string, Benefit[]> = {
  "제조업": [
    { id: 201, category: "정부지원금", title: "스마트공장 구축 지원사업", amount: "최대 1억원 (50% 매칭)", eligibility: "제조업 중소기업", deadline: "2026-09-30", dDay: 97, description: "생산 공정에 IoT, AI, 빅데이터 등 스마트 기술을 도입하는 제조기업에 구축 비용을 지원합니다." },
    { id: 202, category: "인증/인허가", title: "ISO 인증 취득 지원", amount: "인증 비용 70% 지원 (최대 500만원)", eligibility: "제조업 중소기업", deadline: "상시 접수", dDay: null, description: "ISO 9001, 14001 등 국제 품질/환경 인증 취득에 필요한 컨설팅 및 심사 비용을 지원합니다." },
    { id: 203, category: "마케팅 지원", title: "수출바우처 사업", amount: "최대 1억원 바우처", eligibility: "수출 실적 또는 수출 계획 보유 제조기업", deadline: "2026-09-30", dDay: 97, description: "해외 마케팅, 통번역, 디자인, 법률자문 등 수출에 필요한 서비스를 바우처로 이용할 수 있습니다." },
  ],
  "음식점": [
    { id: 211, category: "정부지원금", title: "소상공인 배달·O2O 지원사업", amount: "최대 200만원", eligibility: "배달앱 입점 소상공인", deadline: "2026-08-31", dDay: 67, description: "배달앱 입점비, 포장재, 메뉴 사진 촬영 등 온라인 판로 개척 비용을 지원합니다." },
    { id: 212, category: "위생/안전", title: "음식점 위생등급제 인센티브", amount: "위생등급 취득 시 행정 혜택", eligibility: "일반음식점, 휴게음식점", deadline: "상시 접수", dDay: null, description: "식약처 위생등급(매우우수/우수) 취득 시 위생점검 면제, 융자 우대 등 혜택을 받을 수 있습니다." },
    { id: 213, category: "세금 혜택", title: "음식점업 부가세 간이과세 특례", amount: "부가세 감면", eligibility: "연매출 1억 400만원 미만 음식점", deadline: "2026-12-31", dDay: 189, description: "간이과세 적용 시 부가가치세 부담이 크게 줄어들며, 세금계산서 발행 의무도 면제됩니다." },
  ],
  "소매": [
    { id: 221, category: "정부지원금", title: "전통시장·상점가 활성화 지원", amount: "최대 5,000만원", eligibility: "전통시장 및 상점가 소속 소매업자", deadline: "2026-07-31", dDay: 36, description: "시설 현대화, 공동마케팅, 경영혁신 등 전통시장 활성화를 위한 사업비를 지원합니다." },
    { id: 222, category: "마케팅 지원", title: "소상공인 온라인 판로 지원사업", amount: "입점비·수수료 지원 (최대 300만원)", eligibility: "소매업 소상공인", deadline: "2026-10-31", dDay: 128, description: "네이버 스마트스토어, 쿠팡 등 온라인 마켓플레이스 입점 및 운영에 필요한 비용을 지원합니다." },
  ],
  "IT": [
    { id: 231, category: "인증/인허가", title: "벤처기업 인증", amount: "세금 감면 + 금융 우대", eligibility: "기술성 평가 우수 IT 기업", deadline: "상시 접수", dDay: null, description: "벤처기업 인증을 받으면 법인세 감면, 취득세 면제, 정책자금 우대 등 다양한 혜택을 받을 수 있습니다." },
    { id: 232, category: "정부지원금", title: "초기창업패키지", amount: "최대 1억원 (1년)", eligibility: "창업 3년 이내 IT/기술 기업", deadline: "2026-08-15", dDay: 51, description: "사업화 자금, 멘토링, 사무공간 등 초기 창업에 필요한 종합 패키지를 지원합니다." },
    { id: 233, category: "정부지원금", title: "클라우드 서비스 이용 지원", amount: "최대 400만원 (70% 지원)", eligibility: "IT 중소기업·스타트업", deadline: "2026-09-30", dDay: 97, description: "AWS, GCP, Azure 등 클라우드 서비스 이용료를 지원하여 인프라 비용 부담을 줄여줍니다." },
  ],
  "교육": [
    { id: 241, category: "정부지원금", title: "직업훈련기관 시설·장비 지원", amount: "최대 2억원", eligibility: "직업훈련기관, 학원", deadline: "2026-07-31", dDay: 36, description: "직업훈련 시설 개보수 및 교육 장비 구입 비용을 지원합니다." },
    { id: 242, category: "세금 혜택", title: "교육서비스업 부가세 면제", amount: "부가가치세 면제", eligibility: "학원법상 등록 학원", deadline: "상시 적용", dDay: null, description: "교육용역에 대한 부가가치세가 면제되어 수강료에 부가세를 포함하지 않아도 됩니다." },
  ],
  "건설": [
    { id: 251, category: "정부지원금", title: "건설업 안전관리비 지원", amount: "공사금액의 일정 비율", eligibility: "건설업 등록 기업", deadline: "상시 적용", dDay: null, description: "산업안전보건법에 따라 건설 현장 안전시설 설치, 보호장구 구입 등에 안전관리비를 사용할 수 있습니다." },
    { id: 252, category: "인증/인허가", title: "건설업 시공능력평가 가점", amount: "기술개발 투자 시 가점", eligibility: "건설업 등록 중소기업", deadline: "2026-12-31", dDay: 189, description: "기술개발 투자, 사회공헌 실적 등을 통해 시공능력평가 순위를 높일 수 있습니다." },
  ],
};

// 지역별 혜택
const REGION_BENEFITS: Record<string, Benefit[]> = {
  "경상남도": [
    { id: 301, category: "지자체 지원", title: "경남 소상공인 경영안정자금", amount: "최대 5,000만원 (저금리 대출)", eligibility: "경상남도 소재 소상공인", deadline: "2026-11-30", dDay: 158, description: "경남 소재 소상공인에게 경영안정을 위한 저금리 정책자금을 융자 지원합니다." },
    { id: 302, category: "지자체 지원", title: "경남 청년 창업 지원사업", amount: "최대 3,000만원", eligibility: "만 39세 이하 경남 소재 창업자", deadline: "2026-08-31", dDay: 67, description: "경남 지역 청년 창업자에게 사업화 자금, 멘토링, 교육을 지원합니다." },
  ],
  "서울": [
    { id: 311, category: "지자체 지원", title: "서울시 소상공인 디지털 전환 지원", amount: "최대 500만원", eligibility: "서울 소재 소상공인", deadline: "2026-09-30", dDay: 97, description: "키오스크 도입, 배달앱 연동, POS 시스템 등 디지털 전환 비용을 지원합니다." },
    { id: 312, category: "지자체 지원", title: "서울 신기술 창업사관학교", amount: "사무공간 + 최대 1억원", eligibility: "서울 소재 기술 창업기업", deadline: "2026-07-31", dDay: 36, description: "마포구 소재 창업보육센터 입주 + 사업화 자금 + 전문 멘토링을 제공합니다." },
  ],
  "대전": [
    { id: 321, category: "지자체 지원", title: "대전 강소기업 육성 지원", amount: "최대 2,000만원", eligibility: "대전 소재 중소기업", deadline: "2026-10-31", dDay: 128, description: "기술개발, 마케팅, 인력양성 등 강소기업 성장에 필요한 사업비를 지원합니다." },
    { id: 322, category: "지자체 지원", title: "대전 소상공인 폐업 재기 지원", amount: "최대 200만원 + 컨설팅", eligibility: "대전 소재 폐업/재기 소상공인", deadline: "상시 접수", dDay: null, description: "폐업 소상공인의 재취업 또는 재창업을 위한 자금 및 전문 컨설팅을 지원합니다." },
  ],
  "경기도": [
    { id: 331, category: "지자체 지원", title: "경기도 중소기업 판로 지원사업", amount: "전시회 참가비 (최대 1,000만원)", eligibility: "경기도 소재 중소기업", deadline: "2026-08-31", dDay: 67, description: "국내외 전시회, 박람회 참가 비용 및 온라인 판로 개척 비용을 지원합니다." },
    { id: 332, category: "지자체 지원", title: "경기 청년 일자리 장려금", amount: "월 40만원 (6개월)", eligibility: "경기도 소재 중소기업", deadline: "2026-12-31", dDay: 189, description: "경기도 소재 중소기업이 청년을 정규직으로 채용 시 인건비를 보조합니다." },
  ],
};

function getBenefitsForBusiness(info: BusinessInfo | null): Benefit[] {
  if (!info) return COMMON_BENEFITS;

  const benefits: Benefit[] = [...COMMON_BENEFITS];

  // 업종 매칭
  const industry = info.industry || "";
  if (industry.includes("제조")) {
    benefits.push(...(INDUSTRY_BENEFITS["제조업"] || []));
  } else if (industry.includes("음식") || industry.includes("식품") || industry.includes("요식")) {
    benefits.push(...(INDUSTRY_BENEFITS["음식점"] || []));
  } else if (industry.includes("소매") || industry.includes("도매") || industry.includes("유통") || industry.includes("판매")) {
    benefits.push(...(INDUSTRY_BENEFITS["소매"] || []));
  } else if (industry.includes("소프트웨어") || industry.includes("정보") || industry.includes("IT") || industry.includes("컴퓨터") || industry.includes("프로그램")) {
    benefits.push(...(INDUSTRY_BENEFITS["IT"] || []));
  } else if (industry.includes("교육") || industry.includes("학원") || industry.includes("훈련")) {
    benefits.push(...(INDUSTRY_BENEFITS["교육"] || []));
  } else if (industry.includes("건설") || industry.includes("건축") || industry.includes("인테리어")) {
    benefits.push(...(INDUSTRY_BENEFITS["건설"] || []));
  }

  // 지역 매칭
  const address = info.address || "";
  if (address.includes("경상남도")) {
    benefits.push(...(REGION_BENEFITS["경상남도"] || []));
  } else if (address.includes("서울")) {
    benefits.push(...(REGION_BENEFITS["서울"] || []));
  } else if (address.includes("대전")) {
    benefits.push(...(REGION_BENEFITS["대전"] || []));
  } else if (address.includes("경기")) {
    benefits.push(...(REGION_BENEFITS["경기도"] || []));
  }

  // 마감일순 정렬 (상시 접수는 마지막)
  benefits.sort((a, b) => {
    if (a.dDay === null && b.dDay === null) return 0;
    if (a.dDay === null) return 1;
    if (b.dDay === null) return -1;
    return a.dDay - b.dDay;
  });

  return benefits;
}

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

  const [bizInfo, setBizInfo] = useState<BusinessInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showAllBenefits, setShowAllBenefits] = useState(false);
  const [taxGuide, setTaxGuide] = useState<TaxGuideResponse | null>(null);
  const [taxGuideLoading, setTaxGuideLoading] = useState(false);

  const benefits = getBenefitsForBusiness(bizInfo);

  const formatted = biz
    ? `${biz.slice(0, 3)}-${biz.slice(3, 5)}-${biz.slice(5)}`
    : "";

  useEffect(() => {
    if (!biz || biz.length !== 10) {
      setError("올바른 사업자등록번호를 입력해주세요.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/business", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ businessNumber: biz }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "조회에 실패했습니다.");
          setLoading(false);
          return;
        }

        const data: BusinessInfo = await res.json();
        setBizInfo(data);
      } catch {
        setError("서버와 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [biz]);

  // 절세 가이드 조회
  useEffect(() => {
    if (!bizInfo?.industry) return;

    const fetchTaxGuide = async () => {
      setTaxGuideLoading(true);
      try {
        const res = await fetch("/api/tax-guide", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ industry: bizInfo.industry }),
        });
        if (res.ok) {
          const data: TaxGuideResponse = await res.json();
          setTaxGuide(data);
        }
      } catch {
        // 절세 가이드 실패해도 메인 페이지에 영향 없음
      } finally {
        setTaxGuideLoading(false);
      }
    };

    fetchTaxGuide();
  }, [bizInfo?.industry]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setEmailSent(true);
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-10 sm:py-16">
        <Link
          href="/"
          className="mb-8 inline-block text-sm font-medium text-muted transition-colors hover:text-brand-orange"
        >
          &larr; 다시 조회하기
        </Link>
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
          <p className="text-sm text-muted">
            사업자 정보를 조회하고 있습니다...
          </p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-10 sm:py-16">
        <Link
          href="/"
          className="mb-8 inline-block text-sm font-medium text-muted transition-colors hover:text-brand-orange"
        >
          &larr; 다시 조회하기
        </Link>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950">
          <p className="text-base font-bold text-red-700 dark:text-red-300">
            조회 실패
          </p>
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-brand-blue px-6 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
          >
            다시 조회하기
          </Link>
        </div>
      </div>
    );
  }

  // 정보 항목 렌더링 헬퍼
  const infoItems = [
    { label: "사업자명", value: bizInfo?.businessName },
    { label: "대표자", value: bizInfo?.representative },
    { label: "업종", value: bizInfo?.industry },
    { label: "종목", value: bizInfo?.businessType },
    { label: "소재지", value: bizInfo?.address },
    { label: "사업자 상태", value: bizInfo?.status },
    { label: "과세유형", value: bizInfo?.taxType },
    { label: "설립일", value: bizInfo?.establishedDate },
    { label: "종업원수", value: bizInfo?.employeeCount },
  ].filter((item) => item.value);

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
        <div className="flex flex-col gap-5">
          {/* 상단: 사업자번호 + 사업자명 */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted">사업자번호</p>
              <p className="text-lg font-bold tracking-wider">{formatted}</p>
            </div>
            {bizInfo?.businessName && (
              <div className="sm:text-right">
                <p className="text-xs font-medium text-muted">사업자명</p>
                <p className="text-lg font-bold">{bizInfo.businessName}</p>
              </div>
            )}
          </div>

          {/* 상세 정보 그리드 */}
          {infoItems.length > 0 && (
            <div className="border-t border-border pt-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {infoItems
                  .filter((item) => item.label !== "사업자명")
                  .map((item) => (
                    <div key={item.label}>
                      <p className="text-xs text-muted">{item.label}</p>
                      <p className="mt-0.5 text-sm font-medium">
                        {item.value}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 데이터 소스 표시 */}
          {bizInfo?.source && (
            <div className="flex gap-2 pt-1">
              {bizInfo.source.nts && (
                <span className="rounded-lg bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                  국세청 확인
                </span>
              )}
              {bizInfo.source.bizno && (
                <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  사업자정보 확인
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-8 mb-6 flex items-baseline justify-between">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          받을 수 있는 혜택{" "}
          <span className="text-brand-orange">{benefits.length}건</span>
        </h1>
        <p className="text-xs text-muted">마감일순 정렬</p>
      </div>

      {/* Benefit Cards */}
      <div className="space-y-4">
        {(showAllBenefits ? benefits : benefits.slice(0, 3)).map((benefit) => {
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
                  <a
                    href={`https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/list.do?searchKeyword=${encodeURIComponent(benefit.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
                  >
                    신청 방법 보기
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 더보기 버튼 */}
      {benefits.length > 3 && !showAllBenefits && (
        <button
          type="button"
          onClick={() => setShowAllBenefits(true)}
          className="mt-4 w-full rounded-2xl border-2 border-brand-orange/40 bg-brand-orange/5 py-5 text-base font-semibold text-brand-orange transition-all hover:bg-brand-orange/10 hover:border-brand-orange active:scale-[0.99] dark:bg-brand-orange/10 dark:hover:bg-brand-orange/20"
        >
          혜택 {benefits.length - 3}건 더보기
        </button>
      )}
      {showAllBenefits && benefits.length > 3 && (
        <button
          type="button"
          onClick={() => setShowAllBenefits(false)}
          className="mt-4 w-full rounded-2xl border border-border bg-card py-4 text-sm font-medium text-muted transition-all hover:border-brand-orange/30 hover:text-foreground"
        >
          접기
        </button>
      )}

      {/* Marketing CTA */}
      {bizInfo?.businessName && (
        <div className="mt-12 rounded-2xl border border-brand-orange/30 bg-gradient-to-r from-brand-blue/5 to-brand-orange/5 p-6 sm:p-8 text-center dark:from-brand-blue/10 dark:to-brand-orange/10">
          <p className="text-lg font-bold sm:text-xl">
            {bizInfo.businessName}에 적합한
          </p>
          <p className="text-lg font-bold sm:text-xl">
            무료 마케팅 가이드를 확인해보세요
          </p>
          <p className="mt-2 text-sm text-muted">
            AI가 업종과 지역에 맞는 맞춤형 마케팅 전략을 분석합니다
          </p>
          <Link
            href={`/marketing?biz=${biz}`}
            className="mt-5 inline-block rounded-xl bg-brand-orange px-8 py-3.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
          >
            마케팅 가이드 받기
          </Link>
        </div>
      )}

      {/* Email Section */}
      <div className="mt-8 rounded-2xl border border-border bg-surface p-6 sm:p-8">
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
