export default function ServicesPage() {
  const services = [
    {
      title: "홈페이지 제작",
      description: "모바일 최적화 반응형 웹사이트를 합리적인 가격에 제작합니다.",
    },
    {
      title: "예약/주문 시스템",
      description: "업종에 맞는 온라인 예약 및 주문 시스템을 구축합니다.",
    },
    {
      title: "업무 자동화",
      description:
        "반복 업무를 자동화하여 시간과 비용을 절약할 수 있습니다.",
    },
    {
      title: "데이터 분석",
      description: "매출, 고객, 재고 데이터를 분석하여 인사이트를 제공합니다.",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            IT 서비스
          </h1>
          <p className="text-muted">
            소상공인을 위한 맞춤형 IT 솔루션을 제공합니다.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {services.map((service) => (
            <div
              key={service.title}
              className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-brand-orange/30"
            >
              <h2 className="mb-2 text-lg font-semibold">{service.title}</h2>
              <p className="mb-4 text-sm text-muted">{service.description}</p>
              <button
                type="button"
                className="rounded-xl bg-brand-blue px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 active:scale-[0.98]"
              >
                견적 요청
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
