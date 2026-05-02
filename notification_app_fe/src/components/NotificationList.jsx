import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Typography
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import WorkIcon from "@mui/icons-material/Work";
import { formatDate, getNotificationId, getNotificationType } from "../utils/notification.js";

const typeIcon = {
  Event: <EventIcon fontSize="small" />,
  Result: <FactCheckIcon fontSize="small" />,
  Placement: <WorkIcon fontSize="small" />
};

const typeColor = {
  Event: "warning",
  Result: "primary",
  Placement: "secondary"
};

function NotificationList({ notifications, viewedIds, onOpen, priorityMode, selectedId }) {
  if (!notifications.length) {
    return (
      <Box className="empty-state">
        <Typography variant="h2">No records for this selection</Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={1.5}>
      {notifications.map((notification, index) => {
        const id = getNotificationId(notification);
        const type = getNotificationType(notification);
        const isViewed = viewedIds.has(id);

        return (
          <Card
            key={id || `${type}-${index}`}
            className={[
              "notification",
              isViewed ? "viewed" : "",
              selectedId === id ? "selected" : ""
            ].join(" ")}
          >
            <CardActionArea onClick={() => onOpen(notification)}>
              <CardContent>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="space-between">
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <span className="serial-number">{String(index + 1).padStart(2, "0")}</span>
                      <Chip
                        icon={typeIcon[type]}
                        label={type}
                        color={typeColor[type] || "default"}
                        size="small"
                      />
                      <Chip
                        label={isViewed ? "Viewed" : "New"}
                        color={isViewed ? "default" : undefined}
                        className={isViewed ? "" : "new-chip"}
                        size="small"
                        variant={isViewed ? "outlined" : "filled"}
                      />
                      {priorityMode ? <Chip label={`Rank ${index + 1}`} size="small" variant="outlined" /> : null}
                    </Stack>
                    <Typography variant="h2" component="h2">
                      {notification.Message || notification.message || "Notification"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" className="notification-id">
                      {id}
                    </Typography>
                  </Stack>

                  <Typography className="time-text" color="text.secondary">
                    {formatDate(notification)}
                  </Typography>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        );
      })}
    </Stack>
  );
}

export default NotificationList;
