# RJVALS + Discord setup

This repository keeps the RIO ESPORTES site flow untouched. RJVALS uses FACEIT as the competitive source of truth and Discord as the operational/community layer.

## Runtime secrets

Configure these values in the production runtime (never commit real values):

- `DISCORD_BOT_TOKEN`: Discord bot token.
- `DISCORD_APPLICATION_ID`: Discord application ID.
- `DISCORD_PUBLIC_KEY`: Discord application public key, used to verify slash-command interactions.
- `DISCORD_GUILD_ID`: Discord server ID where RJVALS commands are installed.
- `DISCORD_CHANNEL_ID`: Discord channel ID where RJVALS sends FACEIT match notifications.

Existing required variables remain unchanged, especially `FACEIT_SERVER_API_KEY`, `FACEIT_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL` and `FACEIT_PROCESSOR_SECRET`.

## Discord installation

The application must be installed as a normal Discord bot with the `bot` and `applications.commands` scopes. The bot needs only the permissions required to post in the RJVALS notification channel; avoid broad administrator permissions.

The Discord Interactions Endpoint URL is:

`https://rioesports.com.br/api/discord/interactions`

The endpoint verifies Discord's Ed25519 request signature using `DISCORD_PUBLIC_KEY`.

## FACEIT webhook

Configure the FACEIT webhook callback URL to the existing endpoint:

`https://rioesports.com.br/api/webhooks/faceit`

Configure the FACEIT webhook authentication as:

- Header name: `x-rioesports-webhook-secret`
- Header value: the exact value configured as `FACEIT_WEBHOOK_SECRET`

Relevant current match events include `match_object_created`, `match_status_ready`, `match_status_finished`, `match_status_cancelled`, `match_status_aborted` and `match_demo_ready`.

The processor now treats `match_status_finished` as a finished-match event and keeps the old `match_finished` spelling for backward compatibility.

## Slash commands

The first RJVALS commands are intentionally small and FACEIT-backed:

- `/partida match_id`
- `/campeonato championship_id`

After the runtime variables are configured, register the guild commands by sending an authenticated `POST` to:

`/api/internal/discord/register-commands`

Use `Authorization: Bearer <FACEIT_PROCESSOR_SECRET>`.

## Operational flow

```text
FACEIT webhook
  -> /api/webhooks/faceit
  -> faceit_webhook_events
  -> scheduled FACEIT processor
  -> FACEIT Data API
  -> RJVALS notification bridge
  -> Discord channel
```

Discord failures are intentionally best-effort: a Discord outage/configuration error must not cause a valid FACEIT event to be marked as failed.

CI validates the branch with TypeScript and ESLint before merge.
