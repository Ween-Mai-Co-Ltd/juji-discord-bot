import { startApi } from './api'
import { startBot } from './bot'
import { ollamaClient } from './llm/OllamaClient'

ollamaClient.warmup()
startApi()
await startBot()
