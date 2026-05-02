const { loadEnv } = require("./loadEnv");
loadEnv();

const http = require("http");
const { URL } = require("url");
const { defaultLimit, port } = require("./config");
const { fetchNotifications } = require("./notificationClient");
const { topPriorityNotifications } = require("./priority");
const { Log } = require("../../logging_middleware");

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "content-type": "application/json"
  });
  response.end(JSON.stringify(payload, null, 2));
}

async function handlePriorityRequest(request, response, url) {
  const limit = Number(url.searchParams.get("limit") || defaultLimit);
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : defaultLimit;

  await Log("backend", "info", "route", `priority inbox requested with limit ${safeLimit}`);

  const notifications = await fetchNotifications();
  const priorityNotifications = topPriorityNotifications(notifications, safeLimit);

  await Log(
    "backend",
    "info",
    "service",
    `priority inbox returned ${priorityNotifications.length} notifications`
  );

  sendJson(response, 200, {
    count: priorityNotifications.length,
    priority: priorityNotifications
  });
}

async function handleRequest(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);

  try {
    if (request.method === "GET" && url.pathname === "/health") {
      sendJson(response, 200, { status: "ok" });
      return;
    }

    if (request.method === "GET" && url.pathname === "/priority-notifications") {
      await handlePriorityRequest(request, response, url);
      return;
    }

    sendJson(response, 404, {
      error: "route not found",
      availableRoutes: ["GET /health", "GET /priority-notifications?limit=10"]
    });
  } catch (error) {
    await Log("backend", "error", "handler", error.message).catch(() => {});
    sendJson(response, 500, {
      error: error.message
    });
  }
}

const server = http.createServer((request, response) => {
  handleRequest(request, response);
});

server.listen(port, () => {
  process.stdout.write(`Priority notification service running on http://localhost:${port}\n`);
});
