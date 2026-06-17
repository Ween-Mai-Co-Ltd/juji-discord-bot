import { llmEnabled, llmTimeoutMs, ollamaHost, ollamaModel, ollamaNumCtx } from '../config'
import { SerialQueue } from './SerialQueue'

interface ChatRequest {
  system: string
  user: string
  format?: unknown
  numPredict?: number
}

interface OllamaChatResponse {
  message?: { content?: string }
}

interface OllamaTagsResponse {
  models?: { name?: string }[]
}

const WARMUP_MAX_ATTEMPTS = 30
const WARMUP_RETRY_MS = 5_000
const KEEP_ALIVE = '10m'
const DEFAULT_NUM_PREDICT = 512
const TEMPERATURE = 0.4

export class OllamaClient {
  private readonly queue = new SerialQueue()

  constructor(
    private readonly host: string,
    private readonly model: string,
    private readonly timeoutMs: number,
    private readonly numCtx: number,
  ) {}

  get queueSize(): number {
    return this.queue.size
  }

  chat(request: ChatRequest): Promise<string> {
    return this.queue.run(() => this.generate(request))
  }

  private async generate(request: ChatRequest): Promise<string> {
    const controller = new AbortController()
    const timer = setTimeout(() => {
      controller.abort()
    }, this.timeoutMs)

    try {
      const response = await fetch(`${this.host}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.model,
          stream: false,
          keep_alive: KEEP_ALIVE,
          format: request.format,
          options: {
            num_predict: request.numPredict ?? DEFAULT_NUM_PREDICT,
            num_ctx: this.numCtx,
            temperature: TEMPERATURE,
          },
          messages: [
            { role: 'system', content: request.system },
            { role: 'user', content: request.user },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama /api/chat responded with ${response.status}`)
      }

      const data = (await response.json()) as OllamaChatResponse
      return data.message?.content ?? ''
    } finally {
      clearTimeout(timer)
    }
  }

  warmup(): void {
    if (!llmEnabled) return
    void this.ensureModel()
  }

  private async ensureModel(): Promise<void> {
    for (let attempt = 1; attempt <= WARMUP_MAX_ATTEMPTS; attempt += 1) {
      try {
        if (await this.hasModel()) {
          console.log(`[llm] model ${this.model} is available (loads into memory on first message)`)
          return
        }
        console.log(`[llm] pulling model ${this.model}… (this can take a while)`)
        await this.pullModel()
        console.log(`[llm] model ${this.model} pulled (loads into memory on first message)`)
        return
      } catch (error) {
        console.warn(`[llm] warmup attempt ${attempt}/${WARMUP_MAX_ATTEMPTS} failed:`, error)
        await delay(WARMUP_RETRY_MS)
      }
    }
    console.error(`[llm] could not prepare model ${this.model}; chat will be unavailable`)
  }

  private async hasModel(): Promise<boolean> {
    const response = await fetch(`${this.host}/api/tags`)
    if (!response.ok) {
      throw new Error(`Ollama /api/tags responded with ${response.status}`)
    }
    const data = (await response.json()) as OllamaTagsResponse
    return (data.models ?? []).some(
      (entry) => entry.name === this.model || (entry.name?.startsWith(`${this.model}:`) ?? false),
    )
  }

  private async pullModel(): Promise<void> {
    const response = await fetch(`${this.host}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.model, stream: false }),
    })
    if (!response.ok) {
      throw new Error(`Ollama /api/pull responded with ${response.status}`)
    }
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export const ollamaClient = new OllamaClient(ollamaHost, ollamaModel, llmTimeoutMs, ollamaNumCtx)
