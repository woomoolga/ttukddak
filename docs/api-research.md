# 공공API 연동 리서치 (ISS-047)

## 1. 국세청 사업자등록 상태조회 API

### 개요
사업자등록번호 10자리를 입력하면 사업자의 상태(영업중/휴업/폐업), 과세 유형 등을 조회할 수 있다.

### 엔드포인트
```
POST https://api.odcloud.kr/api/nts-businessman/v1/status
```

- **인증**: 공공데이터포털(data.go.kr)에서 API 키 발급
- **헤더**: `Authorization: Infuser {서비스키}`
- **Content-Type**: `application/json`

### 요청 형식
```json
{
  "b_no": ["1234567890"]
}
```
- `b_no`: 사업자등록번호 배열 (최대 100건 동시 조회)

### 응답 형식
```json
{
  "status_code": "OK",
  "match_cnt": 1,
  "data": [
    {
      "b_no": "1234567890",
      "b_stt": "계속사업자",       // 사업자 상태 (계속사업자 / 휴업자 / 폐업자)
      "b_stt_cd": "01",            // 상태코드 (01: 계속, 02: 휴업, 03: 폐업)
      "tax_type": "부가가치세 일반과세자",  // 과세유형
      "tax_type_cd": "01",         // 과세유형코드
      "end_dt": "",                // 폐업일 (YYYYMMDD)
      "utcc_yn": "N",             // 단위과세전환폐업여부
      "tax_type_change_dt": "",    // 과세유형변경일
      "invoice_apply_dt": "",      // 세금계산서적용일
      "rbf_tax_type": "",          // 직전과세유형
      "rbf_tax_type_cd": ""        // 직전과세유형코드
    }
  ]
}
```

### 진위확인 API (추가)
```
POST https://api.odcloud.kr/api/nts-businessman/v1/validate
```

요청:
```json
{
  "businesses": [
    {
      "b_no": "1234567890",
      "start_dt": "20200101",     // 개업일 (YYYYMMDD)
      "p_nm": "홍길동",           // 대표자명
      "p_nm2": "",                // 대표자명2
      "b_nm": "",                 // 상호
      "corp_no": "",              // 법인번호
      "b_sector": "",             // 주업종
      "b_type": ""                // 주업태
    }
  ]
}
```

### 인증키 발급
1. https://www.data.go.kr 회원가입
2. "국세청_사업자등록정보 진위확인 및 상태조회 서비스" 검색
3. 활용신청 → 서비스키 발급 (즉시)
4. 일반 인증키(Encoding)를 사용

### 제한사항
- 일일 호출: 1,000건 (개발계정) / 100,000건 (운영계정)
- 운영계정 전환: 활용신청 시 사유 작성 → 심사 후 승인 (1~3일)
- 사업자번호로 **업종/지역 정보는 직접 제공하지 않음** → 사업자가 직접 입력하거나 별도 DB 필요

### 주의사항
- 이 API는 사업자 상태(영업/휴업/폐업)와 과세유형만 제공
- **업종코드, 업종명, 지역 정보는 제공하지 않음**
- 업종/지역 정보 확보 방안:
  - (A) 사용자 직접 입력 (권장 - 가장 정확)
  - (B) 사업자등록증 OCR (복잡, 비용 발생)
  - (C) 기업정보 조회 API 별도 활용

---

## 2. 기업마당 (bizinfo.go.kr) API

### 개요
중소벤처기업부 기업마당에서 제공하는 정부 지원사업 통합 검색 API. 지원사업 목록, 상세 정보, 지역/업종별 필터링 제공.

### 엔드포인트

#### 지원사업 목록 조회
```
GET https://www.bizinfo.go.kr/uss/rss/bizRssList.json
```

#### 지원사업 상세 조회 (Open API)
```
GET https://www.bizinfo.go.kr/openapi/service/BizInfoService/getBizInfoList
```

### 인증
- https://www.bizinfo.go.kr 회원가입
- 마이페이지 → Open API 신청
- 서비스키 발급

### 요청 파라미터
```
GET https://www.bizinfo.go.kr/openapi/service/BizInfoService/getBizInfoList
  ?ServiceKey={인증키}
  &pageNo=1
  &numOfRows=20
  &dataType=json
  &areaCd=C82            // 지역코드 (서울: C82, 경기: C31 등)
  &indCd=I01             // 업종코드
  &bsnTpCd=G01           // 사업유형 (자금: G01, 기술: G02, 인력: G03 등)
  &pblancNm=창업          // 검색어
```

### 주요 파라미터
| 파라미터 | 설명 | 예시 |
|---------|------|------|
| `areaCd` | 지역코드 | C82(서울), C31(경기), C41(부산) |
| `indCd` | 업종코드 | I01(제조), I02(서비스), I03(IT) |
| `bsnTpCd` | 사업유형 | G01(자금), G02(기술), G03(인력), G04(수출), G05(내수), G06(창업), G07(경영) |
| `trgtJngBzmnCd` | 대상기업 | S01(예비창업자), S02(1년미만), S03(3년미만), S04(5년미만), S05(7년미만), S06(10년미만), S07(10년이상) |

### 응답 형식
```json
{
  "response": {
    "header": {
      "resultCode": "00",
      "resultMsg": "OK"
    },
    "body": {
      "totalCount": 150,
      "items": {
        "item": [
          {
            "pblancId": "PBLN_000000001234",    // 공고 ID
            "pblancNm": "2026년 소상공인 경영안정자금",  // 공고명
            "jrsdInsttNm": "중소벤처기업부",       // 주관기관
            "bsnSumryCn": "소상공인 경영안정...",   // 사업요약
            "reqstBeginEndDe": "2026.01.01~2026.12.31",  // 접수기간
            "areaNm": "전국",                     // 지역
            "pblancUrl": "https://...",           // 공고 URL
            "trgtJngBzmn": "소상공인",             // 대상
            "sprtCn": "최대 7천만원 이내",          // 지원내용
            "bsnTpNm": "자금"                     // 사업유형명
          }
        ]
      }
    }
  }
}
```

### 제한사항
- 일일 호출: 1,000건 (기본) → 추가 신청 가능
- XML/JSON 응답 선택 가능
- 데이터 갱신: 기업마당 공고 등록 시 실시간 반영

---

## 3. 공공데이터포털 (data.go.kr) - 중소기업 지원사업 API

### 개요
공공데이터포털에서 제공하는 중소기업/소상공인 관련 다양한 API.

### 주요 API 목록

#### (1) 중소벤처기업부_중소기업 지원시책 정보
```
GET https://apis.data.go.kr/B552735/smeSuportPolicyService/getSmeSuportPolicyList
  ?serviceKey={인증키}
  &pageNo=1
  &numOfRows=10
  &areaCd=서울
```

#### (2) 중소벤처기업부_소상공인 지원사업 정보
```
GET https://apis.data.go.kr/B552735/sosaengGongjiin/getSmallBizList
  ?serviceKey={인증키}
  &pageNo=1
  &numOfRows=10
```

#### (3) 소상공인시장진흥공단_소상공인 정책자금 정보
```
GET https://apis.data.go.kr/B553077/policyFundInfoService/getPolicyFundInfoList
  ?serviceKey={인증키}
  &pageNo=1
  &numOfRows=10
```

### 인증키 발급
1. https://www.data.go.kr 회원가입 (국세청 API와 동일 포털)
2. 각 API 검색 → 활용신청
3. 서비스키 즉시 발급

### 응답 형식 (공통)
```json
{
  "response": {
    "header": {
      "resultCode": "00",
      "resultMsg": "NORMAL SERVICE"
    },
    "body": {
      "items": [
        {
          "policySj": "2026년 소상공인 정책자금",
          "polyBizSjnm": "소상공인시장진흥공단",
          "polyItcnCn": "경영안정 및 성장기반 자금 지원...",
          "sporCn": "최대 7천만원",
          "bizPrdCn": "2026.01.01 ~ 2026.12.31",
          "rqutPrdCn": "수시접수",
          "jdgnPresCn": "서류심사 → 현장확인",
          "rqutUrla": "https://ols.semas.or.kr",
          "etcCn": "업력 7년 이상 소상공인"
        }
      ],
      "numOfRows": 10,
      "pageNo": 1,
      "totalCount": 45
    }
  }
}
```

### 제한사항
| 계정 유형 | 일일 호출 제한 |
|----------|-------------|
| 개발(기본) | 1,000건 |
| 운영 | 100,000건 |
- 운영계정 전환: 활용신청 사유 작성 → 1~3일 심사

---

## 4. 연동 전략 (권장)

### 4-1. 사업자 정보 조회 흐름
```
사용자 입력 (사업자번호)
  → 국세청 상태조회 API 호출
  → 영업중 확인
  → 업종/지역은 사용자 직접 선택 (드롭다운)
  → businesses 테이블에 캐시 저장
```

### 4-2. 혜택 데이터 수집 흐름
```
[Cron Job - 매일 1회]
  → 기업마당 API 전체 조회
  → data.go.kr 보조 조회
  → benefits 테이블에 upsert (source_id 기준)
  → 만료된 혜택 is_active = false 처리
```

### 4-3. 혜택 매칭 흐름
```
사업자 정보 (유형 + 업종 + 지역)
  → benefits 테이블에서 배열 포함(@>) 조건 검색
  → 매칭된 혜택 목록 반환
```

### 4-4. 필요한 환경변수
```env
# 공공데이터포털 (국세청 + data.go.kr 공용)
DATA_GO_KR_API_KEY=발급받은_서비스키

# 기업마당
BIZINFO_API_KEY=발급받은_서비스키

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## 5. API 키 발급 절차 요약

| API | 발급 URL | 소요시간 | 비용 |
|-----|---------|---------|------|
| 국세청 사업자 상태조회 | https://www.data.go.kr/data/15081808/openapi.do | 즉시 | 무료 |
| 기업마당 | https://www.bizinfo.go.kr → Open API 신청 | 1~3일 | 무료 |
| 공공데이터포털 중소기업 지원시책 | https://www.data.go.kr/data/15064054/openapi.do | 즉시 | 무료 |
| 소상공인 정책자금 | https://www.data.go.kr/data/15068797/openapi.do | 즉시 | 무료 |

모든 API는 **무료**이며, 운영계정(일 10만건)도 무료입니다.
