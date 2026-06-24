import type { VoiceBasedChannel } from 'discord.js'
import type { Player } from 'lavalink-client'
import { lavalink, toTrack } from './lavalink'
import type { Track } from '../types/track'

export class MusicManager {
  async getOrCreatePlayer(channel: VoiceBasedChannel): Promise<Player> {
    const existing = lavalink.getPlayer(channel.guild.id)
    if (existing) return existing

    const player = lavalink.createPlayer({
      guildId: channel.guild.id,
      voiceChannelId: channel.id,
      selfDeaf: true,
    })
    await player.connect()
    return player
  }

  async stop(guildId: string): Promise<boolean> {
    const player = lavalink.getPlayer(guildId)
    if (!player) return false
    await player.destroy()
    return true
  }

  async skip(guildId: string): Promise<{ skipped: Track; next: Track | null } | null> {
    const player = lavalink.getPlayer(guildId)
    if (!player?.queue.current) return null

    const skipped = toTrack(player.queue.current)
    const upcoming = player.queue.tracks[0]
    const next = upcoming ? toTrack(upcoming) : null

    if (next) {
      await player.skip()
    } else {
      await player.destroy()
    }
    return { skipped, next }
  }

  snapshot(guildId: string): { current: Track | null; upcoming: Track[] } | null {
    const player = lavalink.getPlayer(guildId)
    if (!player) return null
    return {
      current: player.queue.current ? toTrack(player.queue.current) : null,
      upcoming: player.queue.tracks.map(toTrack),
    }
  }
}

export const musicManager = new MusicManager()
