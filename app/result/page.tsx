"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AdUnit from "@/app/components/AdUnit";

declare global {
  interface Window {
    Kakao?: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Share: {
        sendDefault: (options: Record<string, unknown>) => void;
      };
    };
  }
}

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

interface Benefit {
  id: string;
  title: string;
  category: string;
  organization: string;
  target: string;
  summary: string;
  startDate: string;
  deadline: string;
  dDay: number | null;
  detailUrl: string;
}

// 지역 키워드 추출 (주소에서 시/도 단위 → 약칭 반환)
const REGION_MAP: Record<string, string> = {
  "서울특별시": "서울", "서울": "서울",
  "부산광역시": "부산", "부산": "부산",
  "대구광역시": "대구", "대구": "대구",
  "인천광역시": "인천", "인천": "인천",
  "광주광역시": "광주", "광주": "광주",
  "대전광역시": "대전", "대전": "대전",
  "울산광역시": "울산", "울산": "울산",
  "세종특별자치시": "세종", "세종": "세종",
  "경기도": "경기", "경기": "경기",
  "강원특별자치도": "강원", "강원도": "강원", "강원": "강원",
  "충청북도": "충북", "충북": "충북",
  "충청남도": "충남", "충남": "충남",
  "전북특별자치도": "전북", "전라북도": "전북", "전북": "전북",
  "전라남도": "전남", "전남": "전남",
  "경상북도": "경북", "경북": "경북",
  "경상남도": "경남", "경남": "경남",
  "제주특별자치도": "제주", "제주": "제주",
};
function extractRegion(address: string): string {
  if (!address) return "";
  for (const [full, short] of Object.entries(REGION_MAP)) {
    if (address.startsWith(full)) return short;
  }
  return "";
}

// 혜택 제목의 [지역] 태그가 사업자 지역과 맞는지 필터링
// [경북] 혜택은 경남 사업자에게 안 보이고, 지역 태그 없는 전국 혜택은 유지
const REGIONS = ["서울","부산","대구","인천","광주","대전","울산","세종","경기","강원","충북","충남","전북","전남","경북","경남","제주"];
// 지역명 정식↔약칭 매핑 (제목 본문 검사용)
const REGION_FULL: Record<string, string> = {
  "서울": "서울", "부산": "부산", "대구": "대구", "인천": "인천",
  "광주": "광주", "대전": "대전", "울산": "울산", "세종": "세종",
  "경기": "경기", "강원": "강원", "충북": "충북", "충남": "충남",
  "전북": "전북", "전남": "전남", "경북": "경북", "경남": "경남", "제주": "제주",
  "경상북": "경북", "경상남": "경남", "충청북": "충북", "충청남": "충남",
  "전라북": "전북", "전라남": "전남",
};
function isRegionMatch(benefit: Benefit, bizRegion: string, bizAddress?: string): boolean {
  if (!bizRegion) return true;
  const title = benefit.title;

  // 1) [지역] 태그 검사
  const tagMatch = title.match(/^\[([^\]]+)\]/);
  if (tagMatch && REGIONS.includes(tagMatch[1])) {
    if (tagMatch[1] !== bizRegion) return false;

    // 같은 시/도 내에서 시/군 특정 공고면 내 시/군과 비교
    if (bizAddress) {
      const afterTag = title.slice(tagMatch[0].length).trim();
      const cityMatch = afterTag.match(/^([\w가-힣]+[시군구])\s*[·,\s]/);
      if (cityMatch) {
        const bizCity = bizAddress.match(/[시도]\s+([\w가-힣]+[시군구])/);
        if (bizCity && !afterTag.includes(bizCity[1])) {
          return false;
        }
      }
    }
    return true;
  }

  // 2) 제목 본문에 타 지역 시/도명 패턴 검사
  for (const [keyword, short] of Object.entries(REGION_FULL)) {
    if (short === bizRegion) continue;
    if (new RegExp(`(^|\\s|\\[)${keyword}(도|특별시|광역시|시)?\\s`).test(title)) {
      return false;
    }
  }

  return true;
}

function getCategoryColor(category: string): string {
  switch (category) {
    case "금융":
      return "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
    case "기술":
      return "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300";
    case "인력":
      return "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300";
    case "수출":
      return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300";
    case "내수":
      return "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300";
    case "창업":
      return "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300";
    case "경영":
      return "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300";
    default:
      return "bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
  }
}

function ResultContent() {
  const searchParams = useSearchParams();
  const biz = searchParams.get("biz") || "";

  const [bizInfo, setBizInfo] = useState<BusinessInfo | null>(null);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [benefitsLoading, setBenefitsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAllBenefits, setShowAllBenefits] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [taxGuide, setTaxGuide] = useState<TaxGuideResponse | null>(null);
  const [taxGuideLoading, setTaxGuideLoading] = useState(false);

  // 추가 데이터 소스
  const [subsidies, setSubsidies] = useState<Benefit[]>([]);
  const [subsidiesLoading, setSubsidiesLoading] = useState(false);
  const [smesNotices, setSmesNotices] = useState<Benefit[]>([]);
  const [smesLoading, setSmesLoading] = useState(false);
  const [procurements, setProcurements] = useState<Benefit[]>([]);
  const [procurementsLoading, setProcurementsLoading] = useState(false);

  const [copyToast, setCopyToast] = useState(false);
  const [kakaoReady, setKakaoReady] = useState(false);

  // Kakao SDK 로드 및 초기화
  useEffect(() => {
    const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
    if (!kakaoKey) return;
    if (window.Kakao?.isInitialized?.()) {
      setKakaoReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";
    script.async = true;
    script.onload = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(kakaoKey);
        setKakaoReady(true);
      }
    };
    document.head.appendChild(script);
  }, []);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 2000);
    } catch {
      // fallback
      const input = document.createElement("input");
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 2000);
    }
  }, []);

  const handleKakaoShare = useCallback((count: number) => {
    if (!window.Kakao?.Share) return;
    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: `내 사업자 맞춤 혜택 ${count}건 발견!`,
        description: "사업자번호 하나로 정부지원금, 세금 혜택, 보조금까지 무료 조회",
        imageUrl: "https://ttukddak.woomoolga.com/og-image.jpg",
        link: {
          mobileWebUrl: window.location.href,
          webUrl: window.location.href,
        },
      },
      buttons: [
        {
          title: "혜택 확인하기",
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
      ],
    });
  }, []);

  const isClosed = bizInfo?.status === "폐업자";
  const isSuspended = bizInfo?.status === "휴업자";

  // 공공기관/지자체/비영리 등 혜택 대상이 아닌 사업자
  const taxType = bizInfo?.taxType || "";
  const isNonEligible =
    taxType.includes("국가") ||
    taxType.includes("지방자치") ||
    taxType.includes("비영리") ||
    (taxType.includes("면세") &&
      (bizInfo?.industry?.includes("공공") ||
        bizInfo?.industry?.includes("행정") ||
        bizInfo?.industry?.includes("지방자치")));

  const showBenefits = !isClosed && !isNonEligible;

  const formatted = biz
    ? `${biz.slice(0, 3)}-${biz.slice(3, 5)}-${biz.slice(5)}`
    : "";

  // 사업자 정보 조회
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
        if (!data.businessName && !data.status) {
          setError("해당 사업자등록번호로 등록된 기업을 찾을 수 없습니다. 번호를 다시 확인해주세요.");
          setLoading(false);
          return;
        }
        setBizInfo(data);
      } catch {
        setError(
          "서버와 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [biz]);

  // 기업마당 API로 실제 혜택 조회
  useEffect(() => {
    if (!bizInfo || isClosed || isNonEligible) return;

    const fetchBenefits = async () => {
      setBenefitsLoading(true);
      try {
        const industry = bizInfo.industry || "";
        const region = extractRegion(bizInfo.address || "");

        const params = new URLSearchParams({ limit: "20", page: "1" });
        if (industry) params.set("industry", industry);
        if (region) params.set("region", region);

        const res = await fetch(`/api/benefits?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          // 마감 공고 + 타 지역 공고 필터링
          const active = (data.benefits || []).filter(
            (b: Benefit) => (b.dDay === null || b.dDay >= 0) && isRegionMatch(b, region, bizInfo?.address)
          );
          setBenefits(active);
          setTotalCount(data.totalCount || 0);
        }
      } catch {
        // 혜택 조회 실패해도 사업자 정보는 유지
      } finally {
        setBenefitsLoading(false);
      }
    };

    fetchBenefits();
  }, [bizInfo, isClosed, isNonEligible]);

  // 추가 데이터 소스 병렬 조회 (보조금24, 중소벤처24, 내일배움카드, 나라장터)
  useEffect(() => {
    if (!bizInfo || isClosed || isNonEligible) return;
    const industry = bizInfo.industry || "";
    const region = extractRegion(bizInfo.address || "");

    // 보조금24
    (async () => {
      setSubsidiesLoading(true);
      try {
        const p = new URLSearchParams({ limit: "20" });
        if (industry) p.set("keyword", industry);
        const res = await fetch(`/api/benefits-subsidy?${p}`);
        if (res.ok) {
          const data = await res.json();
          setSubsidies((data.benefits || []).filter((b: Benefit) => isRegionMatch(b, region, bizInfo?.address)));
        }
      } catch { /* 실패해도 무시 */ } finally { setSubsidiesLoading(false); }
    })();

    // 중소벤처24
    (async () => {
      setSmesLoading(true);
      try {
        const res = await fetch("/api/benefits-smes?limit=20");
        if (res.ok) {
          const data = await res.json();
          setSmesNotices((data.benefits || []).filter((b: Benefit) =>
            (b.dDay === null || b.dDay >= 0) && isRegionMatch(b, region, bizInfo?.address)
          ));
        }
      } catch { /* 실패해도 무시 */ } finally { setSmesLoading(false); }
    })();

    // 나라장터 입찰
    (async () => {
      setProcurementsLoading(true);
      try {
        const p = new URLSearchParams({ limit: "10" });
        if (industry) p.set("keyword", industry);
        const res = await fetch(`/api/benefits-procurement?${p}`);
        if (res.ok) {
          const data = await res.json();
          setProcurements(data.benefits || []);
        }
      } catch { /* 실패해도 무시 */ } finally { setProcurementsLoading(false); }
    })();
  }, [bizInfo, isClosed, isNonEligible]);

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

  // 더보기 (다음 페이지 로드)
  const loadMore = async () => {
    if (!bizInfo) return;
    const nextPage = currentPage + 1;
    setBenefitsLoading(true);
    try {
      const industry = bizInfo.industry || "";
      const region = extractRegion(bizInfo.address || "");

      const params = new URLSearchParams({
        limit: "20",
        page: String(nextPage),
      });
      if (industry) params.set("industry", industry);
      if (region) params.set("region", region);

      const res = await fetch(`/api/benefits?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const active = (data.benefits || []).filter(
          (b: Benefit) => (b.dDay === null || b.dDay >= 0) && isRegionMatch(b, region, bizInfo?.address)
        );
        setBenefits((prev) => [...prev, ...active]);
        setCurrentPage(nextPage);
      }
    } catch {
      // 실패 시 무시
    } finally {
      setBenefitsLoading(false);
    }
  };

  const [emailSending, setEmailSending] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setEmailSending(true);
    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          businessNumber: biz,
          businessName: bizInfo?.businessName || "",
          benefits: benefits.map((b) => ({
            title: b.title,
            category: b.category,
            deadline: b.deadline,
            organization: b.organization,
          })),
        }),
      });
      if (res.ok) {
        setEmailSent(true);
      }
    } catch {
      // 실패해도 UI는 유지
    } finally {
      setEmailSending(false);
    }
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

  const displayBenefits = showAllBenefits ? benefits : benefits.slice(0, 5);
  const hasMore = benefits.length < totalCount;

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
      <div className={`rounded-2xl border p-6 sm:p-8 ${isClosed ? "border-red-400 bg-card dark:border-red-700" : "border-border bg-card"}`}>
        <div className="flex flex-col gap-5">
          {/* 상단: 사업자번호 + 사업자명 */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted">사업자번호</p>
              <p className="text-lg font-bold tracking-wider">{formatted}</p>
            </div>
            <div className="flex items-center gap-3 sm:text-right">
              {isClosed && (
                <span className="rounded-lg bg-red-100 px-3 py-1 text-xs font-bold text-red-700 dark:bg-red-950 dark:text-red-400">
                  폐업
                </span>
              )}
              {bizInfo?.businessName && (
                <div>
                  <p className="text-xs font-medium text-muted">사업자명</p>
                  <p className="text-lg font-bold">{bizInfo.businessName}</p>
                </div>
              )}
            </div>
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

      {/* 폐업 안내 */}
      {isClosed && (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950">
          <p className="text-lg font-bold text-red-700 dark:text-red-300">
            이 사업자는 현재 폐업 상태입니다
          </p>
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            폐업된 사업자는 혜택 조회 대상이 아닙니다.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-brand-blue px-6 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
          >
            다른 사업자 조회하기
          </Link>
        </div>
      )}

      {/* 휴업 안내 */}
      {isSuspended && !isClosed && (
        <div className="mt-8 rounded-2xl border border-yellow-200 bg-yellow-50 p-6 text-center dark:border-yellow-900 dark:bg-yellow-950">
          <p className="text-base font-bold text-yellow-700 dark:text-yellow-300">
            이 사업자는 현재 휴업 상태입니다
          </p>
          <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-400">
            일부 혜택은 휴업 중 신청이 불가할 수 있습니다.
          </p>
        </div>
      )}

      {/* 공공기관/비대상 안내 */}
      {isNonEligible && !isClosed && (
        <div className="mt-8 rounded-2xl border border-border bg-surface p-8 text-center">
          <p className="text-lg font-bold">
            해당 사업자는 혜택 조회 대상이 아닙니다
          </p>
          <p className="mt-2 text-sm text-muted">
            공공기관, 지방자치단체, 비영리법인 등은 중소기업·소상공인 지원 혜택
            대상에 포함되지 않습니다.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-brand-blue px-6 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
          >
            다른 사업자 조회하기
          </Link>
        </div>
      )}

      {/* 혜택 로딩 */}
      {showBenefits && benefitsLoading && benefits.length === 0 && (
        <div className="mt-8 flex flex-col items-center justify-center py-12 space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
          <p className="text-sm text-muted">
            맞춤 지원사업을 검색하고 있습니다...
          </p>
        </div>
      )}

      {/* 혜택 없음 */}
      {showBenefits &&
        !benefitsLoading &&
        benefits.length === 0 && (
          <div className="mt-8 rounded-2xl border border-border bg-surface p-8 text-center">
            <p className="text-lg font-bold">
              현재 신청 가능한 지원사업이 없습니다
            </p>
            <p className="mt-2 text-sm text-muted">
              업종과 지역에 맞는 새로운 공고가 등록되면 다시 확인해주세요.
            </p>
          </div>
        )}

      {/* Share Toolbar */}
      {showBenefits && benefits.length > 0 && (
        <div className="mt-8 flex items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={handleCopyLink}
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-brand-orange/30 hover:bg-card-hover active:scale-[0.97]"
          >
            링크 복사
          </button>
          {kakaoReady && (
            <button
              type="button"
              onClick={() => handleKakaoShare(benefits.length + subsidies.length + smesNotices.length)}
              className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-brand-orange/30 hover:bg-card-hover active:scale-[0.97]"
            >
              카카오톡 공유
            </button>
          )}
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-brand-orange/30 hover:bg-card-hover active:scale-[0.97]"
          >
            PDF 저장
          </button>
        </div>
      )}

      {/* Copy Toast */}
      {copyToast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background shadow-lg print:hidden">
          복사됨!
        </div>
      )}

      {/* Summary */}
      {showBenefits && benefits.length > 0 && (
        <div className="mt-6 mb-6 flex items-baseline justify-between">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            신청 가능한 지원사업{" "}
            <span className="text-brand-orange">{benefits.length}건</span>
            {totalCount > benefits.length && (
              <span className="text-sm font-normal text-muted ml-2">
                / 전체 {totalCount}건
              </span>
            )}
          </h1>
          <p className="text-xs text-muted">기업마당 실시간 데이터</p>
        </div>
      )}

      {/* Benefit Cards */}
      {showBenefits && benefits.length > 0 && (
        <div className="space-y-4">
          {displayBenefits.map((benefit) => {
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
                        {benefit.category && (
                          <span
                            className={`inline-block rounded-lg px-2.5 py-1 text-xs font-semibold ${getCategoryColor(benefit.category)}`}
                          >
                            {benefit.category}
                          </span>
                        )}
                        {benefit.dDay !== null &&
                          benefit.dDay >= 0 &&
                          benefit.dDay <= 30 && (
                            <span className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 dark:bg-red-950 dark:text-red-400">
                              D-{benefit.dDay}
                            </span>
                          )}
                      </div>
                      <h2 className="text-base font-bold sm:text-lg">
                        {benefit.title}
                      </h2>
                      {benefit.target && (
                        <p className="text-sm text-muted">{benefit.target}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-start sm:items-end sm:text-right shrink-0">
                      <p className="text-sm font-medium text-brand-orange">
                        {benefit.organization}
                      </p>
                      {benefit.deadline && (
                        <p className="text-xs text-muted mt-1">
                          마감 {benefit.deadline}
                        </p>
                      )}
                      {benefit.startDate && !benefit.deadline && (
                        <p className="text-xs text-muted mt-1">
                          시작 {benefit.startDate}
                        </p>
                      )}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border px-6 pb-6 pt-4 space-y-4">
                    {benefit.summary && (
                      <p className="text-sm leading-relaxed text-muted">
                        {benefit.summary}
                      </p>
                    )}
                    {benefit.startDate && benefit.deadline && (
                      <p className="text-xs text-muted">
                        신청기간: {benefit.startDate} ~ {benefit.deadline}
                      </p>
                    )}
                    {benefit.detailUrl && (
                      <a
                        href={benefit.detailUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
                      >
                        상세보기 및 신청
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 더보기 버튼 */}
      {showBenefits && benefits.length > 5 && !showAllBenefits && (
        <button
          type="button"
          onClick={() => setShowAllBenefits(true)}
          className="mt-4 w-full rounded-2xl border-2 border-brand-orange/40 bg-brand-orange/5 py-5 text-base font-semibold text-brand-orange transition-all hover:bg-brand-orange/10 hover:border-brand-orange active:scale-[0.99] dark:bg-brand-orange/10 dark:hover:bg-brand-orange/20"
        >
          {benefits.length - 5}건 더보기
        </button>
      )}

      {/* 추가 로드 */}
      {showBenefits && showAllBenefits && hasMore && (
        <button
          type="button"
          onClick={loadMore}
          disabled={benefitsLoading}
          className="mt-4 w-full rounded-2xl border border-border bg-card py-4 text-sm font-medium text-muted transition-all hover:border-brand-orange/30 hover:text-foreground disabled:opacity-50"
        >
          {benefitsLoading ? "불러오는 중..." : "더 많은 지원사업 불러오기"}
        </button>
      )}

      {/* 보조금24 섹션 */}
      {showBenefits && subsidiesLoading && (
        <div className="mt-10 flex items-center gap-2 text-sm text-muted">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
          정부 보조금/혜택 조회 중...
        </div>
      )}
      {showBenefits && subsidies.length > 0 && (
        <>
          <div className="mt-10 mb-6 flex items-baseline justify-between">
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              정부 보조금/혜택{" "}
              <span className="text-brand-orange">{subsidies.length}건</span>
            </h2>
            <p className="text-xs text-muted">보조금24 데이터</p>
          </div>
          <div className="space-y-4">
            {subsidies.slice(0, showAllBenefits ? undefined : 5).map((b) => (
              <div key={b.id} className="rounded-2xl border border-border bg-card transition-all hover:border-brand-orange/30">
                <button type="button" onClick={() => setExpandedId(expandedId === b.id ? null : b.id)} className="w-full p-6 text-left">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2 flex-1">
                      {b.category && (
                        <span className="inline-block rounded-lg bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-300">{b.category}</span>
                      )}
                      <h3 className="text-base font-bold sm:text-lg">{b.title}</h3>
                      {b.target && <p className="text-sm text-muted">{b.target}</p>}
                    </div>
                    <div className="flex flex-col items-start sm:items-end sm:text-right shrink-0">
                      <p className="text-sm font-medium text-brand-orange">{b.organization}</p>
                    </div>
                  </div>
                </button>
                {expandedId === b.id && (
                  <div className="border-t border-border px-6 pb-6 pt-4 space-y-4">
                    {b.summary && <p className="text-sm leading-relaxed text-muted">{b.summary}</p>}
                    {b.detailUrl && (
                      <a href={b.detailUrl} target="_blank" rel="noopener noreferrer" className="inline-block rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]">상세보기 및 신청</a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* 중소벤처24 섹션 */}
      {showBenefits && smesLoading && (
        <div className="mt-10 flex items-center gap-2 text-sm text-muted">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
          중소기업 공고 조회 중...
        </div>
      )}
      {showBenefits && smesNotices.length > 0 && (
        <>
          <div className="mt-10 mb-6 flex items-baseline justify-between">
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              중소기업 지원 공고{" "}
              <span className="text-brand-orange">{smesNotices.length}건</span>
            </h2>
            <p className="text-xs text-muted">중소벤처24 데이터</p>
          </div>
          <div className="space-y-4">
            {smesNotices.slice(0, showAllBenefits ? undefined : 5).map((b) => (
              <div key={b.id} className="rounded-2xl border border-border bg-card transition-all hover:border-brand-orange/30">
                <button type="button" onClick={() => setExpandedId(expandedId === b.id ? null : b.id)} className="w-full p-6 text-left">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {b.category && (
                          <span className={`inline-block rounded-lg px-2.5 py-1 text-xs font-semibold ${getCategoryColor(b.category)}`}>{b.category}</span>
                        )}
                        {b.dDay !== null && b.dDay >= 0 && b.dDay <= 30 && (
                          <span className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 dark:bg-red-950 dark:text-red-400">D-{b.dDay}</span>
                        )}
                      </div>
                      <h3 className="text-base font-bold sm:text-lg">{b.title}</h3>
                      {b.target && <p className="text-sm text-muted">{b.target}</p>}
                    </div>
                    <div className="flex flex-col items-start sm:items-end sm:text-right shrink-0">
                      <p className="text-sm font-medium text-brand-orange">{b.organization}</p>
                      {b.deadline && <p className="text-xs text-muted mt-1">마감 {b.deadline}</p>}
                    </div>
                  </div>
                </button>
                {expandedId === b.id && (
                  <div className="border-t border-border px-6 pb-6 pt-4 space-y-4">
                    {b.summary && <p className="text-sm leading-relaxed text-muted">{b.summary}</p>}
                    {b.detailUrl && (
                      <a href={b.detailUrl} target="_blank" rel="noopener noreferrer" className="inline-block rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]">상세보기 및 신청</a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* 나라장터 입찰 섹션 */}
      {showBenefits && procurementsLoading && (
        <div className="mt-10 flex items-center gap-2 text-sm text-muted">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
          조달 입찰 공고 조회 중...
        </div>
      )}
      {showBenefits && procurements.length > 0 && (
        <>
          <div className="mt-10 mb-6 flex items-baseline justify-between">
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              조달 입찰 공고{" "}
              <span className="text-brand-orange">{procurements.length}건</span>
            </h2>
            <p className="text-xs text-muted">나라장터 데이터</p>
          </div>
          <div className="space-y-4">
            {procurements.slice(0, 5).map((b) => (
              <div key={b.id} className="rounded-2xl border border-border bg-card transition-all hover:border-brand-orange/30">
                <button type="button" onClick={() => setExpandedId(expandedId === b.id ? null : b.id)} className="w-full p-6 text-left">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-block rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">입찰</span>
                        {b.dDay !== null && b.dDay >= 0 && b.dDay <= 7 && (
                          <span className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 dark:bg-red-950 dark:text-red-400">D-{b.dDay}</span>
                        )}
                      </div>
                      <h3 className="text-base font-bold sm:text-lg">{b.title}</h3>
                    </div>
                    <div className="flex flex-col items-start sm:items-end sm:text-right shrink-0">
                      <p className="text-sm font-medium text-brand-orange">{b.organization}</p>
                      {b.deadline && <p className="text-xs text-muted mt-1">마감 {b.deadline}</p>}
                    </div>
                  </div>
                </button>
                {expandedId === b.id && (
                  <div className="border-t border-border px-6 pb-6 pt-4 space-y-4">
                    {b.summary && <p className="text-sm leading-relaxed text-muted">{b.summary}</p>}
                    {b.detailUrl && (
                      <a href={b.detailUrl} target="_blank" rel="noopener noreferrer" className="inline-block rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]">상세보기</a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Marketing CTA */}
      {showBenefits && bizInfo?.businessName && (
        <div className="mt-12 rounded-2xl border border-brand-orange/30 bg-gradient-to-r from-brand-blue/5 to-brand-orange/5 p-6 sm:p-8 text-center dark:from-brand-blue/10 dark:to-brand-orange/10">
          <p className="text-lg font-bold sm:text-xl">
            <span className="text-brand-orange">{bizInfo.businessName}</span>에 적합한
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
      {showBenefits && benefits.length > 0 && (
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
                  지원사업 목록과 신청 링크를 정리한 리포트를 보내드립니다.
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
                  disabled={emailSending}
                  className="shrink-0 rounded-xl bg-brand-orange px-6 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                >
                  {emailSending ? "전송 중..." : "전송하기"}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* 데이터 출처 */}
      {showBenefits && (benefits.length > 0 || subsidies.length > 0 || smesNotices.length > 0 || procurements.length > 0) && (
        <p className="mt-4 text-center text-xs text-muted">
          데이터 출처: 기업마당 · 보조금24 · 중소벤처24 · 나라장터
        </p>
      )}

      {/* Ad Unit */}
      {showBenefits && (benefits.length > 0 || subsidies.length > 0) && (
        <AdUnit slot="9618849619" className="mt-8" />
      )}

      {/* Cross Promotion */}
      {showBenefits && (benefits.length > 0 || subsidies.length > 0) && (
        <div className="mt-12 print:hidden">
          <p className="mb-4 text-center text-sm font-medium text-muted">
            이런 도구도 있어요
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a
              href="https://vibescan.woomoolga.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-brand-orange/30 hover:bg-card-hover"
            >
              <p className="text-sm font-bold">VibeScan</p>
              <p className="mt-1 text-xs text-muted">
                홈페이지 보안 무료 검사
              </p>
            </a>
            <a
              href="https://whateat.woomoolga.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-brand-orange/30 hover:bg-card-hover"
            >
              <p className="text-sm font-bold">오늘 뭐 먹지?</p>
              <p className="mt-1 text-xs text-muted">
                오늘 점심 뭐 먹을지 추천
              </p>
            </a>
          </div>
        </div>
      )}
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
