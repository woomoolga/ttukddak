export default function MarketingPage() {
  const guides = [
    {
      title: "음식점 마케팅",
      description: "배달앱 최적화, SNS 운영, 리뷰 관리 전략",
    },
    {
      title: "소매업 마케팅",
      description: "온라인 쇼핑몰 구축, 검색 광고, 고객 관리",
    },
    {
      title: "서비스업 마케팅",
      description: "예약 시스템, 블로그 마케팅, 포트폴리오 구축",
    },
    {
      title: "제조업 마케팅",
      description: "B2B 영업, 전시회 활용, 카탈로그 제작",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            업종별 마케팅 가이드
          </h1>
          <p className="text-muted">
            업종에 맞는 실전 마케팅 전략을 확인하세요.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {guides.map((guide) => (
            <div
              key={guide.title}
              className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-brand-orange/30"
            >
              <h2 className="mb-2 text-lg font-semibold">{guide.title}</h2>
              <p className="text-sm text-muted">{guide.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
