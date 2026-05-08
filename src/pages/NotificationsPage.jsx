import { useEffect, useState, useCallback } from "react";
import {
  Container,
  Typography,
  CircularProgress,
  Box,
  Alert,
  Pagination,
  Stack,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
} from "@mui/material";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

import { fetchNotifications } from "../services/api";
import FilterBar from "../components/FilterBar";

// ─── Priority weight ────────────────────────────────────────────────────────
const PRIORITY_ORDER = { Placement: 3, Result: 2, Event: 1 };

function sortByPriority(notifications) {
  return [...notifications].sort((a, b) => {
    const weightDiff =
      (PRIORITY_ORDER[b.Type] ?? 0) - (PRIORITY_ORDER[a.Type] ?? 0);
    if (weightDiff !== 0) return weightDiff;
    // Same type → newer first
    return new Date(b.Timestamp) - new Date(a.Timestamp);
  });
}

// ─── localStorage helpers ───────────────────────────────────────────────────
const STORAGE_KEY = "campus_viewed_ids";

function loadViewedIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveViewedIds(set) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {}
}

// ─── Chip colours ────────────────────────────────────────────────────────────
const TYPE_STYLE = {
  Placement: { bg: "#d1fae5", color: "green" },
  Result: { bg: "#dbeafe", color: "blue" },
  Event: { bg: "#ffedd5", color: "orange" },
};

// ─── Component ───────────────────────────────────────────────────────────────
const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState("All");

  // ── Viewed state lives in localStorage so it survives refresh ──
  const [viewedIds, setViewedIds] = useState(() => loadViewedIds());

  const markViewed = useCallback((id) => {
    setViewedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      saveViewedIds(next);
      return next;
    });
  }, []);

  const markAllViewed = useCallback(() => {
    setViewedIds((prev) => {
      const next = new Set(prev);
      notifications.forEach((n) => next.add(n.ID));
      saveViewedIds(next);
      return next;
    });
  }, [notifications]);

  // ── Fetch ───────────────────────────────────────────────────────
  const getNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Send empty string to API when "All" is selected, not the word "All"
      const typeParam = filterType === "All" ? "" : filterType;

      const data = await fetchNotifications(page, limit, typeParam);

      // Sort the current page by priority + recency
      setNotifications(sortByPriority(data));

      // If API returns fewer items than limit, we're on the last page
      // Adjust totalPages dynamically
      setTotalPages((prev) => {
        if (data.length < limit) return page; // no more pages
        return Math.max(prev, page + 1); // at least one more
      });
    } catch (err) {
      setError("Failed to fetch notifications. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, filterType]);

  // Reset to page 1 whenever filter or limit changes
  useEffect(() => {
    setPage(1);
    setTotalPages(1);
  }, [filterType, limit]);

  useEffect(() => {
    getNotifications();
  }, [getNotifications]);

  const unreadCount = notifications.filter((n) => !viewedIds.has(n.ID)).length;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* ── Title ── */}
      <Typography
        variant="h3"
        fontWeight="bold"
        gutterBottom
        sx={{ textAlign: "center" }}
      >
        Campus Notifications
      </Typography>

      {/* ── Filter row ── */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 2,
        }}
      >
        <FilterBar filterType={filterType} setFilterType={setFilterType} />

        {/* Per-page selector */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Per Page</InputLabel>
          <Select
            value={limit}
            label="Per Page"
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            {[5, 10, 20, 50].map((n) => (
              <MenuItem key={n} value={n}>
                {n}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* ── Unread summary + mark-all ── */}
      {unreadCount > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            px: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            <FiberManualRecordIcon
              sx={{ fontSize: 10, color: "primary.main", mr: 0.5, mb: "-1px" }}
            />
            {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </Typography>

          <Button
            size="small"
            variant="outlined"
            startIcon={<DoneAllIcon />}
            onClick={markAllViewed}
          >
            Mark all as read
          </Button>
        </Box>
      )}

      {/* ── Loading ── */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      )}

      {/* ── Error ── */}
      {error && (
        <Alert
          severity="error"
          sx={{ mt: 2 }}
          action={
            <Button color="inherit" size="small" onClick={getNotifications}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && notifications.length === 0 && (
        <Alert severity="info" sx={{ mt: 3 }}>
          No notifications found.
        </Alert>
      )}

      {/* ── Grid ── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "1fr 1fr 1fr",
            lg: "1fr 1fr 1fr 1fr",
          },
          gap: 3,
          mt: 3,
        }}
      >
        {notifications.map((notification) => {
          const isViewed = viewedIds.has(notification.ID);
          const typeStyle = TYPE_STYLE[notification.Type] ?? {
            bg: "#f3f4f6",
            color: "grey",
          };

          return (
            <Box
              key={notification.ID}
              onClick={() => markViewed(notification.ID)}
              sx={{
                border: "1px solid #ddd",
                borderRadius: 3,
                padding: 3,
                backgroundColor: isViewed ? "#fafafa" : "#ffffff",
                boxShadow: isViewed ? 1 : 3,
                transition: "all 0.2s ease",
                cursor: "pointer",
                minHeight: "220px",
                position: "relative",
                // Blue left border = unread, grey = read
                borderLeft: isViewed
                  ? "4px solid #bdbdbd"
                  : "6px solid #1976d2",
                opacity: isViewed ? 0.75 : 1,
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6,
                },
              }}
            >
              {/* Unread blue dot in top-right corner */}
              {!isViewed && (
                <FiberManualRecordIcon
                  sx={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    fontSize: 12,
                    color: "primary.main",
                  }}
                />
              )}

              {/* Type chip */}
              <Chip
                label={notification.Type}
                sx={{
                  backgroundColor: typeStyle.bg,
                  color: typeStyle.color,
                  fontWeight: "bold",
                  mb: 2,
                }}
              />

              {/* Message */}
              <Typography
                variant="h5"
                fontWeight={isViewed ? "normal" : "bold"}
                sx={{ mb: 2 }}
              >
                {notification.Message}
              </Typography>

              {/* Timestamp */}
              <Typography variant="body1" color="text.secondary">
                {notification.Timestamp}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* ── Pagination ── */}
      <Stack
        spacing={2}
        sx={{
          mt: 5,
          alignItems: "center",
        }}
      >
        <Pagination
          count={totalPages} // ← dynamic, not hardcoded 10
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
          showFirstButton
          showLastButton
        />
      </Stack>
    </Container>
  );
};

export default NotificationsPage;
