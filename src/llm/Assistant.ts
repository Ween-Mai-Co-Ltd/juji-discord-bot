import { OllamaClient, ollamaClient } from './OllamaClient'
import type { AssistantAction, AssistantResult } from './types'
import systemPromptText from './system-prompt.txt' with { type: 'text' }

const SYSTEM_PROMPT = systemPromptText.trim()

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    action: { type: 'string', enum: ['play', 'stop', 'skip', 'chat', 'reject'] },
    query: { type: 'string' },
    reply: { type: 'string' },
  },
  required: ['action', 'query', 'reply'],
}

const NUM_PREDICT = 512
const MAX_REPLY_CHARS = 1900
const ACTIONS: readonly AssistantAction[] = ['play', 'stop', 'skip', 'chat', 'reject']

const FALLBACK: AssistantResult = {
  action: 'reject',
  reply: "Sorry, I didn't catch that. I can chat, or play, skip, and stop music — try again.",
}

export class Assistant {
  constructor(private readonly client: OllamaClient) {}

  async ask(prompt: string): Promise<AssistantResult> {
    const content = await this.client.chat({
      system: SYSTEM_PROMPT,
      user: prompt,
      format: RESPONSE_SCHEMA,
      numPredict: NUM_PREDICT,
    })
    return parseResult(content)
  }
}

function isAction(value: unknown): value is AssistantAction {
  return typeof value === 'string' && (ACTIONS as readonly string[]).includes(value)
}

function parseResult(content: string): AssistantResult {
  if (content.trim().length === 0) return FALLBACK

  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  } catch {
    return FALLBACK
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('action' in parsed) ||
    !isAction(parsed.action) ||
    !('reply' in parsed) ||
    typeof parsed.reply !== 'string'
  ) {
    return FALLBACK
  }

  const action: AssistantAction = parsed.action
  const reply = parsed.reply.trim().slice(0, MAX_REPLY_CHARS)

  if (action === 'play') {
    const query = 'query' in parsed && typeof parsed.query === 'string' ? parsed.query.trim() : ''
    if (query.length === 0) {
      return { action: 'chat', reply: 'What would you like me to play?' }
    }
    return { action: 'play', query, reply: reply.length === 0 ? `Playing ${query} 🎵` : reply }
  }

  return { action, reply: reply.length === 0 ? defaultReply(action) : reply }
}

function defaultReply(action: Exclude<AssistantAction, 'play'>): string {
  switch (action) {
    case 'stop':
      return '⏹️ Stopping the music.'
    case 'skip':
      return '⏭️ ข้ามเพลงให้แล้วนะครับ'
    case 'chat':
      return '🙂'
    case 'reject':
      return 'Sorry, I can only chat or control music.'
  }
}

export const assistant = new Assistant(ollamaClient)
