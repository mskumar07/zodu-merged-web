// @components/PurchaseTable/PurchaseTable.tsx
import React, { useState, useEffect } from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Checkbox,
  Box,
  Typography,
  CircularProgress,
  Button,
} from "@mui/material";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import PurchaseModal from "./PurchaseModal";
import DeleteConfirmModal from "@components/DeleteMenuModal";
import { formatDateTime } from "@utils/util";

/* ---------------- TYPES ---------------- */

interface TablePurchaseItem {
  id: string;
  category: string;
  name: string;
  billDate: string;
  totalAmount: number;
  amountPaid: number;
  paymentMethod: string;
  allocatedTo: {
    name: string;
    initials: string;
    department: string;
    color: string;
  };
}

interface RawPurchase {
  purchase_id: string;
  branch_id: string;
  vendor_id: string;
  purchase_date: string;
  purchase_type: "Product" | "Other";
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  payment_id: string;
  notes: string;
  attachment_url: Array<{
    url: string;
    type?: string;
    fileName?: string;
    id?: string;
  }>;
  created_at: string;
  updated_at: string;
  vendor_name: string;
  company_name: string;
  vendor_phone: string;
  vendor_email: string;
  company_name: string;
  items: Array<{
    item_id: string;
    item_name: string;
    quantity: number;
    unit: string;
    price: number;
    total: number;
    category: string;
    category_id: number;
  }>;
  payment_history: Array<{
    payment_id: string;
    paid_amount: number;
    payment_mode: string;
    paid_date: string;
    created_at: string;
  }>;
}

// Modal Data Interface
interface ModalPurchaseData {
  id: string;
  purchase_id: string;
  vendor_name: string;
  category: string;
  purchase_date: string;
  purchase_type: "Product" | "Other";
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  payment_type: string;
  notes: string;
  attachment_url: any[];
  items: any[];
  payment_history: any[];
  updated_at: string;
}

/* ---------------- PROPS ---------------- */

interface PurchaseTableProps {
  items: TablePurchaseItem[];
  rawData?: RawPurchase[];
  isLoading?: boolean;
  isDeleting: boolean;
  onRowClick: (item: TablePurchaseItem) => void;
  onEdit: (item: TablePurchaseItem) => void;
  onDelete: (item: TablePurchaseItem) => void;
  onPayment: (item: TablePurchaseItem) => void;
}

const PurchaseTable: React.FC<PurchaseTableProps> = ({
  items,
  rawData = [],
  isLoading = false,
  isDeleting,
  onRowClick,
  onEdit,
  onDelete,
  onPayment,
}) => {
  const [selectedPurchase, setSelectedPurchase] =
    useState<RawPurchase | null>(null);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [modalData, setModalData] = useState<ModalPurchaseData | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);


const handleClose = () => setSelectedPurchase(null);

const handleDeleteModalClose = () => {
    setShowDeleteModal(false);
    setSelectedPurchase(null);
}
  //onEdit
const handleEdit = (item:   ExpenseItem) => {
    onEdit(item);
    handleClose();
  };

  //onDelete
const handleDelete = async () => {
    console.log(selectedPurchase, "my item dood");
    try{
          await onDelete(selectedPurchase as unknown as TablePurchaseItem);
          handleDeleteModalClose();
          setPurchaseModalOpen(false);
          setSelectedPurchase(null);
          setModalData(null);
    }catch(err){
      console.error("Error deleting item:", err);
    }
    console.log("Deleted item:", item);
  }

  // Transform raw data when selectedPurchase changes
  useEffect(() => {
    if (selectedPurchase) {
      const transformedData = transformRawForModal(selectedPurchase);
      console.log("Transformed modal data:", transformedData);
      setModalData(transformedData);
    }
  }, [selectedPurchase]);

  const handlePurchaseClick = (tableItem: TablePurchaseItem) => {
    // Find matching raw purchase
    const rawPurchase = rawData.find(
      (purchase) =>
        purchase.purchase_id === tableItem.id ||
        purchase.purchase_id.toString() === tableItem.id.toString()
    );

    if (!rawPurchase) {
      console.error("No matching raw data found for ID:", tableItem.id);
      // Use minimal fallback data
      const fallbackData: ModalPurchaseData = {
        id: tableItem.id,
        purchase_id: tableItem.id,
        vendor_name: tableItem.allocatedTo.name || "Unknown Vendor",
        category: tableItem.category,
        purchase_date: tableItem.billDate,
        purchase_type: "Product",
        total_amount: tableItem.totalAmount,
        paid_amount: tableItem.amountPaid,
        balance_amount: tableItem.totalAmount - tableItem.amountPaid,
        payment_type: tableItem.paymentMethod,
        notes: "",
        attachment_url: [],
        items: [
          {
            id: "1",
            name: tableItem.name,
            qty: 1,
            unit: "pc",
            purchase_price: tableItem.totalAmount,
            selling_price: 0,
            gst_tax: 0,
            total_price: tableItem.totalAmount,
          },
        ],
      };
      setModalData(fallbackData);
    } else {
      console.log("Found matching raw purchase:", rawPurchase);
      setSelectedPurchase(rawPurchase);
    }

    setPurchaseModalOpen(true);
    onRowClick(tableItem);
  };

  const columns: ColumnDef<TablePurchaseItem>[] = [
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
      header: () => <Typography color="text.secondary">Purchase Id</Typography>,
      cell: ({ row }) => (
        <Typography
          sx={{
            cursor: "pointer",
            textDecoration: "underline",
            color: "#1976d2",
          }}
          onClick={() => handlePurchaseClick(row.original)}
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

    /* ---------- RIGHT ALIGNED NUMERIC COLUMNS ---------- */

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
      cell: ({ row }) => {
        const due =
          row.original.totalAmount - row.original.amountPaid;
        if (due <= 0) return null;

        return (
          <Button
            size="small"
            variant="contained"
            onClick={() => onPayment(row.original)}
          >
            Pay Now
          </Button>
        );
      },
    },
  ];

  const table = useReactTable<TablePurchaseItem>({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

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
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center">
                <Typography color="text.secondary" py={3}>
                  No purchases found
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
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
            ))
          )}
        </TableBody>
      </Table>
      {console.log("PurchaseModal", purchaseModalOpen)}
      <PurchaseModal
        open={purchaseModalOpen}
        onClose={() => {
          setPurchaseModalOpen(false);
          setSelectedPurchase(null);
          setModalData(null);
        }}
        onEdit={handleEdit}
        onDelete={() => setShowDeleteModal(true)}
        // onDelete={handleDelete}
        data={modalData}
      />

      <DeleteConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => onDelete(selectedPurchase as any)}
        isDeleting={isDeleting}
      />
    </>
  );
};

const transformRawForModal = (rawPurchase: RawPurchase): ModalPurchaseData => {
  // Process attachment_url
  const attachment_url =
    rawPurchase.attachment_url?.map((attachment, index) => ({
      id: attachment.id || `file-${index}`,
      filename:
        attachment.fileName ||
        attachment.url?.split("/").pop()?.split("?")[0] ||
        `attachment-${index + 1}`,
      url: attachment.url,
      type: attachment.type,
    })) || [];

  // Process payment_history - transform to match ModalPaymentHistory format
  const payment_history =
    rawPurchase.payment_history?.map((payment) => ({
      payment_id: payment.payment_id,
      payment_mode: payment.payment_mode,
      payment_date: payment.created_at, // changed to createdAt due to format
      amount: payment.paid_amount,
    })) || [];

  // Get main payment type (use the first payment history entry or default)
  const payment_type =
    rawPurchase.payment_history?.[0]?.payment_mode || "Unknown";

  // Get vendor details
  const vendor_name = rawPurchase.vendor_name || "Unknown Vendor";

  // Generate initials for created_by
  const initials = vendor_name
    .split(" ")
    .map((word) => word[0] || "")
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Generate color for avatar
  const nameHash = vendor_name.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  const color = `hsl(${Math.abs(nameHash) % 360}, 70%, 60%)`;

  // Get category from first item
  const category = rawPurchase.items?.[0]?.category || "Uncategorized";

  return {
    id: rawPurchase.purchase_id,
    purchase_id: rawPurchase.purchase_id,
    vendor_name: vendor_name,
    category: category,
    purchase_date: rawPurchase.updated_at,
    purchase_type: rawPurchase.purchase_type || "Product",
    total_amount: rawPurchase.total_amount || 0,
    paid_amount: rawPurchase.paid_amount || 0,
    balance_amount: rawPurchase.balance_amount || 0,
    payment_type: payment_type,
    notes: rawPurchase.notes || "",
    attachment_url: attachment_url,
    items:
      rawPurchase.items?.map((item) => ({
        id: item.item_id,
        name: item.item_name,
        qty: item.quantity || 0,
        unit: item.unit,
        purchase_price: item.price,
        selling_price: 0,
        gst_tax: 0,
        total_price: item.total || 0,
      })) || [],
    payment_history: payment_history,
    created_by: {
      name: vendor_name,
      initials: initials || "V",
      department: rawPurchase.company_name || "Vendor",
      color: color,
    },
    vendor: {
      name: vendor_name,
      company_name: rawPurchase.company_name || "",
      vendor_phone: rawPurchase.vendor_phone || "",
      vendor_email: rawPurchase.vendor_email || "",
      vendor_address: "",
    },
  };
};

export default PurchaseTable;
