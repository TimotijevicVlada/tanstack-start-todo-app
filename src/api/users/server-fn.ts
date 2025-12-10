import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import type { LoginPayload, RegisterPayload, User } from './types'
import { db } from '@/db'
import { users } from '@/db/schema'
import {
  createClientSessionCookie,
  createToken,
  hashPassword,
  verifyPassword,
  verifyToken,
} from '@/lib/auth'

// Augment the Register interface to include request in server context
declare module '@tanstack/react-start' {
  interface Register {
    server: {
      requestContext: {
        request: Request
      }
    }
  }
}

// JWT tokens are stateless - no need for server-side session storage

export const registerUser = createServerFn({
  method: 'POST',
})
  .inputValidator((data: RegisterPayload) => data)
  .handler(async ({ data }) => {
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    })

    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    const existingUsername = await db.query.users.findFirst({
      where: eq(users.username, data.username),
    })

    if (existingUsername) {
      throw new Error('Username already taken')
    }

    // Hash password
    const passwordHash = await hashPassword(data.password)

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        username: data.username,
        email: data.email,
        passwordHash,
      })
      .returning()

    // Create JWT token (cryptographically signed - cannot be forged)
    const token = createToken({
      userId: newUser.id,
      username: newUser.username,
      email: newUser.email,
    })

    // Return cookie string for client-side setting
    // Note: In production, you'd want to set HttpOnly cookies server-side
    const cookie = createClientSessionCookie(token)

    return {
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
      cookie,
    }
  })

export const loginUser = createServerFn({
  method: 'POST',
})
  .inputValidator((data: LoginPayload) => data)
  .handler(async ({ data }) => {
    try {
      // Find user by email
      const user = await db.query.users.findFirst({
        where: eq(users.email, data.email),
      })

      if (!user) {
        throw new Error('Invalid email or password')
      }

      // Verify password
      const isValid = await verifyPassword(data.password, user.passwordHash)

      if (!isValid) {
        throw new Error('Invalid email or password')
      }

      // Create JWT token (cryptographically signed - cannot be forged)
      const token = createToken({
        userId: user.id,
        username: user.username,
        email: user.email,
      })

      // Return cookie string for client-side setting
      // Note: In production, you'd want to set HttpOnly cookies server-side
      const cookie = createClientSessionCookie(token)

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
        },
        cookie,
      }
    } catch (error) {
      // Log the error for debugging
      console.error('Login error:', error)
      // Re-throw with a more user-friendly message if it's not already an Error
      if (error instanceof Error) {
        throw error
      }
      throw new Error('An error occurred during login. Please try again.')
    }
  })

export const logoutUser = createServerFn({
  method: 'POST',
}).handler(() => {
  // With JWT, we don't need to delete from server-side storage
  // Just clear the cookie - the token will be invalid on client side
  return { cookie: 'session_token=; Path=/; Max-Age=0' }
})

export const getCurrentUser = createServerFn({
  method: 'GET',
}).handler(async (ctx): Promise<User | null> => {
  // Get token from cookies
  // TypeScript types may not reflect runtime behavior - request is available at runtime
  const request = (ctx as any).request || ctx.context.request
  if (!request) {
    return null
  }

  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) {
    return null
  }

  const cookies = cookieHeader.split(';').reduce(
    (acc: Record<string, string>, cookie: string) => {
      const [name, value] = cookie.split('=')
      if (name && value) {
        acc[name.trim()] = value.trim()
      }
      return acc
    },
    {} as Record<string, string>,
  )

  const token = cookies['session_token']
  if (!token) {
    return null
  }

  // Verify JWT token - this ensures it's not fake, expired, or tampered with
  const payload = verifyToken(token)
  if (!payload) {
    // Token is invalid, expired, or tampered with
    return null
  }

  // Get user from database to ensure they still exist
  const user = await db.query.users.findFirst({
    where: eq(users.id, payload.userId),
  })

  if (!user) {
    // User was deleted but token is still valid - return null
    return null
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
  }
})
