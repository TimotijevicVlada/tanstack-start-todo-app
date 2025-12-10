import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type { LoginPayload, RegisterPayload } from './types'
import { loginUser, registerUser } from '@/api/users/server-fn'

export const useLogin = (redirectTo?: string) => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (data: LoginPayload) => {
      const result = await loginUser({ data })

      // Set cookie on client side
      if (result.cookie) {
        document.cookie = result.cookie
      }

      return result
    },
    onSuccess: () => {
      navigate({ to: redirectTo || '/' })
    },
    onError: (error) => {
      console.error('Login failed:', error.message)
    },
  })
}

export const useRegister = () => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (data: RegisterPayload) => {
      const result = await registerUser({ data })

      // Set cookie on client side
      if (result.cookie) {
        document.cookie = result.cookie
      }

      return result
    },
    onSuccess: () => {
      navigate({ to: '/' })
    },
    onError: (error) => {
      console.error('Registration failed:', error.message)
    },
  })
}
