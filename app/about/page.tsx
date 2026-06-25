export default function AboutPage() {
  const values = [
    {
      number: "01",
      title: "정확한 혜택 정보",
      description:
        "공공데이터를 기반으로 정확한 정보만 제공합니다. 출처가 불분명한 정보는 다루지 않습니다.",
    },
    {
      number: "02",
      title: "AI 맞춤 마케팅",
      description:
        "업종과 지역에 맞는 마케팅 전략을 AI가 분석하여 제안합니다. 실행 가능한 구체적인 가이드를 드립니다.",
    },
    {
      number: "03",
      title: "IT 원스톱 서비스",
      description:
        "디자인, 개발, 영상, 인프라까지 사업에 필요한 모든 IT 서비스를 한곳에서 해결할 수 있습니다.",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
      {/* Hero */}
      <div className="mb-20 space-y-6 text-center">
        <p className="text-sm font-semibold tracking-widest text-brand-orange uppercase">
          About
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          사업자의 모든 IT 고민을
          <br />
          <span className="text-brand-orange">뚝딱</span> 해결합니다
        </h1>
        <p className="mx-auto max-w-lg text-lg leading-relaxed text-muted">
          복잡한 정부지원 정책, 세금 혜택, 마케팅 전략부터
          <br className="hidden sm:block" />
          IT 서비스까지 사업 운영에 필요한 모든 것을 한곳에서.
        </p>
      </div>

      {/* Core Values */}
      <div className="mb-20">
        <div className="grid gap-6 sm:grid-cols-3">
          {values.map((v) => (
            <div
              key={v.number}
              className="rounded-3xl border border-border bg-card p-8 transition-colors hover:border-brand-orange/30"
            >
              <p className="mb-4 text-3xl font-bold text-brand-orange/30">
                {v.number}
              </p>
              <h2 className="mb-3 text-xl font-bold">{v.title}</h2>
              <p className="text-sm leading-relaxed text-muted">
                {v.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Mission Statement */}
      <div className="mb-20 rounded-3xl bg-brand-blue p-10 text-center sm:p-16">
        <p className="mx-auto max-w-lg text-lg font-medium leading-relaxed text-white/90 sm:text-xl">
          &ldquo;여러 사이트를 돌아다니며 정보를 찾을 필요 없이,
          <br className="hidden sm:block" />
          뚝딱 한 번이면 필요한 혜택을 모두 확인할 수 있습니다.
          <br />
          <strong className="text-white">
            복잡한 것은 저희가, 간편한 것은 사장님이.
          </strong>
          &rdquo;
        </p>
      </div>

      {/* Contact */}
      <div className="rounded-3xl border border-border bg-card p-8 sm:p-12">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight">문의하기</h2>
          <p className="mt-2 text-muted">
            궁금한 점이 있으시면 언제든 연락주세요.
          </p>
        </div>
        <div className="mx-auto grid max-w-md gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background p-6 text-center">
            <p className="mb-1 text-sm text-muted">이메일</p>
            <a
              href="mailto:admin@ch360.org"
              className="text-base font-semibold text-brand-blue transition-colors hover:text-brand-orange"
            >
              admin@ch360.org
            </a>
          </div>
          <div className="rounded-2xl border border-border bg-background p-6 text-center">
            <p className="mb-1 text-sm text-muted">전화</p>
            <a
              href="tel:042-123-4567"
              className="text-base font-semibold text-brand-blue transition-colors hover:text-brand-orange"
            >
              042-123-4567
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
