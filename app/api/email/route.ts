import { NextRequest, NextResponse } from 'next/server'

// TODO: Supabase 클라이언트 import
// import { createClient } from '@supabase/supabase-js'

// TODO: 이메일 발송 라이브러리 import (Resend 등)
// import { Resend } from 'resend'

/**
 * POST /api/email
 * 혜택 결과를 이메일로 전송
 *
 * Request body: {
 *   email: string,
 *   businessNumber: string,
 *   benefitIds: string[],
 *   marketingConsent: boolean
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { email, businessNumber, benefitIds, marketingConsent } = await request.json()

    // 입력 검증
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: '올바른 이메일 주소를 입력해주세요.' },
        { status: 400 }
      )
    }

    if (!businessNumber) {
      return NextResponse.json(
        { error: '사업자등록번호가 필요합니다.' },
        { status: 400 }
      )
    }

    // TODO: 혜택 데이터 조회
    // const supabase = createClient(...)
    // const { data: benefits } = await supabase
    //   .from('benefits')
    //   .select('*')
    //   .in('id', benefitIds)

    // TODO: 이메일 HTML 생성 및 발송
    // const resend = new Resend(process.env.RESEND_API_KEY)
    // await resend.emails.send({
    //   from: 'ttukddak@thebigger.co.kr',
    //   to: email,
    //   subject: `[뚝딱] ${benefits.length}건의 맞춤 혜택을 확인하세요`,
    //   html: generateEmailHtml(benefits),
    // })

    // TODO: 전송 기록 저장
    // await supabase.from('email_submissions').insert({
    //   email,
    //   business_number: businessNumber,
    //   benefits_count: benefitIds?.length || 0,
    //   marketing_consent: marketingConsent || false,
    // })

    return NextResponse.json({
      message: 'TODO: 이메일 전송 API 구현 예정',
      email,
      benefitsCount: benefitIds?.length || 0,
    })
  } catch (error) {
    console.error('이메일 전송 오류:', error)
    return NextResponse.json(
      { error: '이메일 전송 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
