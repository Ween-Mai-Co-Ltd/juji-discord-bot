export type AssistantAction = 'play' | 'stop' | 'chat' | 'reject'

export interface AssistantResult {
  action: AssistantAction
  query?: string
  reply: string
}
