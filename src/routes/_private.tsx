import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import Header from '@/components/Header'
import { getCurrentUser } from '@/api/users/server-fn'

export const Route = createFileRoute('/_private')({
  component: PrivateLayout,
  beforeLoad: async ({ location }) => {
    try {
      const user = await getCurrentUser()

      if (!user) {
        throw redirect({
          to: '/login',
          search: {
            redirect: location.href,
          },
        })
      }

      return { user }
    } catch (error) {
      // If it's a redirect, re-throw it
      if (error && typeof error === 'object' && 'to' in error) {
        throw error
      }
      // Otherwise, redirect to login
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }
  },
})

function PrivateLayout() {
  return (
    <div
      className="min-h-screen text-white"
      style={{
        background:
          'linear-gradient(135deg, #0c1a2b 0%, #1a2332 50%, #16202e 100%)',
      }}
    >
      <Header />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <Outlet />
      </div>
    </div>
  )
}
