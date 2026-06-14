import { Client, Collection, GatewayIntentBits } from 'discord.js'
import { token } from './config'
import type { Command } from './types/command'
import type { Event } from './types/event'

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

client.commands = new Collection()
client.cooldowns = new Collection()

const glob = new Bun.Glob('*.ts')

for await (const file of glob.scan(`${import.meta.dir}/commands`)) {
  const command = ((await import(`./commands/${file}`)) as { default: Command }).default
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command)
  } else {
    console.warn(`[WARNING] The command at ./commands/${file} is missing "data" or "execute".`)
  }
}

for await (const file of glob.scan(`${import.meta.dir}/events`)) {
  const event = ((await import(`./events/${file}`)) as { default: Event }).default
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args))
  } else {
    client.on(event.name, (...args) => event.execute(...args))
  }
}

client.login(token)
