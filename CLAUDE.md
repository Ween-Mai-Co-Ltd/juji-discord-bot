# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Runtime & Commands

This project runs on **Bun** (not Node). It uses Bun-specific APIs (`Bun.Glob`, `Bun.env`, `import.meta.dir`), so commands must be run with `bun`.

- `bun run start` — start the bot (`src/index.ts`)
- `bun run deploy` — register slash commands with Discord's API (`src/deploy-commands.ts`); run this whenever a command's `data` definition changes
- `bun run lint` — ESLint over `src/`
- `bun run format` / `bun run format:check` — Prettier write / check

There is no test setup. Lint config uses typescript-eslint `strict` + `stylistic`; Prettier enforces no semicolons, single quotes, trailing commas, 100-char width.

Required env vars (read via `requireEnv`, which throws if missing): `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`.

## Architecture

A Discord bot built on discord.js v14 with a convention-based loader.

- **Dynamic loading**: [src/index.ts](src/index.ts) uses `Bun.Glob` to scan `src/commands/` and `src/events/` at startup, importing each file's `default` export. Adding a feature means dropping a new file in the right directory — no central registry to update. The same glob scan is duplicated in [src/deploy-commands.ts](src/deploy-commands.ts) for command registration.

- **Commands** ([src/commands/](src/commands/)): each default-exports a `Command` ([src/types/command.ts](src/types/command.ts)) — a `data` (SlashCommandBuilder), an `execute(interaction)`, and an optional `cooldown` (seconds). Commands are keyed by `data.name` into `client.commands`.

- **Events** ([src/events/](src/events/)): each default-exports an `Event<K>` ([src/types/event.ts](src/types/event.ts)) bound to a `ClientEvents` key, with `once?` controlling `client.once` vs `client.on`. Use `satisfies Event<typeof Events.X>` so `execute` args are typed from the event name.

- **Command dispatch & cooldowns**: [src/events/interactionCreate.ts](src/events/interactionCreate.ts) is the router — it looks up the command, enforces per-user/per-command cooldowns (default 3s, stored in `client.cooldowns`), runs `execute`, and handles errors centrally. Individual commands do not manage cooldowns or top-level error handling themselves.

- **Client augmentation**: `client.commands` and `client.cooldowns` are added to discord.js's `Client` via `declare module 'discord.js'` in [src/types/discord.ts](src/types/discord.ts) and [src/types/command.ts](src/types/command.ts).

- **Config** ([src/config/](src/config/)): `requireEnv` validates env vars; `src/config/index.ts` re-exports everything from `discord.ts`, so import tokens via `from './config'`.

## Conventions

- Only `GatewayIntentBits.Guilds` is enabled. New event handlers relying on other intents (e.g. message content, members) require adding the intent in `src/index.ts`.
- Use `MessageFlags.Ephemeral` (not the deprecated `ephemeral: true`) for new ephemeral replies — see [src/commands/ping.ts](src/commands/ping.ts).
