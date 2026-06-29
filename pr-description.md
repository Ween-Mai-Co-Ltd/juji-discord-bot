# Remove LLM/Ollama chat feature

## Summary

- Remove the entire Ollama-based chat assistant (`@mention` replies + natural-language music control)
- Delete `src/llm/` domain module (OllamaClient, Assistant, SerialQueue, system prompt, types)
- Delete `src/events/messageCreate.ts` event handler (sole consumer of the LLM domain)
- Delete `src/config/llm.ts` and its 6 env vars (`OLLAMA_HOST`, `OLLAMA_MODEL`, `OLLAMA_NUM_CTX`, `LLM_TIMEOUT_MS`, `LLM_MAX_INPUT_CHARS`, `LLM_ENABLED`)
- Remove `ollama` Docker service, its volume (`ollama_models`), and dependency from both compose files
- Remove LLM env vars from the CI deploy workflow's `.env` write step
- Remove `GatewayIntentBits.GuildMessages` (was only needed for the chat handler)
- Remove `'chat'` from the `RequestSource` analytics type (existing DB rows are unaffected)
- Update README and CLAUDE.md to remove all LLM documentation

## Motivation

The LLM chat feature is being removed to simplify the stack and reduce resource usage on the deployment host (no more Ollama container or model downloads).

## Test plan

- [ ] `bun run lint` passes with no import errors
- [ ] `bun run format:check` passes
- [ ] `docker compose config` parses without errors (no dangling ollama references)
- [ ] `grep -r 'ollama\|llm\|SerialQueue\|system-prompt' src/` returns zero hits
- [ ] Bot starts and responds to `/play`, `/skip`, `/stop` slash commands normally
- [ ] Bot no longer responds to `@mention` messages in text channels
