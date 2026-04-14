# Stars

Account credentials management API backed by Cloudflare D1.

## API

All endpoints require authentication via `Authorization: Bearer <API_KEY>` header.

### Query accounts

```
GET /api/accounts?type=cloudflare
```

**Response:**

```json
{
  "type": "cloudflare",
  "count": 4022,
  "accounts": [
    {
      "account_id": "c10bf0752609a417a695ccea3ef91429",
      "email": "RebeccaHall920@vibelab.uk",
      "password": "rAJLJYHr7V$V7lV9",
      "api_key": "84bc78c9e6c9ddc2928f1e671b6eaf008047a"
    }
  ]
}
```

### Add accounts

```
POST /api/accounts
Content-Type: application/json
```

**Single account:**

```json
{
  "type": "cloudflare",
  "account_id": "abc123",
  "email": "user@example.com",
  "password": "optional-password",
  "api_key": "your-api-key"
}
```

**Batch (array):**

```json
[
  {
    "type": "cloudflare",
    "account_id": "abc123",
    "email": "user1@example.com",
    "password": "pwd1",
    "api_key": "key1"
  },
  {
    "type": "cloudflare",
    "account_id": "def456",
    "email": "user2@example.com",
    "password": "pwd2",
    "api_key": "key2"
  }
]
```

**Required fields:** `type`, `account_id`, `email`, `api_key`

**Optional fields:** `password`

**Response:**

```json
{
  "success": true,
  "inserted": 1
}
```

## Deployment

```bash
wrangler deploy
```
