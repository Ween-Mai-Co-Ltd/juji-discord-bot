import { requireEnv } from '.'

export const supabaseJwtSecret = requireEnv('SUPABASE_JWT_SECRET')
