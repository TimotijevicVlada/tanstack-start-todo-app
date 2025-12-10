import { randomBytes } from 'node:crypto'
import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import type { LoginPayload, RegisterPayload, User } from './types'
import { db } from '@/db'
import { users } from '@/db/schema'
import {
  createClientSessionCookie,
  hashPassword,
  verifyPassword,
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

// Simple in-memory session store (in production, use Redis or database)
const sessions = new Map<
  string,
  { userId: string; username: string; email: string }
>()

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

    // Create session
    const sessionToken = randomBytes(32).toString('hex')
    sessions.set(sessionToken, {
      userId: newUser.id,
      username: newUser.username,
      email: newUser.email,
    })

    // Return cookie string for client-side setting
    // Note: In production, you'd want to set HttpOnly cookies server-side
    const cookie = createClientSessionCookie(sessionToken)

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

      // Create session
      const sessionToken = randomBytes(32).toString('hex')
      sessions.set(sessionToken, {
        userId: user.id,
        username: user.username,
        email: user.email,
      })

      // Return cookie string for client-side setting
      // Note: In production, you'd want to set HttpOnly cookies server-side
      const cookie = createClientSessionCookie(sessionToken)

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
}).handler((ctx) => {
  const cookieHeader = ctx.context.request.headers.get('cookie')
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce(
      (acc, cookie) => {
        const [name, value] = cookie.split('=')
        if (name && value) {
          acc[name.trim()] = value.trim()
        }
        return acc
      },
      {} as Record<string, string>,
    )

    const sessionToken = cookies['session_token']
    if (sessionToken) {
      sessions.delete(sessionToken)
    }
  }

  return { cookie: 'session_token=; Path=/; Max-Age=0' }
})

export const getCurrentUser = createServerFn({
  method: 'GET',
}).handler(async ({ request }): Promise<User | null> => {
  // Check if request context is available
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) {
    return null
  }

  console.log('cookieHeader', cookieHeader)

  const cookies = cookieHeader.split(';').reduce(
    (acc, cookie) => {
      const [name, value] = cookie.split('=')
      if (name && value) {
        acc[name.trim()] = value.trim()
      }
      return acc
    },
    {} as Record<string, string>,
  )

  const sessionToken = cookies['session_token']
  if (!sessionToken) {
    return null
  }

  const session = sessions.get(sessionToken)
  if (!session) {
    return null
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  })

  if (!user) {
    sessions.delete(sessionToken)
    return null
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
  }
})
