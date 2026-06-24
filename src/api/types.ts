export interface SupabaseJwtPayload {
  sub: string
  email?: string
  role?: string
  aud?: string
  exp?: number
  iat?: number
  user_metadata?: {
    avatar_url?: string
    full_name?: string
    provider_id?: string
    custom_claims?: {
      global_name?: string
    }
  }
}
