/**
 * bizno.net 크롤링 헬퍼
 * meta 태그에서 사업자 정보를 추출한다.
 *
 * description 실제 형식:
 *   "주식회사 이티엔에 대한 사업자정보  주요제품 : 모기장,핫팩 ... 과세유형 : 부가가치세 일반과세자 ...
 *    업태 : 기타 직물제품 제조업 업종 : 상품 종합 도매업 ... 설립일(신고/인허가일) : 2015-08-10
 *    대표자명 : 정영주 회사주소 : 경상남도 밀양시 멍에실로2길 33-1 (가곡동)  종업원수 : 14명 ..."
 *
 * keywords 실제 형식:
 *   "주식회사 이티엔,중소기업,제조업,기타 제품 제조업,...,정영주,319-88-00182,191311-0025588"
 */

export interface BiznoResult {
  businessName?: string
  representative?: string
  industry?: string
  businessType?: string
  address?: string
  establishedDate?: string
  employeeCount?: string
  taxType?: string
  companySize?: string
  status?: string
}

/**
 * bizno.net에서 사업자 정보를 크롤링한다.
 * @param bizNumber 하이픈 없는 10자리 사업자번호
 */
export async function fetchBiznoInfo(bizNumber: string): Promise<BiznoResult> {
  const url = `https://www.bizno.net/article/${bizNumber}`

  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept':
        'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
    },
    signal: AbortSignal.timeout(10000),
  })

  if (!res.ok) {
    throw new Error(`bizno.net 응답 오류: ${res.status}`)
  }

  const html = await res.text()
  return parseMetaTags(html)
}

/**
 * description 문자열에서 "키 : 값" 패턴으로 필드를 추출한다.
 * 키 목록이 정해져 있으므로 다음 키가 나올 때까지를 값으로 잡는다.
 */
function extractField(desc: string, key: string, nextKeys: string[]): string {
  // key 뒤에 " : " 패턴을 찾는다
  const keyPattern = new RegExp(key + '\\s*[:：]\\s*')
  const keyMatch = keyPattern.exec(desc)
  if (!keyMatch) return ''

  const startIdx = keyMatch.index + keyMatch[0].length

  // 다음 키가 나오는 위치를 찾는다
  let endIdx = desc.length
  for (const nk of nextKeys) {
    const nkPattern = new RegExp('\\s+' + nk + '\\s*[:：]')
    const nkMatch = nkPattern.exec(desc.slice(startIdx))
    if (nkMatch && nkMatch.index < endIdx - startIdx) {
      endIdx = startIdx + nkMatch.index
    }
  }

  return desc.slice(startIdx, endIdx).replace(/\s+/g, ' ').trim()
}

function parseMetaTags(html: string): BiznoResult {
  const result: BiznoResult = {}

  // meta description 추출
  const descMatch = html.match(
    /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i
  ) || html.match(
    /<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i
  )
  const description = descMatch?.[1] || ''

  // meta keywords 추출
  const kwMatch = html.match(
    /<meta\s+name=["']keywords["']\s+content=["']([^"']+)["']/i
  ) || html.match(
    /<meta\s+content=["']([^"']+)["']\s+name=["']keywords["']/i
  )
  const keywords = kwMatch?.[1] || ''

  // meta title 추출 (사업자명)
  const titleMatch = html.match(
    /<meta\s+name=["']title["']\s+content=["']([^"']+)["']/i
  )
  if (titleMatch && titleMatch[1].trim()) {
    result.businessName = titleMatch[1].trim()
  }

  // description의 모든 필드 키 목록
  const allKeys = [
    '주요제품', '기업규모', '법인구분', '과세유형', '법인형태',
    '업종분류', '업태', '업종', '통신판매업번호',
    '사업자 현재 상태.*', '설립일.*', '대표자명',
    '회사주소', '종업원수', '사업자등록번호', '법인등록번호',
  ]

  if (description) {
    // 사업자명: "~에 대한 사업자정보" 앞의 텍스트
    if (!result.businessName) {
      const nameMatch = description.match(/^(.+?)에 대한 사업자정보/)
      if (nameMatch) {
        result.businessName = nameMatch[1].trim()
      }
    }

    // 업태 (= industry)
    const businessTypeVal = extractField(description, '업태', allKeys)
    if (businessTypeVal) {
      result.businessType = businessTypeVal
    }

    // 업종분류 (= industry, 대분류)
    const industryVal = extractField(description, '업종분류', allKeys)
    if (industryVal) {
      result.industry = industryVal
    }

    // 업종 (종목 - 소분류)
    // "업종" 키가 "업종분류" 키와 겹치므로 별도 처리
    if (!result.industry) {
      const bizTypeVal = extractField(description, '업종(?!분류)', allKeys)
      if (bizTypeVal) {
        result.industry = bizTypeVal
      }
    }

    // 과세유형
    const taxVal = extractField(description, '과세유형', allKeys)
    if (taxVal) {
      result.taxType = taxVal
    }

    // 기업규모
    const sizeVal = extractField(description, '기업규모', allKeys)
    if (sizeVal) {
      result.companySize = sizeVal
    }

    // 대표자명
    const repVal = extractField(description, '대표자명', allKeys)
    if (repVal) {
      result.representative = repVal
    }

    // 회사주소
    const addrVal = extractField(description, '회사주소', allKeys)
    if (addrVal) {
      result.address = addrVal
    }

    // 설립일
    const dateMatch = description.match(/설립일[^:：]*[:：]\s*(\d{4}-\d{2}-\d{2})/)
    if (dateMatch) {
      result.establishedDate = dateMatch[1]
    }

    // 종업원수
    const empMatch = description.match(/종업원수\s*[:：]\s*(\d+)명/)
    if (empMatch) {
      result.employeeCount = `${empMatch[1]}명`
    }

    // 사업자 상태: "계속사업자", "휴업자", "폐업자" 등만 유효
    const statusMatch = description.match(/사업자 현재 상태[^:：]*[:：]\s*(계속사업자|휴업자|폐업자)/)
    if (statusMatch) {
      result.status = statusMatch[1]
    }
  }

  // keywords에서 보완
  if (keywords) {
    const parts = keywords.split(',').map((s) => s.trim())

    // 사업자명 보완
    if (!result.businessName && parts.length > 0 && !/^\d/.test(parts[0])) {
      result.businessName = parts[0]
    }

    // 대표자 보완: 한글 2~5자 이름 패턴, 사업자번호/법인번호가 아닌 것
    if (!result.representative) {
      const repPart = parts.find(
        (p) => /^[가-힣]{2,5}$/.test(p)
      )
      if (repPart) {
        result.representative = repPart
      }
    }
  }

  return result
}
