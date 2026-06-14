import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Collection,
  type SlashCommandOptionsOnlyBuilder,
} from 'discord.js'

export interface Command {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder
  cooldown?: number
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>
}

declare module 'discord.js' {
  interface Client {
    commands: Collection<string, Command>
  }
}
