export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-3xl flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">로그인</h1>
          <p className="text-sm text-muted">
            저장한 혜택 정보를 확인하려면 로그인하세요.
          </p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            className="w-full rounded-2xl border border-border bg-card px-5 py-4 text-base font-medium transition-all hover:border-brand-orange/30 active:scale-[0.98]"
          >
            카카오로 시작하기
          </button>
          <button
            type="button"
            className="w-full rounded-2xl border border-border bg-card px-5 py-4 text-base font-medium transition-all hover:border-brand-orange/30 active:scale-[0.98]"
          >
            네이버로 시작하기
          </button>
          <button
            type="button"
            className="w-full rounded-2xl border border-border bg-card px-5 py-4 text-base font-medium transition-all hover:border-brand-orange/30 active:scale-[0.98]"
          >
            Google로 시작하기
          </button>
        </div>

        <p className="text-xs text-muted">
          로그인 시 이용약관 및 개인정보처리방침에 동의하게 됩니다.
        </p>
      </div>
    </div>
  );
}
