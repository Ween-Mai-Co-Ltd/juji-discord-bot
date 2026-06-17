import type { VoiceBasedChannel } from 'discord.js'
import { MusicManager, musicManager } from './MusicManager'
import { YtDlpService, ytDlpService } from './YtDlpService'
import type { Track } from '../types/track'

export interface PlayResult {
  track: Track
  startedNow: boolean
  position: number
}

export class MusicService {
  constructor(
    private readonly ytDlp: YtDlpService,
    private readonly manager: MusicManager,
  ) {}

  async playFromQuery(
    channel: VoiceBasedChannel,
    query: string,
    onResolved?: (track: Track) => void | Promise<void>,
  ): Promise<PlayResult> {
    const track = await this.ytDlp.resolveTrack(query)
    await onResolved?.(track)
    const filePath = await this.ytDlp.downloadTrack(track)
    const { startedNow, position } = this.manager.enqueue(channel, { track, filePath })
    return { track, startedNow, position }
  }

  stop(guildId: string): boolean {
    return this.manager.stop(guildId)
  }
}

export const musicService = new MusicService(ytDlpService, musicManager)
