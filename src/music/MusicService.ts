import type { VoiceBasedChannel } from 'discord.js'
import { MusicManager, musicManager } from './MusicManager'
import { toTrack } from './lavalink'
import type { Track } from '../types/track'

export type PlayResult =
  | { ok: true; track: Track; startedNow: boolean; position: number }
  | { ok: false; reason: 'live-unsupported' }

export class MusicService {
  constructor(private readonly manager: MusicManager) {}

  async playFromQuery(
    channel: VoiceBasedChannel,
    query: string,
    onResolved?: (track: Track) => void | Promise<void>,
  ): Promise<PlayResult> {
    const player = await this.manager.getOrCreatePlayer(channel)

    const result = await player.search({ query }, undefined)
    const first = result.tracks[0]
    if (result.loadType === 'error' || result.loadType === 'empty' || !first) {
      throw new Error(`No results found for: ${query}`)
    }

    const track = toTrack(first)
    if (track.isLive) {
      // Don't leave a freshly-joined, idle player hanging just to reject a live track.
      if (!player.queue.current) await player.destroy()
      return { ok: false, reason: 'live-unsupported' }
    }

    await onResolved?.(track)

    const startedNow = !player.queue.current
    await player.queue.add(first)
    if (startedNow) await player.play()

    const position = startedNow ? 0 : player.queue.tracks.length
    return { ok: true, track, startedNow, position }
  }

  stop(guildId: string): Promise<boolean> {
    return this.manager.stop(guildId)
  }

  skip(guildId: string): Promise<{ skipped: Track; next: Track | null } | null> {
    return this.manager.skip(guildId)
  }
}

export const musicService = new MusicService(musicManager)
