import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const SALT_ROUNDS = 12

// JWT Configuration
const JWT_SECRET =
  process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d' // Token expires in 7 days

export interface JWTPayload {
  userId: string
  username: string
  email: string
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Get session token from request headers/cookies
 * In TanStack Start, we can access request headers via context
 */
export function getSessionToken(request: Request): string | null {
  // Try to get from cookie
  const cookieHeader = request.headers.get('cookie')
  if (cookieHeader) {
    const cookies = parseCookies(cookieHeader)
    return cookies['session_token'] || null
  }
  return null
}

/**
 * Parse cookie string into object
 */
function parseCookies(cookieString: string): Record<string, string> {
  const cookies: Record<string, string> = {}
  cookieString.split(';').forEach((cookie) => {
    const [name, ...rest] = cookie.split('=')
    if (name && rest.length > 0) {
      cookies[name.trim()] = rest.join('=').trim()
    }
  })
  return cookies
}

/**
 * Create a secure cookie string for session token (server-side)
 * Note: HttpOnly can only be set server-side
 */
export function createSessionCookie(token: string): string {
  const isProduction = process.env.NODE_ENV === 'production'
  const secureFlag = isProduction ? '; Secure' : ''
  return `session_token=${token}; HttpOnly${secureFlag}; SameSite=Strict; Path=/; Max-Age=86400` // 24 hours
}

/**
 * Create a cookie string for client-side setting (without HttpOnly)
 * Note: This is less secure but necessary when setting from JavaScript
 */
export function createClientSessionCookie(token: string): string {
  const isProduction = process.env.NODE_ENV === 'production'
  const secureFlag = isProduction ? '; Secure' : ''
  return `session_token=${token}${secureFlag}; SameSite=Strict; Path=/; Max-Age=86400` // 24 hours
}

/**
 * Create a cookie string to clear session
 */
export function createClearSessionCookie(): string {
  return 'session_token=; Path=/; Max-Age=0'
}

/**
 * Create a signed JWT token
 * This creates a cryptographically signed token that cannot be forged
 */
export function createToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'test-app',
  })
}

/**
 * Verify and decode a JWT token
 * Returns null if token is invalid, expired, or tampered with
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    // Token is invalid, expired, or tampered with
    return null
  }
}
