import React, { useEffect, useState } from "react";
import {
    Drawer,
    Box,
    Typography,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
    FormGroup,
    Avatar,
} from "@mui/material";
import {
    Close as CloseIcon,
    Upload as UploadIcon,
    Add as AddIcon,
} from "@mui/icons-material";

import type { SelectChangeEvent } from "@mui/material/Select";
import Button from "@components/Button";
import CreateNewItem from "@components/ExpensesTable/CreateNewItem";

import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import PurchaseItemRow from "./PurchaseItemRow";
import { useAddPurchaseMutation, useAddVendorMutation, useGetInventoryItemsQuery, useGetMenuCategoryQuery, useGetVendorsQuery } from "@store/services/menuApi";
import AddItemsDrawer from "./AddItemsDrawer";

interface PurchaseItem {
    // id: string;
    // count: number;
    // price: number;
    // productName: string;
    // total: number;
    id: string;
    productName: string;
    count: number;
    price: number;
    total: number;
    unit: string;
    purchase_price: number;
    selling_price: number;
    gst_tax: number;
    total_price: number;
}

interface PurchaseFormData {
    purchaseId: string;
    date: string;
    vendorName: string;
    purchaseItems?: PurchaseItem[];
    category: string;
    totalAmount: string;
    amountPaid: string;
    paymentMethod: string;
    attachments: string;
    description: string;
}

interface AddPurchaseDrawerProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: PurchaseFormData) => void;
}
const AddPurchaseDrawer: React.FC<AddPurchaseDrawerProps> = ({
    open,
    onClose,
    onSubmit,
}) => {
    const [formData, setFormData] = useState<PurchaseFormData>({
        purchaseId: "3275825687",
        date: dayjs().format("DD-MM-YYYY"),
        vendorName: "",
        category: "",
        totalAmount: "",
        purchaseItems: [],
        amountPaid: "",
        paymentMethod: "",
        attachments: "",
        description: "",
    });

    const branchID = "ZODU035B1";
    const { data: vendorResponse,
        isLoading: vendorsLoading,
        isError: vendorsError } = useGetVendorsQuery(branchID);
    const vendors = vendorResponse?.Data || [];

    const [activeTab, setActiveTab] = useState<"Product" | "Other">("Product");
    const [selectedExpenseItems, setSelectedExpenseItems] = useState<string[]>([]);
    const [addVendorOpen, setAddVendorOpen] = useState(false);
    const [addCategoryOpen, setAddCategoryOpen] = useState(false);
    const [addItemsOpen, setAddItemsOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [uploading, setUploading] = useState(false);
    const [createNewItemOpen, setCreateNewItemOpen] = useState(false);
    const [hasEnteredPaid, setHasEnteredPaid] = useState(false);
    const [addVendor, { isLoading: vendorSaving }] = useAddVendorMutation();
    const [categories, setCategories] = useState<string[]>([]);

    const { data: categoryData, isLoading: loadingCategories } = useGetMenuCategoryQuery({branchId:branchID,type:activeTab},{refetchOnMountOrArgChange:true});

    const [addPurchase, { isLoading: purchaseSaving }] = useAddPurchaseMutation();

    const onCreateNewItemClose = () => setCreateNewItemOpen(false);
    // Fixed payment methods for dropdown
    const paymentMethods = [
        "Credit Card",
        "Debit Card",
        "Cash",
        "Bank Transfer",
        "PayPal",
        "Check",
    ];

    const itemType = activeTab === "Product" ? "direct" : "indirect";
    const { data: inventoryResponse, isLoading: itemsLoading } =
        useGetInventoryItemsQuery({
            branchId: branchID,
            type: itemType,
        });
    const inventoryItems = inventoryResponse?.Data || [];

    useEffect(() => {
        if (categoryData?.Data?.length) {
            const names = categoryData.Data.map((cat: any) => cat.name);
            setCategories(names);
        }
    }, [categoryData]);

    const handlePurchaseItemsChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        // Toggle expense item selection (checked/unchecked)
        const { value } = event.target;
        setSelectedExpenseItems((prev) => {
            if (prev.includes(value)) {
                return prev.filter((item) => item !== value);
            }
            return [...prev, value];
        });
    };

    const handleInputChange = (field: keyof PurchaseFormData, value: string) => {
        // Update specific form field dynamically
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSelectChange = (
        event: SelectChangeEvent<string>,
        field: keyof PurchaseFormData
    ) => {
        // Handles controlled Select dropdowns (category, payment method, etc.)
        setFormData((prev) => ({
            ...prev,
            [field]: event.target.value,
        }));
    };
    // const categories = categoryData?.data || [];
    const handleAddCategory = () => {
        // Add a new custom category entered by the user
        if (newCategoryName.trim()) {
            setCategories((prev) => [...prev, newCategoryName.trim()]);
            setFormData((prev) => ({ ...prev, category: newCategoryName.trim() }));
            setNewCategoryName("");
            setAddCategoryOpen(false);
        }
    };

    const handleSubmitPurchase = async () => {
        const totalAmount =
            formData.purchaseItems?.reduce((acc, i) => acc + i.total, 0) || 0;

        const payload = {
            zodu_id: "ZODU035",               // or dynamic
            branch_id: "ZODU035B1",

            vendor: formData.vendorName,
            category: formData.category,
            purchase_date: formData.date,
            purchase_type: activeTab === "Product" ? "direct" : "indirect",

            total_amount: Number(totalAmount),
            paid_amount: Number(formData.amountPaid || 0),
            payment_type: formData.paymentMethod,

            notes: formData.description,
            attachment_url: formData.attachments,

            items: formData.purchaseItems?.map((item) => ({
                id: item.id,
                name: item.productName,
                qty: item.count,
                unit: item.unit ?? "unit",
                purchase_price: item.price,
                selling_price: item.selling_price ?? 0,
                gst_tax: item.gst_tax ?? 0,
                total_price: item.total,
            })) || [],
        };

        try {
            const res = await addPurchase(payload).unwrap();
            console.log("Purchase saved:", res);

            onClose();
        } catch (err) {
            console.error("❌ Error saving purchase:", err);
        }
    };

    const handleAddItems = () => {
        // Open "Add Items" modal dialog
        setAddItemsOpen(true);
    };

    // const handleAddItems = (items: any[]) => {
    //     const mapped = items.map((i) => ({
    //         id: i.item_id,
    //         productName: i.item_name,
    //         count: 1,
    //         price: Number(i.purchase_price),
    //         total: Number(i.purchase_price),

    //         unit: i.item_unit ?? "unit",
    //         selling_price: Number(i.selling_price ?? 0),
    //         gst_tax: Number(i.gst_tax ?? 0),
    //     }));

    //     setFormData((prev) => ({
    //         ...prev,
    //         purchaseItems: [...(prev.purchaseItems || []), ...mapped],
    //     }));
    // };

    const handleSubmit = () => {
        // Pass form data to parent or API handler
        onSubmit(formData);
        console.log("🧾 Purchase Form Data:", formData);

        // Reset form with a new expense ID and current date
        setFormData({
            purchaseId: Math.random().toString().substring(2, 12),
            date: dayjs().format("DD-MM-YYYY"),
            vendorName: "",
            category: "",
            totalAmount: "",
            amountPaid: "",
            paymentMethod: "",
            attachments: "",
            description: "",
            purchaseItems: [],
        });
        // date: new Date().toLocaleDateString("en-GB"),
        // Close modal after submit
        onClose();
    };

    // Map selected expense items into the expenseItems list
    const handleAddPurchaseItems = () => {
        // Keep only items that were selected by user
        const filteredItems = inventoryItems.filter((item: any) =>
            selectedExpenseItems.includes(item.id)
        );

        // Normalize to expenseItemsList format with defaults
        const mappedItems: PurchaseItem[] = filteredItems.map((item: any) => ({
            id: item.id,
            productName: item.name,
            count: 1,
            price: item.purchase_price,
            total: Number((1 * item.purchase_price).toFixed(2)),
        }));

        // Merge new items with existing ones while avoiding duplicates
        setFormData((prev) => {
            const existingItems = prev.purchaseItems || [];
            const newItems = mappedItems.filter(
                (item) => !existingItems.some((e) => e.id === item.id)
            );

            return { ...prev, purchaseItems: [...existingItems, ...newItems], };
        });

        setAddItemsOpen(false); // close modal
    };


    //add vendor form
    const [newVendor, setNewVendor] = useState({
        name: "",
        company: "",
        phone: "",
        email: "",
        address: "",

    });

    const handleVendorSubmit = async () => {
        try {
            const payload = {
                zodu_id: "ZODU035",
                branch_id: branchID,
                vendor_name: newVendor.name.trim(),
                vendor_phone: newVendor.phone.trim(),
                vendor_email: newVendor.email.trim(),
                vendor_address: newVendor.address.trim(),
                company_name: newVendor.company.trim(),
            };
            await addVendor(payload).unwrap()
            const res = await addVendor(payload).unwrap();

            // Update parent form to auto-select vendor
            setFormData((prev) => ({
                ...prev,
                vendorName: newVendor.name,
            }));

            // Reset
            setNewVendor({
                name: "",
                company: "",
                phone: "",
                email: "",
                address: "",
            });

            setAddVendorOpen(false);

        } catch (error) {
            console.error("Vendor add failed:", error);
        }
    };


    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: 400,
                    bgcolor: "white",
                    height: "100vh",
                },
            }}
        >
            <Box sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
            }}
            >
                {/* Header */}
                <Box sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                }}
                >
                    <Typography variant="h6" fontWeight="bold">
                        Add Purchase
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Scrollable Content */}
                <Box sx={{ flexGrow: 1, overflow: "auto", pr: 1 }}>
                    {/* Expense ID and User Info */}
                    {/* <Box sx={{ mb: 3 }}>
                        <Box sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                        }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Avatar
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        bgcolor: "#5b2339",
                                        fontSize: "14px",
                                    }}
                                >
                                    LD
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" fontWeight="medium">
                                        Leo Das
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Purchase Tracker
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box> */}

                    {/* Form Fields */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {/* DATE PICKER */}
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <Typography>Purchase Date</Typography>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    value={dayjs(formData.date, "DD-MM-YYYY")}
                                    onChange={(newDate) => {
                                        handleInputChange("date", dayjs(newDate).format("DD-MM-YYYY"));
                                    }}
                                    slotProps={{ textField: { size: "small", fullWidth: true } }}
                                />
                            </LocalizationProvider>
                        </Box>

                        {/* Purchase Type */}

                        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <Typography>
                                Purchase Type
                            </Typography>
                            <Box sx={{ display: "flex" }}>
                                {["Product", "Other"].map((tab) => (
                                    <Button
                                        key={tab}
                                        onClick={() => setActiveTab(tab as "Product" | "Other")}
                                        sx={{
                                            border: activeTab === tab ? "2px solid #dc2626" : "2px solid transparent",
                                            color: activeTab === tab ? "#dc2626" : "inherit",
                                            textTransform: "none",
                                            flex: 1,
                                            fontWeight: 600,
                                            bgcolor: "transparent",
                                            "&:hover": {
                                                bgcolor: "#f9f9f9",
                                            },
                                        }}
                                    >
                                        {tab}
                                    </Button>
                                ))}

                            </Box>
                            {/* {activeTab === "Other" && (
                                <TextField
                                    size="small"
                                    fullWidth
                                    placeholder="Specify Purchase Type"
                                    value={formData.category}
                                    onChange={(e) => handleInputChange("category", e.target.value)} />
                            )} */}
                        </Box>


                        {/* Vendor Name */}
                        <Box>
                            <Typography>
                                Vendor/Seller Name
                            </Typography>
                            <FormControl fullWidth size="small">
                                <InputLabel>Select Vendor</InputLabel>
                                <Select
                                    value={formData.vendorName}
                                    label="Select Vendor"
                                    onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: { maxHeight: 200 },
                                        },
                                    }}
                                >

                                    {vendorsLoading && <MenuItem disabled>Loading Vendors...</MenuItem>}
                                    {vendorsError && <MenuItem disabled>Error Loading</MenuItem>}
                                    {vendors.map((vendor: any) => (
                                        <MenuItem key={vendor.vendor_id} value={vendor.vendor_id}>
                                            {vendor.company_name}
                                        </MenuItem>
                                    ))}
                                    <MenuItem
                                        onClick={() => setAddVendorOpen(true)}
                                        sx={{
                                            color: "primary.main",
                                            "&:hover": { bgcolor: "primary.50" },
                                        }}
                                    >
                                        <AddIcon sx={{ mr: 1, fontSize: 20 }} />
                                        Add Vendor
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Box>


                        {/* Category */}
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <Typography>Category</Typography>
                            <FormControl fullWidth size="small">
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={formData.category}
                                    label="Category"
                                    onChange={(e) => handleSelectChange(e, "category")}
                                    MenuProps={{
                                        PaperProps: { sx: { maxHeight: 200 } },
                                    }}
                                >
                                    {loadingCategories && (
                                        <MenuItem disabled>Loading categories...</MenuItem>
                                    )}

                                    {!loadingCategories && categories.length === 0 && (
                                        <MenuItem disabled>No categories found</MenuItem>
                                    )}

                                    {categories.map((category, index) => (
                                        <MenuItem key={index} value={category}>
                                            {category}
                                        </MenuItem>
                                    ))}

                                    {/* Allow adding new category locally */}
                                    <MenuItem
                                        onClick={() => setAddCategoryOpen(true)}
                                        sx={{
                                            color: "primary.main",
                                            "&:hover": { bgcolor: "primary.50" },
                                        }}
                                    >
                                        <AddIcon sx={{ mr: 1, fontSize: 20 }} />
                                        Add Category
                                    </MenuItem>
                                </Select>

                            </FormControl>
                        </Box>

                        {/* Add PURCHASE item */}
                        <Button sx={{
                            color: "#ffffff",
                            bgcolor: "#dc2626",
                            "&:hover": {
                                bgcolor: "#b91c1c",
                            },
                        }} variant="outlined" onClick={() => setAddItemsOpen(true)}>
                            + Add Items
                        </Button>

                        {/* Amount Fields */}
                        {formData.purchaseItems?.map((item) => (
                            <PurchaseItemRow
                                key={item.id}
                                item={item}
                                onUpdate={(updated) => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        purchaseItems: prev.purchaseItems!.map((i) =>
                                            i.id === updated.id ? updated : i
                                        ),
                                    }));
                                }}
                                onDelete={(id) => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        purchaseItems: prev.purchaseItems!.filter((i) => i.id !== id),
                                    }));
                                }}
                            />
                        ))}

                        {/* Total Amount */}
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography>Total Amount</Typography>
                            <Typography>
                                ${formData.purchaseItems
                                    ?.reduce((acc, item) => acc + item.total, 0)
                                    .toFixed(2) || "0.00"}
                            </Typography>
                        </Box>

                        {/* Paid Amount & Balance */}

                        <Box>
                            <Typography>Paid Amount</Typography>
                            <Box sx={{ display: "flex", gap: 3 }}>
                                <TextField
                                    fullWidth
                                    placeholder="Enter Amount"
                                    type="number"
                                    value={formData.amountPaid}
                                    onChange={(e) => {
                                        handleInputChange("amountPaid", e.target.value);
                                        if (!hasEnteredPaid) setHasEnteredPaid(true);
                                    }}
                                />

                                <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: "2px" }}>
                                    {(() => {
                                        const total =
                                            formData.purchaseItems?.reduce((acc, i) => acc + i.total, 0) || 0;
                                        const paid = parseFloat(formData.amountPaid || "0");

                                        if (!hasEnteredPaid || !formData.amountPaid) {
                                            return (
                                                <>
                                                    <Typography>Balance</Typography>
                                                    <Typography sx={{ color: "#ff9f3f" }}>$0.00</Typography>
                                                </>
                                            );
                                        }

                                        const isOverpaid = paid > total;
                                        const balance = Math.abs(total - paid);

                                        return (
                                            <>
                                                <Typography>
                                                    {/* {isOverpaid ? "Extra Paid" : "Amount Due"} */}
                                                    {isOverpaid ? "Balance" : "Amount Due"}

                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        color: isOverpaid ? "green" : "#ff9f3f",
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {`$${balance.toFixed(2)}`}
                                                </Typography>
                                            </>
                                        );
                                    })()}
                                </Box>
                            </Box>
                        </Box>




                        {/* Payment Method */}
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <Typography>Payment Type</Typography>
                            <FormControl fullWidth size="small">
                                <InputLabel>Payment Method</InputLabel>
                                <Select
                                    value={formData.paymentMethod}
                                    label="Payment Method"
                                    onChange={(e) => handleSelectChange(e, "paymentMethod")}
                                >
                                    {paymentMethods.map((method) => (
                                        <MenuItem key={method} value={method}>
                                            {method}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>


                        {/* Attachments */}
                        <Box sx={{ position: "relative", display: "flex", flexDirection: "column", gap: "2px" }}>
                            <Typography>Attachments</Typography>
                            <input
                                type="file"
                                id="upload-file"
                                hidden
                                onChange={async (e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setUploading(true);
                                        const file = e.target.files[0];

                                        // Fake upload simulation (replace with API upload)
                                        await new Promise((res) => setTimeout(res, 2000));

                                        setFormData((prev) => ({
                                            ...prev,
                                            attachments: file.name,
                                        }));
                                        setUploading(false);
                                    }
                                }}
                            />
                            <TextField
                                fullWidth
                                placeholder="Attach Invoice/Bill"
                                value={uploading ? "Uploading..." : formData.attachments}
                                size="small"
                                InputProps={{
                                    readOnly: true,
                                    endAdornment: (
                                        <IconButton component="label" htmlFor="upload-file">
                                            <UploadIcon
                                                sx={{ color: uploading ? "grey.400" : "action.active" }}
                                            />
                                        </IconButton>
                                    ),
                                }}
                            />
                        </Box>

                        {/* Notes */}
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <Typography>Notes</Typography>
                            <TextField
                                fullWidth
                                placeholder="Description"
                                value={formData.description}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                                multiline
                                rows={4}
                                size="small"
                                sx={{ mb: 2 }}
                            />
                        </Box>
                    </Box>
                </Box>

                {/* Submit Button - Fixed at bottom */}
                <Box sx={{ pt: 2, borderTop: "1px solid #f0f0f0" }}>
                    <Button
                        variant="contained"
                        fullWidth
                        disabled={purchaseSaving}
                        onClick={handleSubmitPurchase}
                        sx={{
                            bgcolor: "#dc2626",
                            "&:hover": {
                                bgcolor: "#b91c1c",
                            },
                        }}
                    >
                        Save Purchase
                    </Button>
                </Box>
            </Box>

            {/* Add Item Modal */}
            <Drawer
                anchor="bottom"
                open={addItemsOpen}
                onClose={() => setAddItemsOpen(false)}
                PaperProps={{
                    sx: {
                        width: 400,
                        bgcolor: "white",
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                        p: 0,
                        ml: "auto",
                    },
                }}
            >
                <Box sx={{ p: 3 }}>
                    {/* Header */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 3,
                        }}
                    >
                        <Typography variant="h6" fontWeight="bold">
                            Add Items
                        </Typography>
                        <IconButton
                            onClick={() => setAddItemsOpen(false)}
                            size="small"
                            sx={{ color: "grey.500" }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* Previosuly added categories */}
                    <FormGroup>
                        <AddItemsDrawer
                            open={addItemsOpen}
                            onClose={() => setAddItemsOpen(false)}
                            inventoryItems={inventoryItems}
                            onAddItems={(items) => {
                                handleAddItems(items);
                                setAddItemsOpen(false);
                            }} 
                        />
                    </FormGroup>
                </Box>
            </Drawer>

            {/* Add VENDOR Drawer */}
            <Drawer
                anchor="bottom"
                open={addVendorOpen}
                onClose={() => setAddVendorOpen(false)}
                PaperProps={{
                    sx: {
                        width: 400,
                        bgcolor: "white",
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                        p: 0,
                        ml: "auto",
                    },
                }}
            >
                <Box sx={{ p: 3 }}>
                    {/* Header */}
                    <Box sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 3,
                        }}
                    >
                        <Typography variant="h6" fontWeight="bold" >
                            Add New Vendor
                        </Typography>
                        <IconButton
                            onClick={() => setAddVendorOpen(false)}
                            size="small"
                            sx={{ color: "grey.500" }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>


                    {/* FORM FIELD TO ADD VENDOR */}
                    {/* Category Name Input */}
                    <Typography>Vendor Name</Typography>
                    <TextField
                        fullWidth
                        placeholder="Vendor Name"
                        value={newVendor.name}
                        onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                        size="small"
                        sx={{ mb: 3 }}
                    />
                    <Typography>Phone Number</Typography>
                    <TextField
                        fullWidth
                        placeholder="Phone Number"
                        size="small"
                        value={newVendor.phone}
                        onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                        sx={{ mb: 3 }}
                    />

                    <Typography>Email Address</Typography>
                    <TextField
                        fullWidth
                        placeholder="Enter Email Address"
                        value={newVendor.email}
                        onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                        size="small"
                        sx={{ mb: 3 }}
                    />

                    <Typography>Address</Typography>
                    <TextField
                        fullWidth
                        placeholder="Enter Address"
                        value={newVendor.address}
                        onChange={(e) => setNewVendor({ ...newVendor, address: e.target.value })}
                        size="small"
                        sx={{ mb: 3 }}
                    />
                    <Typography>Company Name</Typography>
                    <TextField
                        fullWidth
                        placeholder="Enter Company Name"
                        size="small"
                        value={newVendor.company}
                        onChange={(e) => setNewVendor({ ...newVendor, company: e.target.value })}
                        sx={{ mb: 3 }}
                    />


                    {/* Add Category Button */}
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleVendorSubmit}
                        disabled={!newVendor.name.trim() || vendorSaving}
                        sx={{
                            bgcolor: "#dc2626",
                            "&:hover": { bgcolor: "#b91c1c" },
                            "&:disabled": { bgcolor: "#f5f5f5", color: "#999" },
                        }}
                    >
                        {vendorSaving ? "Saving..." : "Save Vendor"}
                    </Button>
                </Box>
            </Drawer>


            {/* Add Category Drawer */}
            <Drawer
                anchor="bottom"
                open={addCategoryOpen}
                onClose={() => setAddCategoryOpen(false)}
                PaperProps={{
                    sx: {
                        width: 400,
                        bgcolor: "white",
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                        p: 0,
                        ml: "auto",
                    },
                }}
            >
                <Box sx={{ p: 3 }}>
                    {/* Header */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 3,
                        }}
                    >
                        <Typography variant="h6" fontWeight="bold">
                            Add Category
                        </Typography>
                        <IconButton
                            onClick={() => setAddCategoryOpen(false)}
                            size="small"
                            sx={{ color: "grey.500" }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* Category Name Input */}
                    <TextField
                        fullWidth
                        placeholder="Category Name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        size="small"
                        sx={{ mb: 3 }}
                        onKeyPress={(e) => {
                            if (e.key === "Enter") {
                                handleAddCategory();
                            }
                        }}
                    />

                    {/* Add Category Button */}
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleAddCategory}
                        disabled={!newCategoryName.trim()}
                        sx={{
                            bgcolor: "#dc2626",
                            "&:hover": { bgcolor: "#b91c1c" },
                            "&:disabled": { bgcolor: "#f5f5f5", color: "#999" },
                        }}
                    >
                        Add Category
                    </Button>
                </Box>
            </Drawer>

            <>
                {/* Modal with Form */}
                <CreateNewItem
                    open={createNewItemOpen}
                    onClose={onCreateNewItemClose}
                />
            </>
        </Drawer>
    );
};

export default AddPurchaseDrawer;
