import type { Collection } from 'discord.js'
import type { Command } from './command'

declare module 'discord.js' {
  interface Client {
    commands: Collection<string, Command>
    cooldowns: Collection<string, Collection<string, number>>
  }
}
