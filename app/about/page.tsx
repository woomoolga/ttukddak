export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <div className="space-y-8">
        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            뚝딱 소개
          </h1>
          <p className="text-lg text-muted">
            사업자를 위한 맞춤형 혜택 검색 서비스
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-3 text-lg font-semibold">뚝딱이 하는 일</h2>
            <p className="leading-relaxed text-muted">
              복잡한 정부지원 정책, 세금 혜택, 인허가 정보를 사업자번호 하나로
              간편하게 조회할 수 있습니다. 업종과 규모에 맞는 정보만 골라서
              보여드립니다.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-3 text-lg font-semibold">왜 뚝딱인가요</h2>
            <p className="leading-relaxed text-muted">
              여러 사이트를 돌아다니며 정보를 찾을 필요 없이, 뚝딱 한 번이면
              필요한 혜택을 모두 확인할 수 있습니다. 복잡한 것은 저희가,
              간편한 것은 사장님이.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-3 text-lg font-semibold">추가 서비스</h2>
            <p className="leading-relaxed text-muted">
              업종별 마케팅 가이드와 IT 서비스 견적까지, 사업 운영에 필요한
              모든 것을 한곳에서 해결하세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
