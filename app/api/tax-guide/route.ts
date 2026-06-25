import { NextRequest, NextResponse } from "next/server";
import expenseRates from "@/data/expense-rates.json";

interface ExpenseRate {
  industryCode: string;
  industryName: string;
  standardRate: number;
  simpleRate: number;
  category: string;
  deductibleItems: string[];
}

const data: ExpenseRate[] = expenseRates as ExpenseRate[];

function normalizeKeyword(str: string): string {
  return str
    .replace(/\s+/g, "")
    .replace(/[·\-_]/g, "")
    .toLowerCase();
}

function scoreMatch(query: string, entry: ExpenseRate): number {
  const q = normalizeKeyword(query);
  const name = normalizeKeyword(entry.industryName);
  const category = normalizeKeyword(entry.category);

  // 정확히 포함
  if (name.includes(q) || q.includes(name)) return 100;
  if (category.includes(q) || q.includes(category)) return 60;

  // 부분 키워드 매칭
  let score = 0;
  const keywords = q.split("").filter((c) => c.trim());
  for (const char of keywords) {
    if (name.includes(char)) score += 2;
    if (category.includes(char)) score += 1;
  }

  // 주요 키워드 매칭
  const keywordMap: Record<string, string[]> = {
    음식: ["음식점", "한식", "중식", "일식", "양식", "분식", "치킨", "피자", "배달", "포장"],
    카페: ["커피", "음료"],
    커피: ["커피", "카페", "음료"],
    빵: ["제과점"],
    제과: ["제과점"],
    베이커리: ["제과점"],
    옷: ["의류"],
    패션: ["의류"],
    편의점: ["편의점", "체인화"],
    마트: ["슈퍼마켓", "식품소매"],
    슈퍼: ["슈퍼마켓"],
    미용: ["미용", "이용"],
    헤어: ["미용", "이용"],
    네일: ["미용"],
    세탁: ["세탁"],
    빨래: ["세탁"],
    학원: ["학원", "입시", "예체능", "직업훈련"],
    헬스: ["스포츠", "헬스장"],
    체육: ["스포츠"],
    필라테스: ["필라테스", "요가"],
    요가: ["필라테스", "요가"],
    개발: ["소프트웨어", "프로그래밍"],
    프로그래밍: ["소프트웨어", "프로그래밍"],
    코딩: ["소프트웨어", "프로그래밍"],
    앱: ["소프트웨어", "프로그래밍"],
    웹: ["웹사이트", "웹에이전시"],
    디자인: ["디자인"],
    유튜브: ["미디어", "유튜버"],
    유튜버: ["미디어", "유튜버"],
    건설: ["건설", "토목", "건축"],
    인테리어: ["인테리어", "실내건축"],
    시공: ["건설", "전문건설"],
    택시: ["택시"],
    화물: ["화물"],
    택배: ["택배"],
    배달: ["배달", "퀵서비스"],
    부동산: ["부동산", "중개", "임대"],
    중개: ["부동산", "중개"],
    임대: ["임대", "건물"],
    병원: ["의원", "치과", "한의원"],
    의원: ["의원"],
    치과: ["치과"],
    한의원: ["한의원"],
    약국: ["약국"],
    세무: ["세무사", "회계사"],
    회계: ["세무사", "회계사"],
    변호사: ["변호사", "법무사"],
    법무사: ["변호사", "법무사"],
    펫: ["반려동물"],
    반려동물: ["반려동물"],
    애견: ["반려동물"],
    사진: ["사진촬영"],
    광고: ["광고대행"],
    인쇄: ["인쇄"],
    가구: ["가구"],
    제조: ["제조"],
    도매: ["도매"],
    소매: ["소매"],
    프리랜서: ["프리랜서", "자영업"],
  };

  for (const [keyword, targets] of Object.entries(keywordMap)) {
    if (q.includes(keyword)) {
      for (const target of targets) {
        if (name.includes(target)) {
          score += 50;
          break;
        }
      }
    }
  }

  return score;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { industry } = body;

    if (!industry || typeof industry !== "string") {
      return NextResponse.json(
        { error: "업종명(industry)을 입력해주세요." },
        { status: 400 }
      );
    }

    // 점수 기반 매칭
    const scored = data
      .map((entry) => ({
        ...entry,
        score: scoreMatch(industry, entry),
      }))
      .filter((e) => e.score > 0)
      .sort((a, b) => b.score - a.score);

    if (scored.length === 0) {
      // 매칭 안 되면 카테고리별 대표 업종 추천
      const categories = [...new Set(data.map((d) => d.category))];
      const suggestions = categories.map((cat) => {
        const representative = data.find((d) => d.category === cat);
        return representative
          ? { category: cat, example: representative.industryName }
          : null;
      }).filter(Boolean);

      return NextResponse.json({
        matched: false,
        message: "정확히 일치하는 업종을 찾지 못했습니다. 아래 업종 카테고리를 참고해주세요.",
        suggestions,
      });
    }

    const best = scored[0];
    const similar = scored
      .slice(1, 4)
      .filter((e) => e.score >= 10)
      .map(({ score: _score, ...rest }) => rest);

    const { score: _bestScore, ...bestData } = best;

    return NextResponse.json({
      matched: true,
      data: bestData,
      similar: similar.length > 0 ? similar : undefined,
    });
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
