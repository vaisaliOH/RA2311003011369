const apiBase = import.meta.env.VITE_API_BASE || "/evaluation-service";

function authHeader() {
  const token = String(import.meta.env.VITE_AUTH_TOKEN || "")
    .trim()
    .replace(/^Bearer\s+/i, "");

  return token ? { authorization: `Bearer ${token}` } : {};
}

export async function getNotifications({ limit, page, notificationType }) {
  const requestedLimit = Number(limit);
  const safeLimit = requestedLimit > 10 ? 10 : requestedLimit;
  const pageCount = Math.ceil(requestedLimit / safeLimit);
  const firstApiPage = (Number(page) - 1) * pageCount + 1;
  const collected = [];

  for (let index = 0; index < pageCount; index += 1) {
    const response = await getNotificationPage({
      limit: safeLimit,
      page: firstApiPage + index,
      notificationType
    });

    collected.push(...response.notifications);
  }

  return {
    notifications: collected.slice(0, requestedLimit)
  };
}

async function getNotificationPage({ limit, page, notificationType }) {
  const shouldFilterByType = notificationType && notificationType !== "All";
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("page", String(page));

  if (shouldFilterByType) {
    params.set("notification_type", notificationType);
  }

  let response = await requestNotifications(params);

  if (response.status === 400 && shouldFilterByType) {
    params.delete("notification_type");
    response = await requestNotifications(params);
  }

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.message || body.error || `Notifications failed with status ${response.status}`);
  }

  const notifications = Array.isArray(body.notifications) ? body.notifications : [];

  return {
    notifications
  };
}

function requestNotifications(params) {
  return fetch(`${apiBase}/notifications?${params.toString()}`, {
    headers: authHeader()
  });
}
