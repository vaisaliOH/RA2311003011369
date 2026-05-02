# Stage 1

The priority inbox is implemented as a small Node.js service in `notification_app_be`. It calls the protected notification API, filters unread notifications, sorts them by business importance, and returns the top records requested by the client.

## Priority rule

Notification importance is ranked in this order:

1. Placement
2. Result
3. Event

If two notifications have the same type, the newer notification comes first. If both type and timestamp are equal, the ID is used as a stable final tie-breaker so repeated calls do not randomly reshuffle the output.

The API sample does not include a read/unread field. For that reason, the implementation treats missing read status as unread. If a later API response includes `read`, `isRead`, or `status`, those fields are respected.

## Keeping top 10 efficient

For the current API shape, the service fetches the notification list and sorts it in memory. This is simple and reliable for the stage requirement. If notifications start arriving as a stream, the same comparator can be used with a min-heap of size 10. Each new unread notification is compared with the weakest item in the heap. Better records replace it, weaker records are ignored, and the final heap is sorted only when the response is requested. That keeps update work close to `O(log 10)` per incoming notification instead of sorting the full list every time.

## Logging

The reusable logging function lives in `logging_middleware/index.js` and exposes:

```js
Log(stack, level, packageName, message)
```

The backend calls this logger around route handling, API fetching, successful priority calculation, and errors. It posts logs to the protected log endpoint with the bearer token from `LOG_TOKEN` or `AUTH_TOKEN`.

## How to verify

Run the unit test:

```bash
cd notification_app_be
npm test
```

Run the service after adding a valid token:

```bash
cd notification_app_be
npm start
```

Then call:

```text
GET http://localhost:3000/priority-notifications?limit=10
```

# Stage 2

The frontend implementation is in `notification_app_fe`. It is a React application using Material UI and native CSS, and it is configured to run on `http://localhost:3000`.

## Pages

The application has two user-facing pages:

1. All notifications at `/`
2. Priority notifications at `/priority`

Both pages use the same protected notification API. The all-notifications page uses `limit`, `page`, and `notification_type` query parameters. The priority page applies the Stage 1 ranking rule on the frontend and displays the top limited result set.

## New and viewed notifications

The API response shown in the task does not include a viewed flag. To keep the interface useful, the frontend stores viewed notification IDs in `localStorage`. A notification starts as new unless its ID exists in that local viewed set. Opening a notification marks it as viewed, and the toolbar action can mark the currently visible list as viewed.

## API handling

The frontend reads the bearer token from `VITE_AUTH_TOKEN`. During local development, Vite proxies `/evaluation-service` to the evaluation server. This keeps the app available at `localhost:3000` while still calling the required protected APIs.

## Logging

Frontend events are logged through `src/services/logger.js`. It uses the required log endpoint with `stack` set to `frontend` and package names such as `api`, `page`, and `state`. Logging failures are swallowed so that a log outage does not break the notification UI.

## Run

```bash
cd notification_app_fe
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```
