export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-3xl flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm space-y-10 text-center">
        {/* Hero */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            뚝딱 시작하기
          </h1>
          <p className="text-sm text-muted">
            간편 로그인으로 맞춤 혜택을 저장하고 관리하세요.
          </p>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3">
          <button
            type="button"
            className="w-full rounded-2xl bg-[#FEE500] px-5 py-4 text-base font-semibold text-[#191919] transition-all hover:opacity-90 active:scale-[0.98]"
          >
            카카오로 시작하기
          </button>
          <button
            type="button"
            className="w-full rounded-2xl bg-[#03C75A] px-5 py-4 text-base font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
          >
            네이버로 시작하기
          </button>
          <button
            type="button"
            className="w-full rounded-2xl border border-border bg-white px-5 py-4 text-base font-semibold text-[#333] transition-all hover:opacity-90 active:scale-[0.98] dark:bg-card dark:text-foreground"
          >
            구글로 시작하기
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted">또는</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Guest notice */}
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm font-medium">비회원도 혜택 조회가 가능합니다</p>
          <p className="mt-1 text-xs text-muted">
            로그인 없이도 사업자번호만 입력하면 혜택을 확인할 수 있습니다.
          </p>
        </div>

        {/* Terms */}
        <p className="text-xs text-muted">
          로그인 시 이용약관 및 개인정보처리방침에 동의하게 됩니다.
        </p>
      </div>
    </div>
  );
}
