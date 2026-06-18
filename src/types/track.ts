import type { Readable } from 'node:stream'

export interface Track {
  id: string
  title: string
  url: string
  thumbnail?: string
  durationSec: number
  isLive: boolean
}

export type PlaybackSource =
  | { kind: 'file'; filePath: string }
  | { kind: 'stream'; open: () => Promise<Readable> }

export interface QueuedTrack {
  track: Track
  source: PlaybackSource
}
