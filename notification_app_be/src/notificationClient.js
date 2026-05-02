const { baseUrl, authToken } = require("./config");
const { Log } = require("../../logging_middleware");

async function fetchNotifications(token = authToken) {
  if (!token) {
    await Log("backend", "error", "auth", "notification fetch stopped because auth token is missing");
    throw new Error("AUTH_TOKEN is required to call the notification API");
  }

  await Log("backend", "info", "service", "requesting notifications from evaluation service");

  const response = await fetch(`${baseUrl}/notifications`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${token}`
    }
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    await Log("backend", "error", "service", `notification API failed with status ${response.status}`);
    throw new Error(body.message || body.error || `notification API failed with ${response.status}`);
  }

  const notifications = Array.isArray(body.notifications) ? body.notifications : [];
  await Log("backend", "info", "service", `received ${notifications.length} notifications`);

  return notifications;
}

module.exports = {
  fetchNotifications
};

