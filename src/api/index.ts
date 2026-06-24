import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { apiPort, corsOrigins } from '../config'
import { authMiddleware } from './middleware/auth'
import { health } from './routes/health'
import { me } from './routes/me'

const app = new Hono()
  .use(logger())
  .use('*', cors({ origin: corsOrigins }))
  .route('/health', health)
  .use('/api/*', authMiddleware)
  .route('/api/me', me)

export function startApi(): void {
  Bun.serve({ port: apiPort, fetch: app.fetch })
  console.log(`API listening on port ${apiPort}`)
}
