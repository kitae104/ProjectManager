import { useQuery } from '@tanstack/react-query'
import { getHealth } from '../features/health/api/getHealth'
import { getMyInfo } from '../features/auth/api/authApi'

export function DashboardPage() {
  const healthQuery = useQuery({
    queryKey: ['health-check'],
    queryFn: getHealth,
  })

  const meQuery = useQuery({
    queryKey: ['my-info'],
    queryFn: getMyInfo,
  })

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">대시보드</h2>
        <p className="mt-2 text-sm text-slate-600">
          인증 상태와 백엔드 연결 상태를 확인합니다.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Backend Health
          </p>
          {healthQuery.isLoading && (
            <p className="mt-2 text-sm text-slate-600">헬스체크 조회 중...</p>
          )}
          {healthQuery.isError && (
            <p className="mt-2 text-sm text-red-600">
              백엔드 연결에 실패했습니다. `VITE_API_BASE_URL` 또는 서버 실행 상태를
              확인해 주세요.
            </p>
          )}
          {healthQuery.isSuccess && (
            <div className="mt-2 text-sm text-slate-700">
              <p>
                상태:{' '}
                <span className="font-semibold text-emerald-600">
                  {healthQuery.data.data.status}
                </span>
              </p>
              <p>서비스: {healthQuery.data.data.service}</p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Auth / Me API
          </p>
          {meQuery.isLoading && (
            <p className="mt-2 text-sm text-slate-600">내 정보 조회 중...</p>
          )}
          {meQuery.isError && (
            <p className="mt-2 text-sm text-red-600">
              인증 정보가 유효하지 않습니다. 다시 로그인해 주세요.
            </p>
          )}
          {meQuery.isSuccess && (
            <div className="mt-2 text-sm text-slate-700">
              <p>이름: {meQuery.data.data.name}</p>
              <p>이메일: {meQuery.data.data.email}</p>
              <p>역할: {meQuery.data.data.role}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

