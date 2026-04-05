import { useQuery } from '@tanstack/react-query'
import { getHealth } from '../features/health/api/getHealth'

export function DashboardPage() {
  const healthQuery = useQuery({
    queryKey: ['health-check'],
    queryFn: getHealth,
  })

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">대시보드</h2>
        <p className="mt-2 text-sm text-slate-600">
          백엔드 헬스체크 API 연결 상태를 확인합니다.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Backend Connection
        </p>
        {healthQuery.isLoading && (
          <p className="mt-2 text-sm text-slate-600">헬스체크를 조회 중입니다.</p>
        )}
        {healthQuery.isError && (
          <p className="mt-2 text-sm text-red-600">
            백엔드 연결에 실패했습니다. 백엔드를 실행하고 `VITE_API_BASE_URL`을 확인해
            주세요.
          </p>
        )}
        {healthQuery.isSuccess && (
          <div className="mt-3 space-y-1 text-sm text-slate-700">
            <p>
              상태: <span className="font-semibold text-emerald-600">{healthQuery.data.data.status}</span>
            </p>
            <p>서비스: {healthQuery.data.data.service}</p>
            <p>시간: {new Date(healthQuery.data.data.timestamp).toLocaleString()}</p>
          </div>
        )}
      </div>
    </section>
  )
}

