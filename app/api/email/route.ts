import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

export async function POST(request: NextRequest) {
  try {
    const { email, businessNumber, businessName, benefits } = await request.json()

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

    const formatted = `${businessNumber.slice(0, 3)}-${businessNumber.slice(3, 5)}-${businessNumber.slice(5)}`
    const benefitList = benefits?.map((b: { title: string; amount: string; deadline: string; category: string }) =>
      `<tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;">
          <span style="display:inline-block;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600;background:#f0f4ff;color:#1e3a5f;margin-right:8px;">${b.category}</span>
          ${b.title}
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#f6842a;font-weight:600;white-space:nowrap;">${b.amount}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#71717a;white-space:nowrap;">${b.deadline}</td>
      </tr>`
    ).join('') || ''

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

      <div style="background:#1e3a5f;padding:32px 24px;text-align:center;">
        <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">뚝딱</h1>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">사업자 맞춤 혜택 리포트</p>
      </div>

      <div style="padding:32px 24px;">
        <div style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:24px;">
          <p style="margin:0 0 4px;font-size:12px;color:#71717a;">사업자번호</p>
          <p style="margin:0;font-size:18px;font-weight:700;letter-spacing:2px;">${formatted}</p>
          ${businessName ? `<p style="margin:8px 0 0;font-size:15px;font-weight:600;">${businessName}</p>` : ''}
        </div>

        <h2 style="margin:0 0 16px;font-size:18px;font-weight:700;">
          받을 수 있는 혜택 <span style="color:#f6842a;">${benefits?.length || 0}건</span>
        </h2>

        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="padding:10px 16px;text-align:left;font-size:12px;color:#71717a;font-weight:600;">혜택명</th>
              <th style="padding:10px 16px;text-align:left;font-size:12px;color:#71717a;font-weight:600;">지원금액</th>
              <th style="padding:10px 16px;text-align:left;font-size:12px;color:#71717a;font-weight:600;">마감일</th>
            </tr>
          </thead>
          <tbody>
            ${benefitList}
          </tbody>
        </table>

        <div style="margin-top:32px;text-align:center;">
          <a href="https://ttukddak.woomoolga.com/result?biz=${businessNumber}"
             style="display:inline-block;padding:14px 32px;background:#f6842a;color:#ffffff;text-decoration:none;border-radius:12px;font-size:15px;font-weight:600;">
            자세히 보기
          </a>
        </div>

        <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#71717a;text-align:center;">
            본 정보는 참고용이며, 정확한 내용은 해당 기관에 확인하세요.
          </p>
        </div>
      </div>

      <div style="background:#f9fafb;padding:20px 24px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#71717a;">
          뚝딱 — 사업자를 위한 올인원 혜택 검색 서비스
        </p>
      </div>
    </div>
  </div>
</body>
</html>`

    const resend = getResend()
    const { error } = await resend.emails.send({
      from: '뚝딱 <noreply@woomoolga.com>',
      to: email,
      subject: `[뚝딱] ${businessName || formatted}의 맞춤 혜택 ${benefits?.length || 0}건을 확인하세요`,
      html,
    })

    if (error) {
      console.error('Resend 오류:', error)
      return NextResponse.json(
        { error: '이메일 전송에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('이메일 전송 오류:', error)
    return NextResponse.json(
      { error: '이메일 전송 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
