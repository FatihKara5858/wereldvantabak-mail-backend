# wereldvantabak-mail-backend

Minimal, production-ready backend API for a SwiftUI iOS app. Deploy as a Vercel Serverless Function (no frontend).

## Endpoint

**POST** `/api/send`

Request JSON:

```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "items": ["array", "of", "strings"],
  "note": "optional string"
}
```

Response JSON:

- `200 {"success": true}` when email was queued successfully
- `4xx/5xx {"success": false}` on validation or server errors

Only `POST` is allowed (405 otherwise).

## Environment variables

- `TARGET_EMAIL` – recipient address (required)
- `RESEND_API_KEY` – Resend API key (required)
- `FROM_EMAIL` – optional sender address (defaults to `TARGET_EMAIL`)

Configure env vars in Vercel project settings; **do not commit secrets**.
