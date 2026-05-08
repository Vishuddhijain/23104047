import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";

const FilterBar = ({ filterType, setFilterType }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        mb: 3,
      }}
    >
      <FormControl sx={{ minWidth: 220 }}>
        <InputLabel>
          Filter Notifications
        </InputLabel>

        <Select
          value={filterType}
          label="Filter Notifications"
          onChange={(e) =>
            setFilterType(e.target.value)
          }
        >
          <MenuItem value="All">
            All
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
    </Box>
  );
};

export default FilterBar;