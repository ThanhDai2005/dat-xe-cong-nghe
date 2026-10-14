# GoRide auth API (TypeScript)

Run from the repository root. Docker Compose starts the API, MySQL, Redis, and Mailpit:

```powershell
Copy-Item be/.env.docker.example be/.env.docker
docker compose up -d --build
docker compose ps
```

Before sharing a deployment, replace `JWT_ACCESS_SECRET` and all example passwords. The API is at `http://localhost:3000` (`GET /health`); Mailpit's local inbox is at `http://localhost:8025`. MySQL is exposed on port 3307 and Redis on 6379 for development. The API applies SQL migrations on startup. `be/.env.docker` and `docs/` are intentionally untracked.

For local SMS testing, `SMS_PROVIDER=console` prints OTP codes in `docker compose logs api`. This mode is rejected in production. Set `SMS_PROVIDER=http`, `SMS_API_URL`, and `SMS_API_KEY` to use the generic JSON HTTP adapter; choose and adapt a real SMS vendor before production. Email uses standard SMTP (`SMTP_HOST`, `SMTP_PORT`, optional `SMTP_USER`/`SMTP_PASSWORD`, `SMTP_FROM`). Set `GOOGLE_CLIENT_ID` to enable Google ID Token verification for that client ID.

Authentication routes are available under both `/api/auth` (frontend compatibility) and `/api/v1/auth`:

| Task | Endpoint | Purpose |
| --- | --- | --- |
| SCRUM-26 | `POST /register`, `GET /email/verify?token=…`, `POST /email/resend` | Registration and email activation |
| SCRUM-37 | `POST /oauth/google` | Verify Google ID Token and sign in/create customer |
| SCRUM-42 | `POST /phone/otp/send` | Send six-digit SMS OTP |
| SCRUM-47 | `POST /phone/otp/verify` | Verify OTP and activate/create an account |

`POST /v1/login` also accepts the existing frontend's OTP login payload. OTPs expire after five minutes, are single-use, and allow five failed attempts. New customer accounts become active on phone verification. Driver accounts remain pending approval and do not receive login tokens until active.

Tests live in `be/test/unit/` and `be/test/e2e/`; production `npm run build` does not compile or ship them. Run unit tests with `cd be; npm ci; npm test`. For API integration tests, first run `docker compose up -d --build` from this worktree's root, then `cd be; npm run test:e2e`. The integration suite creates uniquely named local test accounts, uses Mailpit and Docker's development SMS log, and does not need a real SMS provider. It tests malformed/unconfigured Google requests; a real successful Google sign-in still requires a configured client ID and genuine Google ID Token. Frontend build: `cd fe; npm ci; npm run build`.
