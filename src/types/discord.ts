import type { Collection, GatewayDispatchPayload } from 'discord.js'
import type { Command } from './command'

declare module 'discord.js' {
  interface Client {
    commands: Collection<string, Command>
    cooldowns: Collection<string, Collection<string, number>>
  }

  interface ClientEvents {
    raw: [packet: GatewayDispatchPayload]
  }
}
