import React, { useState } from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Checkbox,
  Box,
  Typography,
  Button,
} from "@mui/material";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useSelector } from "react-redux";
import { BranchId, ZoduId } from "@store/slices/userSlice";
import { usePaynowExpenseMutation } from "../../store/services/expenseApi";
import PaymentModal from "./PayNowModal";
import ExpenseModal from "./ExpenseModal";
import DeleteConfirmModal from "@components/DeleteMenuModal";
import { toast } from "react-toastify";
import { formatDateTime } from "@utils/util";

/* ---------------- TYPES ---------------- */

interface ExpenseItem {
  id: string;
  category: string;
  name: string;
  billDate: string;
  totalAmount: number;
  amountPaid: number;
  paymentMethod: string;
}

interface ExpensesTableProps {
  items: ExpenseItem[];
  onRowClick: (item: ExpenseItem) => void;
  onEdit: (item: ExpenseItem) => void;
  onDelete: (item: ExpenseItem) => void;
  isDeleting: boolean;
  showDeleteModal: boolean;
  setShowDeleteModal: (show: boolean) => void;
}

/* ---------------- COLUMNS ---------------- */

const columns: ColumnDef<ExpenseItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        indeterminate={row.getIsSomeSelected()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
  },
  {
    accessorKey: "id",
    header: () => <Typography color="text.secondary">Expense Id</Typography>,
    cell: ({ row, table }) => (
      <Typography
        sx={{
          cursor: "pointer",
          textDecoration: "underline",
          color: "#1976d2",
        }}
        onClick={() => table.options.meta?.onRowClick(row.original)}
      >
        {row.original.id}
      </Typography>
    ),
  },
  {
    accessorKey: "billDate",
    header: () => <Typography color="text.secondary">Bill Date</Typography>,
    cell: (info) => (
      <Typography fontSize="13px">
        {formatDateTime(info.getValue() as string)}
      </Typography>
    ),
  },

  /* ---------- NUMERIC COLUMNS (RIGHT ALIGNED) ---------- */

  {
    accessorKey: "totalAmount",
    header: () => <Typography color="text.secondary">Total Amount</Typography>,
    meta: { align: "right" },
    cell: (info) => `₹ ${info.getValue<number>().toLocaleString()}`,
  },
  {
    accessorKey: "amountPaid",
    header: () => <Typography color="text.secondary">Amount Paid</Typography>,
    meta: { align: "right" },
    cell: (info) => `₹ ${info.getValue<number>().toLocaleString()}`,
  },
  {
    id: "dueAmount",
    header: () => <Typography color="text.secondary">Due Amount</Typography>,
    meta: { align: "right" },
    cell: ({ row }) => {
      const due =
        row.original.totalAmount - row.original.amountPaid;
      return `₹ ${due.toLocaleString()}`;
    },
  },
  {
    id: "pay",
    header: () => null,
    cell: ({ row, table }) => {
      const due =
        row.original.totalAmount - row.original.amountPaid;
      if (due <= 0) return null;

      return (
        <Button
          size="small"
          variant="contained"
          onClick={() =>
            table.options.meta?.onPaymentClick(row.original)
          }
        >
          Pay Now
        </Button>
      );
    },
  },
];

/* ---------------- COMPONENT ---------------- */

const ExpensesTable: React.FC<ExpensesTableProps> = ({
  items,
  onRowClick,
  onEdit,
  onDelete,
  isDeleting,
  showDeleteModal,
  setShowDeleteModal,
}) => {
  const [selectedExpense, setSelectedExpense] =
    useState<ExpenseItem | null>(null);
  const [open, setOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({
    balance_amount: 0,
    source_id: "",
    total_amount: 0,
  })
  const [paynowExpense, { isLoading:isPayNowExpenseLoading, error:isPayNowExpenseError }] = usePaynowExpenseMutation();
  const branchId = useSelector(BranchId);
  const zoduId = useSelector(ZoduId);
  // const [open, setOpen] = useState(false);
  const SOURCETYPE = "expense";


const buildPayload = (amount: number, paymentType: string) => {

    const payload = {
    zodu_id: zoduId,
    branch_id: branchId,
    source_type: SOURCETYPE,   // purchase | expense
    source_id: paymentData.source_id,       // expense_id / purchase_id
    paid_amount: amount,
    payment_type: paymentType,
    total_amount: paymentData.total_amount,
  } 

  return payload;

}

const handlePaymentSubmit = async(payload: {
  amount: number;
  paymentType: string;
}) => {
  console.log("Payment Payload:", payload);
 try {
  const updatedPayload = buildPayload(Number(payload.amount), payload.paymentType);
  await paynowExpense({ payload: updatedPayload });
  setPaymentData({
    balance_amount: 0,
    source_id: "",
    total_amount: 0,
  })


  setOpen(false);
  toast.success("Payment sucess")
  } catch (error) {
    console.error("Payment Error:", error);
    toast.error("Payment failed. Please try again.");
  }
};

  const handlePaymentClick = (item: ExpenseItem) => {
    const DueAmount = item.totalAmount - item.amountPaid;
    console.log(item, "DueAmount");
    if(DueAmount <=0 ){
      setPaymentData({
        balance_amount: 0,
        source_id: item.id,
        total_amount: item.totalAmount,
      })
    }else{
      setPaymentData({
        balance_amount: DueAmount,
        source_id: item.id,
        total_amount: item.totalAmount,
      })
    }
    setOpen(true);
};


  const handleRowClick = (item: ExpenseItem) => {
    console.log(item);
    setSelectedExpense(item);
  };

  const handleClose = () => setSelectedExpense(null);

  const handleDeleteModalClose = () => {
    setShowDeleteModal(false);
    setSelectedExpense(null);
  }
  //onEdit
  const handleEdit = (item: ExpenseItem) => {
    onEdit(item);
    handleClose();
  };

  //onDelete
  const handleDelete = (item: ExpenseItem) => {
    console.log(selectedExpense, "my item dood");
    onDelete(selectedExpense);
    handleDeleteModalClose();
  }
  const table = useReactTable<ExpenseItem>({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: {
      onRowClick: handleRowClick, // override with local handler
      onEdit,
      onDelete,
      onPaymentClick: handlePaymentClick,
    },
  });

  return (
    <>
      <Table size="small">
        <TableHead>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableCell
                  key={header.id}
                  align={header.column.columnDef.meta?.align ?? "left"}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>

        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} hover>
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  align={cell.column.columnDef.meta?.align ?? "left"}
                >
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/*CHatGPT SUcks here */}
      {/* <ExpenseModal
        open={!!selectedExpense}
        onClose={() => setSelectedExpense(null)}
        onEdit={onEdit}
        onDelete={() => setShowDeleteModal(true)}
        data={selectedExpense || undefined}
      />

      <DeleteConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => onDelete(selectedExpense!)}
        isDeleting={isDeleting}
      />

      <PaymentModal
        open={open}
        data={paymentData}
        onClose={() => setOpen(false)}
        onSubmit={() => toast.success("Payment successful")}
      /> */}
            <ExpenseModal
        open={!!selectedExpense}
        onClose={handleClose}
        onEdit={handleEdit}
        onDelete={() => setShowDeleteModal(true)}
        data={selectedExpense || undefined}
      />

      <DeleteConfirmModal
      open={showDeleteModal}
      onClose={handleDeleteModalClose} 
      onConfirm={handleDelete} 
      isDeleting={isDeleting}
      />

      <PaymentModal
  open={open}
  data={paymentData}
  onClose={() => setOpen(false)}
  onSubmit={handlePaymentSubmit}
/>;
    </>
  );
};

export default ExpensesTable;
