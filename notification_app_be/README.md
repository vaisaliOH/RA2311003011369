# Stage 1 - Priority Notifications

This service fetches notifications from the protected evaluation API and returns the highest priority unread notifications.

## Run

1. Create `.env` from `.env.example`.
2. Add the bearer token as `AUTH_TOKEN` and `LOG_TOKEN`.
3. Start the local service.

```bash
npm start
```

Endpoint:

```text
GET http://localhost:3000/priority-notifications?limit=10
```

CLI:

```bash
npm run top -- 10
```

Test:

```bash
npm test
```

