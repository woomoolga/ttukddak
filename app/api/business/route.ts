import { NextRequest, NextResponse } from 'next/server'
import { fetchBiznoInfo } from '@/app/lib/bizno'

/**
 * 국세청 사업자등록 상태조회 API 호출
 * NTS_API_KEY 환경변수가 없으면 스킵한다.
 */
async function fetchNtsStatus(bizNumber: string) {
  const apiKey = process.env.NTS_API_KEY
  if (!apiKey) return null

  try {
    const res = await fetch(
      `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ b_no: [bizNumber] }),
        signal: AbortSignal.timeout(8000),
      }
    )

    if (!res.ok) {
      console.error('국세청 API 응답 오류:', res.status)
      return null
    }

    const json = await res.json()
    const item = json?.data?.[0]
    if (!item) return null

    return {
      status: item.b_stt || '',        // 계속사업자 / 휴업자 / 폐업자
      taxType: item.tax_type || '',     // 부가가치세 일반과세자 등
    }
  } catch (err) {
    console.error('국세청 API 호출 실패:', err)
    return null
  }
}

/**
 * POST /api/business
 * 사업자등록번호로 사업자 정보를 조회한다.
 *
 * Request body: { businessNumber: string } (하이픈 포함/미포함 모두 가능)
 * Response: 통합된 사업자 정보 JSON
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const raw = (body.businessNumber || '').replace(/\D/g, '')

    if (!raw || raw.length !== 10) {
      return NextResponse.json(
        { error: '올바른 사업자등록번호(10자리)를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 하이픈 포맷
    const formatted = `${raw.slice(0, 3)}-${raw.slice(3, 5)}-${raw.slice(5)}`

    // 국세청 API + bizno.net 크롤링을 동시에 호출
    const [ntsResult, biznoResult] = await Promise.allSettled([
      fetchNtsStatus(raw),
      fetchBiznoInfo(raw),
    ])

    const nts = ntsResult.status === 'fulfilled' ? ntsResult.value : null
    const bizno = biznoResult.status === 'fulfilled' ? biznoResult.value : null

    if (!nts && !bizno) {
      return NextResponse.json(
        { error: '사업자 정보를 조회할 수 없습니다. 잠시 후 다시 시도해주세요.' },
        { status: 502 }
      )
    }

    return NextResponse.json({
      businessNumber: formatted,
      businessName: bizno?.businessName || '',
      representative: bizno?.representative || '',
      industry: bizno?.industry || '',
      businessType: bizno?.businessType || '',
      address: bizno?.address || '',
      status: nts?.status || bizno?.status || '',
      taxType: nts?.taxType || bizno?.taxType || '',
      establishedDate: bizno?.establishedDate || '',
      employeeCount: bizno?.employeeCount || '',
      source: {
        nts: !!nts,
        bizno: !!bizno,
      },
    })
  } catch (error) {
    console.error('사업자 조회 오류:', error)
    return NextResponse.json(
      { error: '사업자 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
