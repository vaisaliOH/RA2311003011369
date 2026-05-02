import { getNotificationId, getNotificationTimestamp, getNotificationType } from "./notification.js";

const rank = {
  Placement: 3,
  Result: 2,
  Event: 1
};

export function sortByPriority(notifications) {
  return [...notifications].sort((left, right) => {
    const typeDifference = (rank[getNotificationType(right)] || 0) - (rank[getNotificationType(left)] || 0);
    if (typeDifference !== 0) {
      return typeDifference;
    }

    const timeDifference = getNotificationTimestamp(right) - getNotificationTimestamp(left);
    if (timeDifference !== 0) {
      return timeDifference;
    }

    return getNotificationId(left).localeCompare(getNotificationId(right));
  });
}

