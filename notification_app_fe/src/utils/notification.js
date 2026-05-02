export function getNotificationId(notification) {
  return String(notification.ID || notification.id || "");
}

export function getNotificationType(notification) {
  const rawType = String(notification.Type || notification.type || "Event").toLowerCase();
  if (rawType === "placement") {
    return "Placement";
  }
  if (rawType === "result") {
    return "Result";
  }
  return "Event";
}

export function getNotificationTimestamp(notification) {
  const rawDate = notification.Timestamp || notification.timestamp || notification.createdAt || "";
  const parsed = Date.parse(String(rawDate).replace(" ", "T"));
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function formatDate(notification) {
  const rawDate = notification.Timestamp || notification.timestamp || notification.createdAt || "";
  const parsed = getNotificationTimestamp(notification);
  if (!parsed) {
    return rawDate || "Time unavailable";
  }
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(parsed);
}

