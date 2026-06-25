export default function MyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            내 저장 혜택
          </h1>
          <p className="text-muted">
            저장한 혜택과 신청 현황을 확인할 수 있습니다.
          </p>
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16">
          <p className="mb-1 text-lg font-medium">아직 저장한 혜택이 없습니다</p>
          <p className="text-sm text-muted">
            혜택 조회 후 관심 있는 항목을 저장해보세요.
          </p>
        </div>
      </div>
    </div>
  );
}
