# Stars - Account Credentials Management API

## Overview

Cloudflare Worker + D1 backed REST API for managing account credentials (e.g. Cloudflare accounts). Deployed at `stars.vibelab.uk`.

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Auth**: Bearer token (API_KEY stored as Cloudflare secret)

## Project Structure

```
src/index.js     # Worker entry point, all API handlers
wrangler.toml    # Cloudflare Worker configuration
```

## D1 Schema

Table `accounts`:
- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `type` TEXT NOT NULL (e.g. "cloudflare")
- `account_id` TEXT NOT NULL
- `email` TEXT NOT NULL
- `password` TEXT DEFAULT ''
- `api_key` TEXT NOT NULL
- `created_at` TEXT DEFAULT datetime('now')
- Index on `type`

## Deployment

```bash
wrangler deploy
```

## Environment Variables

- `API_KEY`: Bearer token for API authentication (Cloudflare secret, set via `wrangler secret put API_KEY`)
- `DB`: D1 database binding (configured in wrangler.toml)
