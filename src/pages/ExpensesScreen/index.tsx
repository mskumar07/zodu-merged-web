import React, { useCallback, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { BranchId } from "@store/slices/userSlice";
import {
  Button,
  Box,
  Autocomplete,
  TextField,
  CircularProgress,
  Typography,
} from "@mui/material";
import ExpensesTable from "@components/ExpensesTable";
import ExpenseSummary from "./ExpenseSummary";
import TuneIcon from "@mui/icons-material/Tune";
import AddExpensesDrawerV2 from "@components/ExpensesTable/AddExpenseDrawerV2";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { useAddExpenseMutation, useDeleteExpenseMutation, useGetExpenseListQuery } from "@store/services/expenseApi";
import { toast } from "react-toastify";

interface ExpenseData {
  id: string;
  category: string;
  name: string;
  billDate: string;
  totalAmount: number;
  amountPaid: number;
  paymentMethod: string;
  allocatedTo: {
    name: string;
    department: string;
    initials: string;
    color: string;
  };
}

const ExpensesScreen: React.FC = () => {
  const [searchValue, setSearchValue] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ExpenseData | null>(null);

  const branchId = useSelector(BranchId);
  console.log("Branch ID in ExpensesScreen:", branchId);
  const { data, isLoading, isError } = useGetExpenseListQuery(branchId);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteExpense, { isLoading:isExpenseDeleting , error:isExpenseDeleteError }] = useDeleteExpenseMutation();

  console.log("mydata",data)

  // ✅ Transform API data to ExpenseData format
  const items: ExpenseData[] = useMemo(() => {
    const expenses = data?.expenses || [];

    return expenses.map((exp: any, index: number) => ({
      id: exp.expense_id,
      category: exp.expense_name || "Unknown",
      name: exp.expense_name || "Unnamed Expense",
      billDate: exp.updated_at,
      totalAmount: exp.total_amount,
      amountPaid: exp.paid_amount,
      paymentMethod: exp.payment_type, // No payment method field in API
      description: exp.description || "",
      images: exp.attachment_url || [],
      allocatedTo: {
        name: exp.description || "Not Assigned",
        department: "Accounts",
        initials: exp.expense_name?.slice(0, 2).toUpperCase() || "EX",
        color: ["#67e8f9", "#fbbf24", "#f87171", "#a78bfa"][index % 4],
      },
    }));
  }, [data]);


  const handleRowClick = useCallback((item: ExpenseData) => {
    setSelectedItem(item);
  }, []);

  const handleEditItem = useCallback((item: ExpenseData) => {
    console.log("Edit item:", item);
    setSelectedItem(item);
    setDrawerOpen(true);
  }, []);

  const handleDeleteItem = useCallback(async(item: ExpenseData) => {

    try{
     await deleteExpense(item.id).unwrap();
     toast.success("Expense deleted successfully");
    }catch(err){
      console.log(err)
      toast.error("Failed to delete expense");
    }
  }, []);

  const filteredItems = items.filter(
    (item) =>
      item.id.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.category.toLowerCase().includes(searchValue.toLowerCase())
  );

  const [addExpense, { isLoading:isExpenseAdding }] = useAddExpenseMutation();
  //Z-T94
const handleDrawerSubmit = async (values: any) => {
  try {
    const formData = new FormData();

    // These two should ideally come from your global state or props
    const zodu_id = "ZODU035";
    // const branch_id = "ZODU035B1"; // No longer static

    // ✅ Match backend field names exactly
    formData.append("zodu_id", zodu_id);
    formData.append("branch_id", branchId);
    formData.append("expense_name", values.expenseName);
    formData.append("category", values.category);
    formData.append("expense_date", values.date);
    formData.append("total_amount", values.totalAmount);
    formData.append("paid_amount", values.amountPaid);
    formData.append("description", values.description || "");

    // ✅ Convert items array to match backend’s format
    if (values.expenseItems?.length) {
      const formattedItems = values.expenseItems.map((item: any, index: number) => ({
        id: String(index + 1),
        name: item.itemName,
        qty: Number(item.qty),
        purchase_price: Number(item.price),
        total_price: Number(item.qty) * Number(item.price),
      }));
      formData.append("items", JSON.stringify(formattedItems));
    }

    // ✅ File upload
    if (values.attachments) {
      formData.append("attachment_url", values.attachments);
    }

    // ✅ API call
    console.log(formData);
     const res = await addExpense(formData).unwrap();
    console.log("✅ Expense added successfully:", res);

    setDrawerOpen(false);
  } catch (err) {
    console.error("❌ Failed to add expense:", err);
  }
};

    // ✅ Loader while fetching expense list
  if (isLoading) {
    return (
      <Box
        sx={{
          height: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // ✅ Error state
  if (isError) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography color="error">Failed to load expense data.</Typography>
      </Box>
    );
  }

  const summary = {
  total_expense: "12675.00",
  total_paid: "12675.00",
  total_unpaid: "-10238.00",
  this_month: "12675.00",
  last_month: "0",
};

  if(drawerOpen){
    return(
      <AddExpensesDrawerV2 // Z-T94
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          setSelectedItem(null)
        }}
        onSubmit={handleDrawerSubmit}
        expense={selectedItem}
        isExpenseAdding={isExpenseAdding}
      />
    )
  }
  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <ExpenseSummary data={data?.summary} />
      </Box>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
        <Autocomplete
          freeSolo
          options={items.map((item) => item.name)}
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
          onClick={() => setDrawerOpen(true)}
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
          Add Expenses
        </Button>
      </Box>

      <Box sx={{ backgroundColor: "white", padding: 2, borderRadius: 2 , height: "80vh", overflowY: "auto"}}>
        <ExpensesTable
          items={filteredItems}
          onRowClick={handleRowClick}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
          isDeleting={isExpenseDeleting}  
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
        />
      </Box>

      {/* <AddExpensesDrawerV2 // Z-T94
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          setSelectedItem(null)
        }}
        onSubmit={handleDrawerSubmit}
        expense={selectedItem}
        isExpenseAdding={isExpenseAdding}
      /> */}
    </Box>
  );
};

export default ExpensesScreen;
