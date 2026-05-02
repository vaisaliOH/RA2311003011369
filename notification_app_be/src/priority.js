const typeRank = {
  placement: 3,
  result: 2,
  event: 1
};

function notificationType(notification) {
  return String(notification.Type || notification.type || "").toLowerCase();
}

function notificationTime(notification) {
  const raw = notification.Timestamp || notification.timestamp || notification.createdAt || "";
  const parsed = Date.parse(raw);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function isUnread(notification) {
  if (typeof notification.read === "boolean") {
    return !notification.read;
  }
  if (typeof notification.isRead === "boolean") {
    return !notification.isRead;
  }
  if (typeof notification.status === "string") {
    return notification.status.toLowerCase() !== "read";
  }
  return true;
}

function comparePriority(left, right) {
  const leftRank = typeRank[notificationType(left)] || 0;
  const rightRank = typeRank[notificationType(right)] || 0;

  if (leftRank !== rightRank) {
    return rightRank - leftRank;
  }

  const timeDelta = notificationTime(right) - notificationTime(left);
  if (timeDelta !== 0) {
    return timeDelta;
  }

  return String(left.ID || left.id || "").localeCompare(String(right.ID || right.id || ""));
}

function topPriorityNotifications(notifications, limit = 10) {
  if (!Array.isArray(notifications)) {
    throw new TypeError("notifications must be an array");
  }

  return notifications
    .filter(isUnread)
    .slice()
    .sort(comparePriority)
    .slice(0, limit);
}

module.exports = {
  comparePriority,
  topPriorityNotifications
};

