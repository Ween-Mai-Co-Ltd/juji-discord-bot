# juji-discord-bot

A Discord bot built with [discord.js](https://discord.js.org) v14, running on the [Bun](https://bun.com) runtime. Commands and events are loaded automatically from the filesystem, so adding new functionality is just a matter of dropping a file in the right folder.

## Prerequisites

- [Bun](https://bun.com) installed
- A Discord application with a bot token ([Discord Developer Portal](https://discord.com/developers/applications))

## Setup

1. Install dependencies:

   ```sh
   bun install
   ```

2. Create a `.env` file in the project root with your bot credentials:

   ```sh
   DISCORD_TOKEN=your-bot-token
   DISCORD_CLIENT_ID=your-application-client-id
   ```

3. Register the slash commands with Discord:

   ```sh
   bun run deploy
   ```

4. Start the bot:

   ```sh
   bun run start
   ```

## Scripts

| Command                | Description                                                              |
| ---------------------- | ------------------------------------------------------------------------ |
| `bun run start`        | Start the bot.                                                           |
| `bun run deploy`       | Register/refresh slash commands with Discord's API.                      |
| `bun run lint`         | Lint `src/` with ESLint.                                                 |
| `bun run format`       | Format `src/` with Prettier.                                            |
| `bun run format:check` | Check formatting without writing changes.                                |

> Re-run `bun run deploy` whenever you change a command's name, description, or options.

## Project structure

```
src/
├── index.ts              # Entry point — loads commands & events, logs in
├── deploy-commands.ts    # Registers slash commands with Discord
├── commands/             # Slash commands (one file each)
├── events/               # Gateway event handlers (one file each)
├── config/               # Env var loading & validation
└── types/                # Shared TypeScript types & Client augmentation
```

### Adding a command

Create a file in `src/commands/` that default-exports a `Command`:

```ts
import { SlashCommandBuilder } from 'discord.js'
import type { Command } from '../types/command'

const hello: Command = {
  data: new SlashCommandBuilder().setName('hello').setDescription('Say hello'),
  cooldown: 5, // optional, in seconds (defaults to 3)
  async execute(interaction) {
    await interaction.reply('Hello!')
  },
}

export default hello
```

Then run `bun run deploy` to register it. The bot picks it up automatically on the next start — there is no central registry to edit. Per-user cooldowns and error handling are applied centrally in `src/events/interactionCreate.ts`.

### Adding an event

Create a file in `src/events/` that default-exports an `Event` bound to a Discord gateway event:

```ts
import { Events } from 'discord.js'
import type { Event } from '../types/event'

export default {
  name: Events.GuildCreate,
  once: false, // true to handle only the first occurrence
  execute(guild) {
    console.log(`Joined ${guild.name}`)
  },
} satisfies Event<typeof Events.GuildCreate>
```

Events relying on intents beyond `Guilds` (e.g. message content or members) also require adding the intent in `src/index.ts`.
