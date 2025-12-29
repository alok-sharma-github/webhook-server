# Vira AI Webhook

Express 5 backend for handling AI voice agent webhooks (lookup users, create leads, raise tickets) backed by MongoDB.

## Prerequisites

- Node.js 18+ (ES Modules enabled)
- A MongoDB Atlas cluster or reachable MongoDB instance
- A webhook signing secret (for HMAC verification)

## Quick Start

```powershell
# From the repo root
git clone <your-repo-url>
cd vira-ai-webhook
npm install

# Create .env and start in dev
copy .env.example .env  # If you have one; otherwise create .env
npm run dev
# Open http://localhost:3000/health
```

## Configuration

Set the following environment variables in a `.env` file at the repo root:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster/<db>?retryWrites=true&w=majority

# Webhook verification
WEBHOOK_SECRET=replace-with-your-hmac-secret
```

Notes:
- `MONGODB_URI` is required. The server exits if it cannot connect.
- `WEBHOOK_SECRET` is required for signature verification in production (`NODE_ENV=production`).

## Scripts

```powershell
npm run dev     # Start with nodemon (auto-reload)
npm start       # Start with node
npm test        # Placeholder (no tests yet)
```

## API

- Health: `GET /health`
	- Returns `{ status: "ok", timestamp: "..." }`.

- Webhook: `POST /webhook/dth/`
	- Headers: `x-signature: <hex hmac-sha256(rawBody, WEBHOOK_SECRET)>`
	- Body (example):
		```json
		{
			"tool_name": "lookup_user",
			"parameters": {
				"phone": "+919000000001",
				"name": "Aarav"
			},
			"caller_phone": "+919000000001"
		}
		```
	- Supported `tool_name` values:
		- `lookup_user` → Finds a user by phone; returns plan/status and a friendly message. Uses a short-lived cache.
		- `create_lead` → Creates a lead with `name`, `phone`, `email`, `interest`.
		- `raise_ticket` → Creates a support ticket with `name`, `phone`, `issue`.

### Signature Verification

In production, requests are verified using HMAC-SHA256 of the raw body with `WEBHOOK_SECRET`:

```js
const expected = crypto
	.createHmac('sha256', WEBHOOK_SECRET)
	.update(rawBody)
	.digest('hex');
// Compare to header: x-signature
```

If `x-signature` is missing/invalid, the server returns `401`.

## Data Model

- Users: name, phone (unique), email, plan, `expiryDate`, `balance`, `status`.
- Leads: name, phone, email, interest, `createdAt`.
- Tickets: name, phone, issue, `status` (default `open`), `createdAt`.

All collections have indexes on fields used for lookups to reduce first-hit latency.

## Seeding Sample Users

You can seed synthetic users for testing:

```powershell
# Requires MONGODB_URI in .env
node scripts/createUsers.js
```

This inserts ~10 users with Indian phone numbers like `+91xxxxxxxxxx`.

## Project Structure

- [src/index.js](src/index.js): Server bootstrap, middleware, routes
- [src/config/db.js](src/config/db.js): MongoDB connection and index initialization
- [src/routes/webhook.js](src/routes/webhook.js): `POST /webhook/dth` route
- [src/middleware/verifyWebhook.js](src/middleware/verifyWebhook.js): HMAC verification of incoming requests
- [src/controllers/webhookController.js](src/controllers/webhookController.js): Business logic for tools
- [src/models/User.js](src/models/User.js), [src/models/Lead.js](src/models/Lead.js), [src/models/Ticket.js](src/models/Ticket.js): Mongoose models
- [src/utils/cache.js](src/utils/cache.js): Small in-memory cache for hot callers
- [scripts/createUsers.js](scripts/createUsers.js): Seeder script

## Deployment Notes

- Set `NODE_ENV=production` and ensure `WEBHOOK_SECRET` is configured.
- Keep your MongoDB connection string secure (use secrets manager).
- App sets `keepAliveTimeout` and `headersTimeout` to reduce timeouts under load.

## Troubleshooting

- 401 on webhook: ensure `x-signature` matches HMAC of the raw body and `WEBHOOK_SECRET` is correct.
- DB connection fails: verify `MONGODB_URI` and network rules; the app logs and exits on failure.
- Empty lookup: seed users with `scripts/createUsers.js` or create users manually.

## License

ISC (see package.json).
