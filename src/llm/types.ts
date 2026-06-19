export type AssistantAction = 'play' | 'stop' | 'skip' | 'chat' | 'reject'

export interface AssistantResult {
  action: AssistantAction
  query?: string
  reply: string
}
