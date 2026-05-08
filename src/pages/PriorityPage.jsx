import { useEffect, useState, useCallback } from "react";

import {
  Container,
  Typography,
  CircularProgress,
  Box,
  Alert,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Paper,
} from "@mui/material";

import StarIcon from "@mui/icons-material/Star";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import RefreshIcon from "@mui/icons-material/Refresh";

import { fetchNotifications } from "../services/api";

const PRIORITY_ORDER = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

function getPriorityScore(notification) {
  const weight =
    PRIORITY_ORDER[notification.Type] ?? 0;

  const recency =
    new Date(
      notification.Timestamp
    ).getTime() / 1e12;

  return weight + recency;
}

function getTopN(notifications, n) {
  return [...notifications]
    .sort(
      (a, b) =>
        getPriorityScore(b) -
        getPriorityScore(a)
    )
    .slice(0, n);
}

const STORAGE_KEY = "campus_viewed_ids";

function loadViewedIds() {
  try {
    const raw = localStorage.getItem(
      STORAGE_KEY
    );

    return raw
      ? new Set(JSON.parse(raw))
      : new Set();
  } catch {
    return new Set();
  }
}

function saveViewedIds(set) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([...set])
    );
  } catch {}
}

const TYPE_STYLE = {
  Placement: {
    bg: "#d1fae5",
    color: "green",
  },

  Result: {
    bg: "#dbeafe",
    color: "blue",
  },

  Event: {
    bg: "#ffedd5",
    color: "orange",
  },
};

function getRankStyle(rank) {
  if (rank === 1) {
    return {
      bg: "#FFD700",
      color: "#000",
    };
  }

  if (rank === 2) {
    return {
      bg: "#C0C0C0",
      color: "#000",
    };
  }

  if (rank === 3) {
    return {
      bg: "#CD7F32",
      color: "#fff",
    };
  }

  return {
    bg: "#1976d2",
    color: "#fff",
  };
}

const PriorityPage = () => {
  const [allNotifications, setAllNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");

  const [topN, setTopN] = useState(10);

  const [filterType, setFilterType] =
    useState("All");

  const [viewedIds, setViewedIds] =
    useState(() => loadViewedIds());

  const loadNotifications = useCallback(
    async () => {
      try {
        setLoading(true);

        setError("");

        const response = await fetchNotifications(
  1,
  topN,
  filterType === "All"
    ? ""
    : filterType
);

const data = response || [];

        

        setAllNotifications(data);
      } catch (err) {
        console.error(
          "Priority Fetch Error:",
          err
        );

        setError(
          "Failed to fetch notifications. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [filterType]
  );

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications, filterType]);

  const filtered =
    filterType === "All"
      ? allNotifications
      : allNotifications.filter(
          (n) =>
            n.Type === filterType
        );

  const prioritized = getTopN(
    filtered,
    topN
  );

  const markViewed = useCallback(
    (id) => {
      setViewedIds((prev) => {
        if (prev.has(id)) {
          return prev;
        }

        const next = new Set(prev);

        next.add(id);

        saveViewedIds(next);

        return next;
      });
    },
    []
  );

  const markAllViewed =
    useCallback(() => {
      setViewedIds((prev) => {
        const next = new Set(prev);

        prioritized.forEach((n) =>
          next.add(n.ID)
        );

        saveViewedIds(next);

        return next;
      });
    }, [prioritized]);

  const unreadCount =
    prioritized.filter(
      (n) => !viewedIds.has(n.ID)
    ).length;

  return (
    <Container
      maxWidth="lg"
      sx={{
        mt: 4,
        mb: 6,
      }}
    >
      {/* TITLE */}

      <Box
        sx={{
          textAlign: "center",
          mb: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
            mb: 1,
          }}
        >
          <StarIcon
            sx={{
              color: "#f59e0b",
              fontSize: 36,
            }}
          />

          <Typography
            variant="h3"
            fontWeight="bold"
            sx={{
              fontSize: {
                xs: "2rem",
                sm: "3rem",
              },
            }}
          >
            Priority Inbox
          </Typography>

          <StarIcon
            sx={{
              color: "#f59e0b",
              fontSize: 36,
            }}
          />
        </Box>

        <Typography
          variant="body1"
          color="text.secondary"
        >
          Showing top {topN} most
          important notifications
          {filterType !== "All"
            ? ` · Type: ${filterType}`
            : ""}
        </Typography>
      </Box>

      {/* PRIORITY INFO */}

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 3,
          bgcolor: "#f8fafc",
          borderRadius: 2,
        }}
      >
        <Typography
          variant="caption"
          fontWeight={600}
          color="text.secondary"
          display="block"
          mb={1}
        >
          PRIORITY ORDER
        </Typography>

        <Stack
          direction="row"
          spacing={1}
          sx={{ flexWrap: "wrap" }}
        >
          <Chip
            label="Placement = Weight 3 (Highest)"
            size="small"
            sx={{
              bgcolor: "#d1fae5",
              color: "green",
              fontWeight: 700,
            }}
          />

          <Chip
            label="Result = Weight 2"
            size="small"
            sx={{
              bgcolor: "#dbeafe",
              color: "blue",
              fontWeight: 700,
            }}
          />

          <Chip
            label="Event = Weight 1"
            size="small"
            sx={{
              bgcolor: "#ffedd5",
              color: "orange",
              fontWeight: 700,
            }}
          />

          <Chip
            label="Newer = Higher within same type"
            size="small"
            sx={{
              bgcolor: "#f3f4f6",
            }}
          />
        </Stack>
      </Paper>

      {/* CONTROLS */}

      <Box
        sx={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={2}
          sx={{ flexWrap: "wrap" }}
          width={{
            xs: "100%",
            sm: "auto",
          }}
        >
          <FormControl
            size="small"
            sx={{
              minWidth: 130,
            }}
          >
            <InputLabel>
              Show Top
            </InputLabel>

            <Select
              value={topN}
              label="Show Top"
              onChange={(e) =>
                setTopN(
                  Number(
                    e.target.value
                  )
                )
              }
            >
              {[5, 10, 15, 20, 25].map(
                (n) => (
                  <MenuItem
                    key={n}
                    value={n}
                  >
                    Top {n}
                  </MenuItem>
                )
              )}
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{
              minWidth: 180,
            }}
          >
            <InputLabel>
              Notification Type
            </InputLabel>

            <Select
              value={filterType}
              label="Notification Type"
              onChange={(e) =>
                setFilterType(
                  e.target.value
                )
              }
            >
              <MenuItem value="All">
                All Types
              </MenuItem>

              <MenuItem value="Placement">
                Placement
              </MenuItem>

              <MenuItem value="Result">
                Result
              </MenuItem>

              <MenuItem value="Event">
                Event
              </MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1}
          width={{
            xs: "100%",
            sm: "auto",
          }}
        >
          {unreadCount > 0 && (
            <Button
              size="small"
              variant="outlined"
              startIcon={
                <DoneAllIcon />
              }
              onClick={
                markAllViewed
              }
            >
              Mark all read
            </Button>
          )}

          <Button
            size="small"
            variant="outlined"
            startIcon={
              <RefreshIcon />
            }
            onClick={
              loadNotifications
            }
          >
            Refresh
          </Button>
        </Stack>
      </Box>

      {/* UNREAD */}

      {unreadCount > 0 && (
        <Typography
          variant="body2"
          color="primary"
          sx={{ mb: 2 }}
        >
          <FiberManualRecordIcon
            sx={{
              fontSize: 10,
              mr: 0.5,
              mb: "-1px",
            }}
          />

          {unreadCount} unread
          notification
          {unreadCount !== 1
            ? "s"
            : ""}
        </Typography>
      )}

      {/* LOADING */}

      {loading && (
        <Box
          sx={{
            display: "flex",
            justifyContent:
              "center",
            mt: 5,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* ERROR */}

      {error && (
        <Alert
          severity="error"
          sx={{ mt: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={
                loadNotifications
              }
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* EMPTY */}

      {!loading &&
        !error &&
        prioritized.length ===
          0 && (
          <Alert severity="info">
            No notifications found
            for selected filters.
          </Alert>
        )}

      {/* CARDS */}

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
          mt: 2,
        }}
      >
        {prioritized.map(
          (
            notification,
            index
          ) => {
            const isViewed =
              viewedIds.has(
                notification.ID
              );

            const typeStyle =
              TYPE_STYLE[
                notification.Type
              ] ?? {
                bg: "#f3f4f6",
                color: "grey",
              };

            const rank =
              index + 1;

            const rankStyle =
              getRankStyle(rank);

            return (
              <Box
                key={
                  notification.ID
                }
                onClick={() =>
                  markViewed(
                    notification.ID
                  )
                }
                sx={{
                  border:
                    "1px solid #ddd",

                  borderRadius: 3,

                  padding: 3,

                  backgroundColor:
                    isViewed
                      ? "#fafafa"
                      : "#ffffff",

                  boxShadow:
                    isViewed
                      ? 1
                      : 3,

                  transition:
                    "all 0.2s ease",

                  cursor:
                    "pointer",

                  minHeight: {
                    xs: "180px",
                    sm: "220px",
                  },

                  position:
                    "relative",

                  borderLeft:
                    isViewed
                      ? "4px solid #bdbdbd"
                      : "6px solid #1976d2",

                  opacity:
                    isViewed
                      ? 0.72
                      : 1,

                  "&:hover": {
                    transform:
                      "translateY(-4px)",

                    boxShadow: 6,
                  },
                }}
              >
                {/* RANK */}

                <Box
                  sx={{
                    position:
                      "absolute",

                    top: 10,

                    left: -2,

                    bgcolor:
                      rankStyle.bg,

                    color:
                      rankStyle.color,

                    fontWeight: 700,

                    fontSize:
                      "0.7rem",

                    px: 1,

                    py: 0.3,

                    borderRadius:
                      "0 6px 6px 0",

                    boxShadow: 1,
                  }}
                >
                  #{rank}
                </Box>

                {/* UNREAD DOT */}

                {!isViewed && (
                  <FiberManualRecordIcon
                    sx={{
                      position:
                        "absolute",

                      top: 10,

                      right: 10,

                      fontSize: 12,

                      color:
                        "primary.main",
                    }}
                  />
                )}

                {/* TYPE */}

                <Chip
                  label={
                    notification.Type
                  }
                  sx={{
                    backgroundColor:
                      typeStyle.bg,

                    color:
                      typeStyle.color,

                    fontWeight:
                      "bold",

                    mb: 2,

                    mt: 1,
                  }}
                />

                {/* MESSAGE */}

                <Typography
                  variant="h5"
                  fontWeight={
                    isViewed
                      ? "normal"
                      : "bold"
                  }
                  sx={{
                    mb: 2,
                  }}
                >
                  {
                    notification.Message
                  }
                </Typography>

                {/* TIME */}

                <Typography
                  variant="body1"
                  color="text.secondary"
                >
                  {
                    notification.Timestamp
                  }
                </Typography>
              </Box>
            );
          }
        )}
      </Box>
    </Container>
  );
};

export default PriorityPage;