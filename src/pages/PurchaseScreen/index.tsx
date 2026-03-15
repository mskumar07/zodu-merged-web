// @components/PurchaseScreen.tsx (UPDATED)
import React, { useCallback, useState } from "react";
import {
  Button,
  Box,
  Autocomplete,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  useDeletePurchaseMutation,
  useGetPurchasesQuery,
} from "@store/services/menuApi";
import { mapPurchases } from "@utils/mapPurchaseData";
import AddPurchaseDrawerV2 from "@components/PurchaseTable/AddPurchaseDrawerV2";
import PurchaseTable from "@components/PurchaseTable";
import EditPurchaseDrawer from "@components/PurchaseTable/EditPurchaseDrawer";
import PaymentModal from "@components/ExpensesTable/PayNowModal";
import { usePaynowExpenseMutation } from "@store/services/expenseApi";
import { BranchId, ZoduId } from "@store/slices/userSlice";
import { useSelector } from "react-redux";
import PurchaseStats from "./PurchaseStats";

const PurchaseScreen: React.FC = () => {
  // const branchId = "ZODU035B1";

  const [searchValue, setSearchValue] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editPurchaseData, setEditPurchaseData] = useState<any>(null);
  const [purchaseFormMode, setPurchaseFormMode] = useState<"add" | "edit">("add");
  const [editDrawerOpen, setEditDrawerOpen] = useState(false); // NEW: Separate state for edit drawer
  const [purchaseToDelete, setPurchaseToDelete] = useState<any>(null);
  const [
    paynowExpense,
    { isLoading: isPayNowExpenseLoading, error: isPayNowExpenseError },
  ] = usePaynowExpenseMutation();

  const [paymentData, setPaymentData] = useState({
    balance_amount: 0,
    source_id: "",
    total_amount: 0,
  });
  const [open, setOpen] = useState(false);
  const SOURCETYPE = "purchase"; // For expenses
  const branchId = useSelector(BranchId);
  const zoduId = useSelector(ZoduId);
  /** -------------------------------
   *  API Mutations
   *  ------------------------------- */
  const { data, isLoading, isError, refetch } = useGetPurchasesQuery(branchId);
  console.log("Purchase Data:", data);
  const [deletePurchase, { isLoading: isDeleting }] =
    useDeletePurchaseMutation();

  /** -------------------------------
   *  Convert API → Table Format
   *  ------------------------------- */
  const tableItems = React.useMemo(() => {
    if (!data?.Data?.purchases) return [];
    return mapPurchases(data.Data.purchases);
  }, [data]);

  /** -------------------------------
   *  Table Event Handlers
   *  ------------------------------- */
  const handleRowClick = useCallback((item) => {
    console.log("Row clicked:", item);
  }, []);

  const handleEditItem = useCallback(
    (item: any) => {
      console.log("🔄 Edit item clicked:", item);

      // Find the raw purchase data
      const rawPurchase = data?.Data?.purchases?.find(
        (p: any) => p.purchase_id === item.id
      );

      if (rawPurchase) {
        console.log("✅ Raw purchase found:", {
          id: rawPurchase.purchase_id,
          vendor_name: rawPurchase.vendor_name,
          items_count: rawPurchase.items?.length,
          total_amount: rawPurchase.total_amount,
          paid_amount: rawPurchase.paid_amount,
        });

        // Pass the complete raw data to edit drawer
        setEditPurchaseData({
          ...rawPurchase,
          // Ensure consistent data structure
          purchase_id: rawPurchase.purchase_id,
          purchase_date: rawPurchase.purchase_date,
          purchase_type: rawPurchase.purchase_type,
          total_amount: rawPurchase.total_amount,
          paid_amount: rawPurchase.paid_amount,
          balance_amount: rawPurchase.balance_amount,
          vendor_name: rawPurchase.vendor_name,
          vendor_id: rawPurchase.vendor_id,
          company_name: rawPurchase.company_name,
          notes: rawPurchase.notes || "",
          items:
            rawPurchase.items?.map((item: any) => ({
              item_id: item.item_id,
              item_name: item.item_name,
              quantity: item.quantity,
              // unit: item.unit, OLD
              unit: item.unit_id,
              price: item.price,
              total: item.total,
              category: item.category,
              category_id: item.category_id,
            })) || [],
          attachment_url: rawPurchase.attachment_url || [],
          payment_type:
            rawPurchase.payment_type ||
            rawPurchase.payment_history?.[0]?.payment_mode ||
            "cash",
        });

        //  setEditDrawerOpen(true); // Open edit drawer
         setPurchaseFormMode("edit")
         setDrawerOpen(true);
        toast.info("Loading purchase data for editing...", {
          position: "top-right",
          autoClose: 1500,
        });
      } else {
        console.error("❌ No raw purchase found for item:", item);
        toast.error("Could not load purchase data for editing");
      }
    },
    [data]
  );

  const handleDeleteItem = useCallback(
    async(item: any) => {
      const rawPurchase = data?.Data?.purchases?.find(
        (p) => p.purchase_id === item.purchase_id
      );
      setPurchaseToDelete({
        ...item,
        purchase_type: rawPurchase?.purchase_type || "direct",
      });
      try {
      const result = await deletePurchase({
        purchaseId: rawPurchase.purchase_id,
        type: rawPurchase.purchase_type || "direct",
      }).unwrap();

      toast.success(result?.message || "Purchase deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      refetch();
    } catch (error: any) {

      toast.error(
        error?.data?.message || "Failed to delete purchase. Please try again.",
        {
          position: "top-right",
          autoClose: 4000,
        }
      );

    }
      // await handleConfirmDelete()
    },
    [data]
  );

  const handleDrawerSubmit = useCallback(
    (payload: any) => {
      console.log("Purchase Submitted:", payload);
      // Refresh data after add/edit
      refetch();
    },
    [refetch]
  );

  /** -------------------------------
   *  Delete Confirmation and Execution
   *  ------------------------------- */
  const handleConfirmDelete = useCallback(async () => {
    if (!purchaseToDelete) return;

    try {
      const result = await deletePurchase({
        purchaseId: purchaseToDelete.purchase_id,
        type: purchaseToDelete.purchase_type || "direct",
      }).unwrap();

      toast.success(result?.message || "Purchase deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      refetch();
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Failed to delete purchase. Please try again.",
        {
          position: "top-right",
          autoClose: 4000,
        }
      );
      console.error("Delete error:", error);
    } finally {
      setDeleteDialogOpen(false);
      setPurchaseToDelete(null);
    }
  }, [purchaseToDelete, deletePurchase, refetch, branchId]);

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setPurchaseToDelete(null);
    setEditPurchaseData(null);
  }, []);

  const buildPayload = (amount: number, paymentType: string) => {
    const payload = {
      zodu_id: zoduId,
      branch_id: branchId,
      source_type: SOURCETYPE, // purchase | expense
      source_id: paymentData.source_id, // expense_id / purchase_id
      paid_amount: amount,
      payment_type: paymentType,
      total_amount: paymentData.total_amount,
    };

    return payload;
  };

  const handlePaymentSubmit = async (payload: {
    amount: number;
    paymentType: string;
  }) => {
    console.log("Payment Payload:", payload);
    try {
      const updatedPayload = buildPayload(
        Number(payload.amount),
        payload.paymentType
      );
      await paynowExpense({ payload: updatedPayload });
      setPaymentData((prev) => ({
        ...prev,
        balance_amount: 0,
      }));

      setOpen(false);
      refetch();
      toast.success("Payment sucess");
    } catch (error) {
      console.error("Payment Error:", error);
      toast.error("Payment failed. Please try again.");
    }
  };

  const handlePaymentClick = (item: any) => {
    const DueAmount = item.totalAmount - item.amountPaid;
    console.log(item, "DueAmount");
    if (DueAmount <= 0) {
      setPaymentData({
        balance_amount: 0,
        source_id: item.id,
        total_amount: item.totalAmount,
      });
    } else {
      setPaymentData({
        balance_amount: DueAmount,
        source_id: item.id,
        total_amount: item.totalAmount,
      });
    }
    setOpen(true);
  };
  /** -------------------------------
   *  Search Filter
   *  ------------------------------- */
  const filteredItems = tableItems.filter((item) =>
    [item.id, item.name, item.category].some((field) =>
      field.toLowerCase().includes(searchValue.toLowerCase())
    )
  );

  /** -------------------------------
   *  UI
   *  ------------------------------- */
  if (isLoading) return <div>Loading purchases...</div>;
  if (isError) return <div>Failed to load purchases</div>;

  const {
    total_purchase_count,
    total_paid_amount,
    total_unpaid_amount,
    this_month_spent,
    last_month_spent,
  } = data?.Data || {};
  
  if (drawerOpen) {
    return (
      <AddPurchaseDrawerV2
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
        }}
        onSubmit={handleDrawerSubmit}
        initialData={editPurchaseData}
        mode={purchaseFormMode}
      />
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <PurchaseStats
          data={{
            total_purchase_count,
            total_paid_amount,
            total_unpaid_amount,
            this_month_spent,
            last_month_spent,
          }}
        />
      </Box>
      {/* 🔍 Search + Add */}
      <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
        <Autocomplete
          freeSolo
          options={tableItems.map((item) => item.name)}
          inputValue={searchValue}
          onInputChange={(event, newValue) => setSearchValue(newValue)}
          sx={{ width: 400, mr: 2 }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search by ID, product, or others..."
              variant="outlined"
              size="small"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <SearchIcon sx={{ color: "action.active", mr: 1 }} />
                    {params.InputProps.startAdornment}
                  </>
                ),
              }}
            />
          )}
        />

        <Box sx={{ display: "flex", flexGrow: 1, alignItems: "center" }}>
          <TuneIcon fontSize="small" sx={{ mr: 1 }} /> Filter Items
        </Box>

        <Button
          variant="contained"
          onClick={() =>{
            setEditPurchaseData(null)
            setPurchaseFormMode("add")
            setDrawerOpen(true)
            }}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            bgcolor: "#dc2626",
            "&:hover": { bgcolor: "#b91c1c" },
          }}
        >
          <Box
            sx={{
              border: 3,
              bgcolor: "white",
              display: "flex",
              borderRadius: 0.5,
              alignItems: "center",
              justifyContent: "center",
              p: "2px",
            }}
          >
            <AddIcon sx={{ color: "#dc2626", fontSize: 14 }} />
          </Box>
          Add Purchase
        </Button>
      </Box>
      {/* 📋 Table */}
      <Box sx={{ backgroundColor: "white", padding: 2, borderRadius: 2 }}>
        <PurchaseTable
          items={filteredItems}
          isDeleting={isDeleting}
          rawData={data?.Data?.purchases || []}
          onRowClick={handleRowClick}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
          onPayment={handlePaymentClick}
        />
      </Box>
      {/* ➕ Add Drawer */}
      {/* <AddPurchaseDrawerV2
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
        }}
        onSubmit={handleDrawerSubmit}
      /> */}
      {/* ✏️ Edit Drawer (NEW) */}
      <EditPurchaseDrawer
        open={editDrawerOpen}
        onClose={() => {
          setEditDrawerOpen(false);
          setEditPurchaseData(null);
        }}
        editData={editPurchaseData}
        onSubmit={handleDrawerSubmit}
      />
      <PaymentModal
        open={open}
        data={paymentData}
        onClose={() => setOpen(false)}
        onSubmit={handlePaymentSubmit}
      />
      ;{/* 🗑️ Delete Confirmation Dialog */}
      {/* <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete purchase{" "}
            <strong>{purchaseToDelete?.purchase_id}</strong>?
            <br />
            {/* <span style={{ color: "#d32f2f", fontWeight: 500 }}>
              {purchaseToDelete?.name && `Item: ${purchaseToDelete.name}`}
            </span> */}
            {/* <br />
            <span style={{ color: "#d32f2f", fontSize: "0.875rem" }}>
              This action cannot be undone.
            </span>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDeleteDialog}
            disabled={isDeleting}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? null : <DeleteIcon />}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>  */}
    </Box>
  );
};

export default PurchaseScreen;
