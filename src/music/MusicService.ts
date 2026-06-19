import type { VoiceBasedChannel } from 'discord.js'
import { MusicManager, musicManager } from './MusicManager'
import { YtDlpService, ytDlpService } from './YtDlpService'
import { streamThresholdSec } from '../config'
import type { PlaybackSource, Track } from '../types/track'

export type PlayResult =
  | { ok: true; track: Track; startedNow: boolean; position: number }
  | { ok: false; reason: 'live-unsupported' }

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
    if (track.isLive) {
      return { ok: false, reason: 'live-unsupported' }
    }

    await onResolved?.(track)

    const source: PlaybackSource =
      track.durationSec > streamThresholdSec
        ? { kind: 'stream', open: () => this.ytDlp.streamTrack(track) }
        : { kind: 'file', filePath: await this.ytDlp.downloadTrack(track) }

    const { startedNow, position } = this.manager.enqueue(channel, { track, source })
    return { ok: true, track, startedNow, position }
  }

  stop(guildId: string): boolean {
    return this.manager.stop(guildId)
  }

  skip(guildId: string): { skipped: Track; next: Track | null } | null {
    return this.manager.skip(guildId)
  }
}

export const musicService = new MusicService(ytDlpService, musicManager)
