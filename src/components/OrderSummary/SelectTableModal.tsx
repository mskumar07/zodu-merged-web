//Z-T77
import React from "react";
import { Modal, Box, Typography, Grid, Paper, Button } from "@mui/material";
import TimeDifference from "./TimeDifference";

interface Table {
  id: number;
  status: string;
  available: boolean;
}

interface ActiveOrder {
  tableNumber: number;
  order_time?: string| undefined; // e.g., "18:28:18.475867"
  // You can include other properties if needed (kotList, items, etc.)
}

interface SelectTableModalProps {
  open: boolean;
  onClose: () => void;
  tables?: Table[];
  tableName?: number; // now supports multiple selected tables
  activeDineInTableOrders?: ActiveOrder[];
  selectTable: (tableId: number) => void;
}

const SelectTableModal: React.FC<SelectTableModalProps> = ({
  open,
  onClose,
  tables,
  tableName,
  activeDineInTableOrders = [],
  selectTable,
}) => {
  const tableData =
    tables ||
    Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      status: "Empty",
      available: true,
    }));

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute" as const,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          p: 3,
        }}
      >
        {/* Title */}
        <Typography variant="h6" mb={2}>
          Select Table
        </Typography>

        {/* Table Grid */}
        <Grid container spacing={2}>
          {tableData.map((table) => {
            const isSelected = tableName === table.id;

            // Check if table has an active running order
            const isRunning = activeDineInTableOrders.some(
              (order) => order.tableNumber === table.id
            );

            const activeOrder = activeDineInTableOrders.find(
              (order) => order.tableNumber === table.id
            );


            let borderColor = "grey.400";
            let displayStatus = table.status;
            let statusColor = "text.secondary";
            let bgColor = "background.paper";


            if (isRunning) {
              borderColor = "warning.main";
              displayStatus = "Running";
              bgColor = "warning.main";
              statusColor = "warning.main";
            } else if (isSelected) {
              borderColor = "primary.main";
              displayStatus = "Selected";
              statusColor = "primary.main";
              bgColor = "primary.main";
            } else if (table.available) {
              borderColor = "success.main";
              displayStatus = "Empty";
              statusColor = "success.main";
              bgColor = "success.main";
            } 

            return (
              <Grid size={{ xs: 4, md: 1.5 }} key={table.id}>
                <Paper
                  sx={{
                    textAlign: "center",
                    p: 1.2,
                    border: "2px solid",
                    borderColor,
                    borderRadius: 2,
                    cursor: "pointer",
                    transition: "0.2s ease",
                    "&:hover": {
                      borderColor: "primary.main",
                      boxShadow: 2,
                    },
                  }}
                  onClick={() => {
                    selectTable(table.id);
                    onClose();
                  }}
                >
                  <>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        justifyContent: "space-around",
                        alignItems: "center",
                        cursor:"pointer"
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: table.available ? "lightgreen" : "grey.300",
                          // bgcolor: bgColor,
                          width: "50%",
                          height: "40px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "green",
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="h6">{table.id}</Typography>
                      </Box>

                      {/* <Box>
                        <Typography fontWeight="bold" color={statusColor}>
                          {displayStatus}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {table.available
                            ? isRunning
                              ? "Active Order"
                              : "Available"
                            : "Occupied"}
                        </Typography>
                      </Box> */}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {isRunning ? (
                        <TimeDifference order_time={activeOrder?.order_time} />
                      ) : (
                        <Typography
                          variant="subtitle2"
                          sx={{
                            width: "100%",
                            marginTop: 1,
                            textAlign: "left",
                            visibility: "hidden"
                          }}
                        >JUST STARTED</Typography>
                      )}
                    </Typography>
                  </>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
        {/* Legend Section */}
<Box mt={3}>
  {/* <Typography variant="subtitle2" mb={1}  >
    Info
  </Typography> */}

  <Box
    sx={{
      display: "flex",
      gap: 3,
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "flex-end",
    }}
  >
    {/* Empty */}
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box
        sx={{
          width: 20,
          height: 20,
          bgcolor: "success.main",
          borderRadius: "4px",
        }}
      />
      <Typography variant="body2">Empty</Typography>
    </Box>

    {/* Selected */}
    {/* <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box
        sx={{
          width: 20,
          height: 20,
          bgcolor: "primary.main",
          borderRadius: "4px",
        }}
      />
      <Typography variant="body2">Selected</Typography>
    </Box> */}

    {/* Running */}
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box
        sx={{
          width: 20,
          height: 20,
          bgcolor: "warning.main",
          borderRadius: "4px",
        }}
      />
      <Typography variant="body2">Running</Typography>
    </Box>
  </Box>
</Box>

        {/* Close button */}
        <Box mt={3} textAlign="right">
          <Button onClick={onClose}>Close</Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default SelectTableModal;
