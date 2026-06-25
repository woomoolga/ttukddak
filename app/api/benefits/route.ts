import { NextRequest, NextResponse } from 'next/server'

// TODO: Supabase 클라이언트 import
// import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/benefits
 * 혜택 목록 조회 (사업자 유형/업종/지역 기반 필터링)
 *
 * Query params:
 *   businessType - 사업자 유형 (개인/법인/간이)
 *   industry     - 업종코드
 *   region       - 지역
 *   page         - 페이지 번호 (기본: 1)
 *   limit        - 페이지당 개수 (기본: 20)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessType = searchParams.get('businessType')
    const industry = searchParams.get('industry')
    const region = searchParams.get('region')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    // TODO: Supabase에서 혜택 목록 조회
    // const supabase = createClient(...)
    // let query = supabase
    //   .from('benefits')
    //   .select('*', { count: 'exact' })
    //   .eq('is_active', true)
    //   .order('deadline', { ascending: true, nullsFirst: false })
    //   .range((page - 1) * limit, page * limit - 1)
    //
    // if (businessType) query = query.contains('target_types', [businessType])
    // if (industry)     query = query.contains('target_industries', [industry])
    // if (region)       query = query.contains('target_regions', [region])
    //
    // const { data, count, error } = await query

    return NextResponse.json({
      message: 'TODO: 혜택 목록 조회 API 구현 예정',
      filters: { businessType, industry, region },
      pagination: { page, limit },
      data: [],
      total: 0,
    })
  } catch (error) {
    console.error('혜택 조회 오류:', error)
    return NextResponse.json(
      { error: '혜택 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
