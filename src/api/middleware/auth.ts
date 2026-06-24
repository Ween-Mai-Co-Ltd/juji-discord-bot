import { jwt } from 'hono/jwt'
import { supabaseJwtSecret } from '../../config'

export const authMiddleware = jwt({ secret: supabaseJwtSecret, alg: 'HS256' })
