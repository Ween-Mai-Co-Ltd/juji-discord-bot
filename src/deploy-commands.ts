import { REST, Routes } from 'discord.js'
import type { Command } from './types/command'
import { clientId, token } from './config'

const commands: unknown[] = []

const glob = new Bun.Glob('*.ts')
for await (const file of glob.scan(`${import.meta.dir}/commands`)) {
  const command = ((await import(`./commands/${file}`)) as { default: Command }).default
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON())
  } else {
    console.warn(`[WARNING] The command at ./commands/${file} is missing "data" or "execute".`)
  }
}

const rest = new REST().setToken(token)

console.log(`Refreshing ${commands.length} application (/) commands...`)

const data = await rest.put(Routes.applicationCommands(clientId), {
  body: commands,
})

console.log(`Successfully reloaded ${(data as unknown[]).length} application (/) commands.`)
