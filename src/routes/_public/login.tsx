import {
  Link,
  createFileRoute,
  redirect,
  useSearch,
} from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { getCurrentUser } from '@/api/users/server-fn'
import { useLogin } from '@/api/users/queries'

export const Route = createFileRoute('/_public/login')({
  component: LoginPage,
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) || undefined,
  }),
  beforeLoad: async () => {
    try {
      const user = await getCurrentUser()
      if (user) {
        throw redirect({ to: '/' })
      }
    } catch (error) {
      // If it's a redirect, re-throw it
      if (error && typeof error === 'object' && 'to' in error) {
        throw error
      }
      // Otherwise, continue (user is not logged in)
    }
  },
})

function LoginPage() {
  const { redirect: redirectTo } = useSearch({ from: '/_public/login' })
  const loginMutation = useLogin(redirectTo)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    loginMutation.mutate({ email, password })
  }

  const isLoading = loginMutation.isPending
  const error = loginMutation.error

  return (
    <div className="flex items-center justify-center min-h-screen p-4 text-white">
      <div
        className="w-100 max-w-md p-8 rounded-xl shadow-2xl border border-white/10"
        style={{
          background:
            'linear-gradient(135deg, rgba(22, 32, 46, 0.95) 0%, rgba(12, 26, 43, 0.95) 100%)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <h1 className="mb-6 text-3xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-300 text-transparent bg-clip-text">
          Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-indigo-200"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all text-white placeholder-indigo-300/50"
              style={{
                background: 'rgba(93, 103, 227, 0.1)',
                borderColor: 'rgba(93, 103, 227, 0.3)',
              }}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-indigo-200"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all text-white placeholder-indigo-300/50"
              style={{
                background: 'rgba(93, 103, 227, 0.1)',
                borderColor: 'rgba(93, 103, 227, 0.3)',
              }}
            />
          </div>
          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
              {error instanceof Error
                ? error.message
                : 'Login failed. Please try again.'}
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              background: 'linear-gradient(135deg, #5d67e3 0%, #8b5cf6 100%)',
              color: 'white',
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Logging in...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Login
              </>
            )}
          </button>
          <p className="text-sm text-indigo-200 text-center">
            Don't have an account?{' '}
            <Link to="/register" className="text-cyan-400">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
