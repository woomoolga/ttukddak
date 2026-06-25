import { NextRequest, NextResponse } from 'next/server'

// TODO: Supabase 클라이언트 import
// import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/business
 * 사업자등록번호로 사업자 상태 조회
 *
 * Request body: { businessNumber: string }
 * Response: { status, businessType, taxType, ... }
 */
export async function POST(request: NextRequest) {
  try {
    const { businessNumber } = await request.json()

    if (!businessNumber || businessNumber.length !== 10) {
      return NextResponse.json(
        { error: '올바른 사업자등록번호(10자리)를 입력해주세요.' },
        { status: 400 }
      )
    }

    // TODO: Supabase 캐시 확인
    // const supabase = createClient(...)
    // const cached = await supabase.from('businesses').select('*').eq('business_number', businessNumber).single()
    // if (cached && isRecentCache(cached.cached_at)) return NextResponse.json(cached)

    // TODO: 국세청 사업자등록 상태조회 API 호출
    // const apiKey = process.env.DATA_GO_KR_API_KEY
    // const res = await fetch('https://api.odcloud.kr/api/nts-businessman/v1/status', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Infuser ${apiKey}`,
    //   },
    //   body: JSON.stringify({ b_no: [businessNumber] }),
    // })
    // const data = await res.json()

    // TODO: 응답 파싱 후 businesses 테이블에 캐시 저장
    // await supabase.from('businesses').upsert({ business_number: businessNumber, ... })

    return NextResponse.json({
      message: 'TODO: 사업자 조회 API 구현 예정',
      businessNumber,
    })
  } catch (error) {
    console.error('사업자 조회 오류:', error)
    return NextResponse.json(
      { error: '사업자 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
