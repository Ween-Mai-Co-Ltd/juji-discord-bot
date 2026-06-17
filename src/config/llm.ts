export const ollamaHost = Bun.env.OLLAMA_HOST ?? 'http://ollama:11434'

export const ollamaModel = Bun.env.OLLAMA_MODEL ?? 'gemma4:e2b'

export const llmTimeoutMs = Number(Bun.env.LLM_TIMEOUT_MS ?? 120_000)

export const llmMaxInputChars = Number(Bun.env.LLM_MAX_INPUT_CHARS ?? 1_000)

export const ollamaNumCtx = Number(Bun.env.OLLAMA_NUM_CTX ?? 4_096)

export const llmEnabled = (Bun.env.LLM_ENABLED ?? 'true').toLowerCase() !== 'false'
