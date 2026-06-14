import { requireEnv } from '.'

export const token = requireEnv('DISCORD_TOKEN')
export const clientId = requireEnv('DISCORD_CLIENT_ID')
