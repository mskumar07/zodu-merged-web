import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {Typography } from "@mui/material";

export interface VariantItem {
  id: string;
  price: string;        // or number — based on your API
  variant_name: string;
}

interface VariantTableProps {
  variantList: VariantItem[];
}

const VariantTable = ({ variantList }:VariantTableProps) => {
  const hasVariants = Array.isArray(variantList) && variantList.length > 0;

  return (
    <TableContainer
      component={Paper}
      sx={{
        maxHeight: 250,        // scroll height
        overflowY: "auto",
        borderRadius: 1,
      }}
    >
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell>Variant Name</TableCell>
            <TableCell>Price</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {hasVariants ? (
            variantList.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.variant_name}</TableCell>
                <TableCell>₹{item.price}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2} align="center">
                <Typography color="text.secondary">
                  No variants available
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default VariantTable;
