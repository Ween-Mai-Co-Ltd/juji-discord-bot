import { Hono } from 'hono'
import type { SupabaseJwtPayload } from '../types'

export const me = new Hono().get('/', (c) => {
  const payload = c.get('jwtPayload') as SupabaseJwtPayload
  return c.json({
    id: payload.sub,
    email: payload.email,
    discordId: payload.user_metadata?.provider_id,
    name: payload.user_metadata?.full_name,
    avatarUrl: payload.user_metadata?.avatar_url,
  })
})
