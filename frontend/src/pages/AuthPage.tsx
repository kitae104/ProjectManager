import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login, signup } from '../features/auth/api/authApi'
import { useAuthStore } from '../features/auth/store/useAuthStore'

type AuthPageProps = {
  mode: 'login' | 'signup'
  title: string
  description: string
}

export function AuthPage({ mode, title, description }: AuthPageProps) {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [department, setDepartment] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const authMutation = useMutation({
    mutationFn: async () => {
      if (mode === 'signup') {
        return signup({
          name,
          email,
          password,
          department,
        })
      }
      return login({ email, password })
    },
    onSuccess: (result) => {
      setAuth(result.data.accessToken, result.data.user)
      navigate('/dashboard', { replace: true })
    },
    onError: () => {
      setErrorMessage('인증에 실패했습니다. 입력값을 확인해 주세요.')
    },
  })

  const isSubmitting = authMutation.isPending

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    authMutation.mutate()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 px-4">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">{description}</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="이름"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          )}
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            placeholder="이메일"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <input
            type="password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            placeholder="비밀번호(8자 이상)"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
          />

          {mode === 'signup' && (
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="소속(예: 컴퓨터공학과)"
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              required
            />
          )}

          {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSubmitting ? '처리 중...' : title}
          </button>
        </form>

        <div className="mt-4 text-sm text-slate-600">
          {mode === 'login' ? (
            <p>
              계정이 없나요?{' '}
              <Link to="/signup" className="font-semibold text-blue-600 hover:underline">
                회원가입
              </Link>
            </p>
          ) : (
            <p>
              이미 계정이 있나요?{' '}
              <Link to="/login" className="font-semibold text-blue-600 hover:underline">
                로그인
              </Link>
            </p>
          )}
        </div>
      </section>
    </main>
  )
}

