export default function ResultPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            혜택 조회 결과
          </h1>
          <p className="text-muted">
            입력하신 사업자번호에 해당하는 혜택 목록입니다.
          </p>
        </div>

        {/* Placeholder cards */}
        <div className="space-y-4">
          {["정부지원금", "세금 혜택", "인증/인허가"].map((category) => (
            <div
              key={category}
              className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-brand-orange/30"
            >
              <h2 className="mb-2 text-lg font-semibold">{category}</h2>
              <p className="text-sm text-muted">
                해당 카테고리의 혜택 정보가 여기에 표시됩니다.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
