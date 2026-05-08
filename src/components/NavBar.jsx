import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StarIcon from "@mui/icons-material/Star";

const Navbar = () => {
  const location = useLocation();

  return (
    <AppBar position="sticky">
      <Toolbar>
        {/* App name */}
        <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
          CampusNotify
        </Typography>

        {/* Nav links */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            component={Link}
            to="/"
            color="inherit"
            startIcon={<NotificationsIcon />}
            variant={location.pathname === "/" ? "outlined" : "text"}
            sx={{ borderColor: "rgba(255,255,255,0.5)" }}
          >
            All Notifications
          </Button>

          <Button
            component={Link}
            to="/priority"
            color="inherit"
            startIcon={<StarIcon />}
            variant={location.pathname === "/priority" ? "outlined" : "text"}
            sx={{ borderColor: "rgba(255,255,255,0.5)" }}
          >
            Priority Inbox
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;