import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Tooltip,
  Typography
} from "@mui/material";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import RefreshIcon from "@mui/icons-material/Refresh";
import { getNotifications } from "./services/notifications.js";
import { logEvent } from "./services/logger.js";
import { sortByPriority } from "./utils/priority.js";
import { getNotificationId, getNotificationType } from "./utils/notification.js";
import NotificationList from "./components/NotificationList.jsx";

const types = ["All", "Event", "Result", "Placement"];
const pageSizeOptions = [5, 10, 20];

function currentPage() {
  return window.location.pathname === "/priority" ? "priority" : "all";
}

function App() {
  const [view, setView] = useState(currentPage);
  const [notifications, setNotifications] = useState([]);
  const [viewedIds, setViewedIds] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("viewedNotificationIds") || "[]"));
    } catch {
      return new Set();
    }
  });
  const [type, setType] = useState("All");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");

  const visibleNotifications = useMemo(() => {
    const filtered =
      type === "All"
        ? notifications
        : notifications.filter((notification) => getNotificationType(notification) === type);

    if (view === "priority") {
      return sortByPriority(filtered).slice(0, limit);
    }

    return filtered;
  }, [limit, notifications, type, view]);

  const unreadCount = notifications.filter(
    (notification) => !viewedIds.has(getNotificationId(notification))
  ).length;

  const priorityCount = sortByPriority(notifications).slice(0, limit).length;
  const typeCounts = useMemo(
    () =>
      notifications.reduce(
        (counts, notification) => {
          const itemType = getNotificationType(notification);
          counts[itemType] += 1;
          return counts;
        },
        { Placement: 0, Result: 0, Event: 0 }
      ),
    [notifications]
  );

  function navigate(nextView) {
    const path = nextView === "priority" ? "/priority" : "/";
    window.history.pushState({}, "", path);
    setView(nextView);
    setPage(1);
    logEvent("frontend", "info", "page", `opened ${nextView} notifications page`);
  }

  function rememberViewed(nextViewedIds) {
    setViewedIds(nextViewedIds);
    localStorage.setItem("viewedNotificationIds", JSON.stringify([...nextViewedIds]));
  }

  function markViewed(notification) {
    const id = getNotificationId(notification);
    setSelectedId(id);
    if (!id || viewedIds.has(id)) {
      return;
    }
    const nextViewedIds = new Set(viewedIds);
    nextViewedIds.add(id);
    rememberViewed(nextViewedIds);
    logEvent("frontend", "info", "state", `notification ${id} marked as viewed`);
  }

  function markAllViewed() {
    const nextViewedIds = new Set(viewedIds);
    for (const notification of visibleNotifications) {
      nextViewedIds.add(getNotificationId(notification));
    }
    rememberViewed(nextViewedIds);
    logEvent("frontend", "info", "state", "visible notifications marked as viewed");
  }

  async function loadNotifications() {
    setLoading(true);
    setError("");

    try {
      await logEvent("frontend", "info", "api", "fetching notifications");
      const data = await getNotifications({
        limit,
        page,
        notificationType: type
      });
      setNotifications(data.notifications);
      if (data.notifications.length && !selectedId) {
        setSelectedId(getNotificationId(data.notifications[0]));
      }
      await logEvent("frontend", "info", "api", `loaded ${data.notifications.length} notifications`);
    } catch (apiError) {
      setError(apiError.message);
      await logEvent("frontend", "error", "api", apiError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, [limit, page, type]);

  useEffect(() => {
    function syncPath() {
      setView(currentPage());
    }
    window.addEventListener("popstate", syncPath);
    return () => window.removeEventListener("popstate", syncPath);
  }, []);

  const selectedNotification =
    visibleNotifications.find((notification) => getNotificationId(notification) === selectedId) ||
    visibleNotifications[0];

  return (
    <Box className="app-shell">
      <Box className="blue-header">
        <Box>
          <Typography component="h1" variant="h1">
            Campus Notifications
          </Typography>
          <Typography variant="body2">Placement, result and event updates</Typography>
        </Box>
        <Stack direction="row" spacing={1} className="header-counts">
          <Chip label={`${notifications.length} total`} />
          <Chip label={`${unreadCount} new`} className="new-chip" />
          <Tooltip title="Refresh notifications">
            <IconButton onClick={loadNotifications} aria-label="Refresh notifications" className="header-refresh">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <Box className="mail-layout">
        <Paper className="control-panel">
          <Typography variant="h2">View</Typography>
          <Stack spacing={1} className="view-switch">
            <Button variant={view === "all" ? "contained" : "outlined"} onClick={() => navigate("all")}>
              All notifications
            </Button>
            <Button
              variant={view === "priority" ? "contained" : "outlined"}
              onClick={() => navigate("priority")}
            >
              Priority inbox
            </Button>
          </Stack>

          <Box className="control-section">
            <Stack direction="row" spacing={1} alignItems="center" className="filter-title">
              <FilterAltIcon color="primary" />
              <Typography variant="h2">Filters</Typography>
            </Stack>
            <Stack spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="type-label">Notification type</InputLabel>
                <Select
                  labelId="type-label"
                  label="Notification type"
                  value={type}
                  onChange={(event) => {
                    setType(event.target.value);
                    setPage(1);
                  }}
                >
                  {types.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel id="limit-label">Limit</InputLabel>
                <Select
                  labelId="limit-label"
                  label="Limit"
                  value={limit}
                  onChange={(event) => {
                    setLimit(Number(event.target.value));
                    setPage(1);
                  }}
                >
                  {pageSizeOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Box>

          <Box className="mini-stats">
            <span>Placement: {typeCounts.Placement}</span>
            <span>Results: {typeCounts.Result}</span>
            <span>Events: {typeCounts.Event}</span>
            <span>Priority: {priorityCount}</span>
          </Box>
        </Paper>

        <Box className="list-column">
          <Paper className="list-header">
            <Box>
              <Typography variant="h2">
                {view === "priority" ? "Priority queue" : "Notifications"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {type === "All" ? "All types" : type} selected
              </Typography>
            </Box>
            <Tooltip title="Mark visible notifications as viewed">
              <IconButton color="secondary" onClick={markAllViewed} aria-label="Mark visible as viewed">
                <DoneAllIcon />
              </IconButton>
            </Tooltip>
          </Paper>

          {error ? (
            <Alert severity="error" className="state-box">
              {error}
            </Alert>
          ) : null}

          {loading ? (
            <Box className="loading-state">
              <CircularProgress />
              <Typography color="text.secondary">Loading notifications</Typography>
            </Box>
          ) : (
            <NotificationList
              notifications={visibleNotifications}
              viewedIds={viewedIds}
              onOpen={markViewed}
              priorityMode={view === "priority"}
              selectedId={selectedId}
            />
          )}

          {view === "all" ? (
            <Stack alignItems="center" className="pagination-row">
              <Pagination
                page={page}
                count={10}
                color="primary"
                onChange={(_, nextPage) => setPage(nextPage)}
              />
            </Stack>
          ) : null}
        </Box>

        <Paper className="detail-panel">
          {selectedNotification ? (
            <>
              <Typography variant="body2" color="text.secondary">
                Selected notification
              </Typography>
              <Typography variant="h2" className="detail-title">
                {selectedNotification.Message || selectedNotification.message || "Notification"}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" className="detail-tags">
                <Chip label={getNotificationType(selectedNotification)} color="primary" size="small" />
                <Chip
                  label={viewedIds.has(getNotificationId(selectedNotification)) ? "Viewed" : "New"}
                  color={viewedIds.has(getNotificationId(selectedNotification)) ? "default" : undefined}
                  className={viewedIds.has(getNotificationId(selectedNotification)) ? "" : "new-chip"}
                  size="small"
                  variant={viewedIds.has(getNotificationId(selectedNotification)) ? "outlined" : "filled"}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary" className="detail-id">
                {getNotificationId(selectedNotification)}
              </Typography>
              <Button
                variant="contained"
                onClick={() => markViewed(selectedNotification)}
                fullWidth
                className="detail-button"
              >
                Mark as viewed
              </Button>
            </>
          ) : (
            <Typography component="h1" variant="h1">
              No notification selected
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

export default App;
