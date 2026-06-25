import { NextRequest, NextResponse } from "next/server";

interface PlatformResult {
  name: string;
  status: "found" | "not_found" | "unknown";
  count?: number;
  url: string | null;
  guideUrl: string;
  guideLabel: string;
}

const GUIDE_MAP: Record<
  string,
  { url: string; label: string }
> = {
  "네이버 쇼핑": {
    url: "https://edu.sellercenter.naver.com",
    label: "판매 최적화 무료 강의",
  },
  "네이버 플레이스": {
    url: "https://help.naver.com/alias/business/business-myplace.naver",
    label: "등록 방법 무료 강의",
  },
  옥션: {
    url: "https://www.esmplus.com/Home/Home",
    label: "판매자 센터 가이드",
  },
  지마켓: {
    url: "https://www.esmplus.com/Home/Home",
    label: "판매자 센터 가이드",
  },
  쿠팡: {
    url: "https://wing.coupang.com",
    label: "쿠팡 윙 입점 가이드",
  },
  인스타그램: {
    url: "https://business.instagram.com/getting-started",
    label: "비즈니스 시작 가이드",
  },
  "네이버 블로그": {
    url: "https://section.blog.naver.com/BlogHome.naver",
    label: "블로그 시작 가이드",
  },
};

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function fetchWithTimeout(
  url: string,
  timeoutMs = 5000
): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function checkNaverShopping(
  query: string
): Promise<PlatformResult> {
  const searchUrl = `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(query)}`;
  const guide = GUIDE_MAP["네이버 쇼핑"];
  try {
    const html = await fetchWithTimeout(searchUrl);
    if (!html) {
      return {
        name: "네이버 쇼핑",
        status: "unknown",
        url: searchUrl,
        guideUrl: guide.url,
        guideLabel: guide.label,
      };
    }
    // 상품 수 파싱 시도
    const countMatch = html.match(
      /totalCount["\s:]+(\d+)/
    );
    const count = countMatch ? parseInt(countMatch[1], 10) : 0;

    // 상품이 있는지 여러 패턴으로 확인
    const hasProducts =
      count > 0 ||
      html.includes("product_item") ||
      html.includes("basicList") ||
      html.includes("商品");

    return {
      name: "네이버 쇼핑",
      status: hasProducts ? "found" : "not_found",
      count: hasProducts ? count || undefined : undefined,
      url: searchUrl,
      guideUrl: guide.url,
      guideLabel: hasProducts ? "판매 최적화 무료 강의" : "입점 가이드 무료 강의",
    };
  } catch {
    return {
      name: "네이버 쇼핑",
      status: "unknown",
      url: searchUrl,
      guideUrl: guide.url,
      guideLabel: guide.label,
    };
  }
}

async function checkNaverPlace(
  query: string
): Promise<PlatformResult> {
  const searchUrl = `https://map.naver.com/p/search/${encodeURIComponent(query)}`;
  const apiUrl = `https://map.naver.com/p/api/search/allSearch?query=${encodeURIComponent(query)}&type=all`;
  const guide = GUIDE_MAP["네이버 플레이스"];
  try {
    const html = await fetchWithTimeout(apiUrl);
    if (!html) {
      return {
        name: "네이버 플레이스",
        status: "unknown",
        url: searchUrl,
        guideUrl: guide.url,
        guideLabel: guide.label,
      };
    }
    // JSON 응답에서 결과 존재 여부 확인
    try {
      const data = JSON.parse(html);
      const hasPlace =
        data?.result?.place?.list?.length > 0 ||
        data?.result?.place?.totalCount > 0;
      const count = data?.result?.place?.totalCount || 0;
      return {
        name: "네이버 플레이스",
        status: hasPlace ? "found" : "not_found",
        count: hasPlace ? count : undefined,
        url: searchUrl,
        guideUrl: guide.url,
        guideLabel: hasPlace ? "플레이스 최적화 가이드" : "등록 방법 무료 강의",
      };
    } catch {
      // JSON 파싱 실패 시 텍스트로 확인
      const hasResult =
        html.includes('"totalCount"') && !html.includes('"totalCount":0');
      return {
        name: "네이버 플레이스",
        status: hasResult ? "found" : "unknown",
        url: searchUrl,
        guideUrl: guide.url,
        guideLabel: guide.label,
      };
    }
  } catch {
    return {
      name: "네이버 플레이스",
      status: "unknown",
      url: searchUrl,
      guideUrl: guide.url,
      guideLabel: guide.label,
    };
  }
}

async function checkAuction(
  query: string
): Promise<PlatformResult> {
  const searchUrl = `https://search.auction.co.kr/search/search.aspx?keyword=${encodeURIComponent(query)}`;
  const guide = GUIDE_MAP["옥션"];
  try {
    const html = await fetchWithTimeout(searchUrl);
    if (!html) {
      return {
        name: "옥션",
        status: "unknown",
        url: searchUrl,
        guideUrl: guide.url,
        guideLabel: guide.label,
      };
    }
    // 검색 결과 있는지 확인
    const noResult =
      html.includes("검색결과가 없습니다") ||
      html.includes("일치하는 상품이 없습니다") ||
      html.includes("nodata");
    const countMatch = html.match(/총\s*<[^>]*>(\d[\d,]*)<\//) ||
      html.match(/(\d[\d,]*)\s*개의?\s*상품/);
    const count = countMatch
      ? parseInt(countMatch[1].replace(/,/g, ""), 10)
      : 0;

    return {
      name: "옥션",
      status: noResult || count === 0 ? "not_found" : "found",
      count: count > 0 ? count : undefined,
      url: searchUrl,
      guideUrl: guide.url,
      guideLabel: count > 0 ? "판매 최적화 가이드" : "입점 가이드",
    };
  } catch {
    return {
      name: "옥션",
      status: "unknown",
      url: searchUrl,
      guideUrl: guide.url,
      guideLabel: guide.label,
    };
  }
}

async function checkGmarket(
  query: string
): Promise<PlatformResult> {
  const searchUrl = `https://browse.gmarket.co.kr/search?keyword=${encodeURIComponent(query)}`;
  const guide = GUIDE_MAP["지마켓"];
  try {
    const html = await fetchWithTimeout(searchUrl);
    if (!html) {
      return {
        name: "지마켓",
        status: "unknown",
        url: searchUrl,
        guideUrl: guide.url,
        guideLabel: guide.label,
      };
    }
    const noResult =
      html.includes("검색결과가 없습니다") ||
      html.includes("일치하는 상품이 없습니다") ||
      html.includes("nodata");
    const countMatch = html.match(/총\s*<[^>]*>(\d[\d,]*)<\//) ||
      html.match(/(\d[\d,]*)\s*개의?\s*상품/);
    const count = countMatch
      ? parseInt(countMatch[1].replace(/,/g, ""), 10)
      : 0;

    return {
      name: "지마켓",
      status: noResult || count === 0 ? "not_found" : "found",
      count: count > 0 ? count : undefined,
      url: searchUrl,
      guideUrl: guide.url,
      guideLabel: count > 0 ? "판매 최적화 가이드" : "입점 가이드",
    };
  } catch {
    return {
      name: "지마켓",
      status: "unknown",
      url: searchUrl,
      guideUrl: guide.url,
      guideLabel: guide.label,
    };
  }
}

function makeUnknownPlatforms(query: string): PlatformResult[] {
  const encodedQuery = encodeURIComponent(query);
  return [
    {
      name: "쿠팡",
      status: "unknown" as const,
      url: `https://www.coupang.com/np/search?component=&q=${encodedQuery}`,
      guideUrl: GUIDE_MAP["쿠팡"].url,
      guideLabel: GUIDE_MAP["쿠팡"].label,
    },
    {
      name: "인스타그램",
      status: "unknown" as const,
      url: `https://www.instagram.com/explore/tags/${encodedQuery}/`,
      guideUrl: GUIDE_MAP["인스타그램"].url,
      guideLabel: GUIDE_MAP["인스타그램"].label,
    },
    {
      name: "네이버 블로그",
      status: "unknown" as const,
      url: `https://search.naver.com/search.naver?where=blog&query=${encodedQuery}`,
      guideUrl: GUIDE_MAP["네이버 블로그"].url,
      guideLabel: GUIDE_MAP["네이버 블로그"].label,
    },
  ];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const businessName = body.businessName?.trim();

    if (!businessName) {
      return NextResponse.json(
        { error: "사업자명이 필요합니다." },
        { status: 400 }
      );
    }

    // 크롤링 가능한 플랫폼은 병렬로 검사
    const results = await Promise.allSettled([
      checkNaverShopping(businessName),
      checkNaverPlace(businessName),
      checkAuction(businessName),
      checkGmarket(businessName),
    ]);

    const platforms: PlatformResult[] = results.map((r) =>
      r.status === "fulfilled"
        ? r.value
        : {
            name: "알 수 없음",
            status: "unknown" as const,
            url: null,
            guideUrl: "",
            guideLabel: "",
          }
    );

    // 크롤링 불가능한 플랫폼은 검색 URL만 제공
    platforms.push(...makeUnknownPlatforms(businessName));

    return NextResponse.json({ platforms });
  } catch {
    return NextResponse.json(
      { error: "플랫폼 검사 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
