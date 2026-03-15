// import React, { useState, useMemo } from "react";
// import { Box, Button, Typography } from "@mui/material";
// import AddIcon from "@mui/icons-material/Add";
// import { useSelector } from "react-redux";
// import { BranchId, ZoduId } from "@store/slices/userSlice";
// import {
//   useGetChecklistDashboardQuery,
//   useUpdateChecklistStatusMutation,
// } from "@store/services/checklistApi";
// import KanbanBoard from "./KanbanBoard";
// import type { ChecklistItem, BoardStatus } from "@types/checklist";
// import { toast } from "react-toastify";
// import type { ChecklistFormData } from "./AddCheckListModel";
// import AddChecklistModal from "./AddCheckListModel";
// import ChecklistDetailsModal from "../../components/CheckList/ChecklistDetailsModal";
// import { getRandomColor } from "./helpers/getRandomColor";
// import { mapChecklistStatus } from "./helpers/mapChecklistStatus";

// const ChecklistScreen: React.FC = () => {
//   const [modalOpen, setModalOpen] = useState(false);
//   const [detailsModalOpen, setDetailsModalOpen] = useState(false);
//   const [selectedChecklist, setSelectedChecklist] =
//     useState<ChecklistItem | null>(null);

//   const branchId = useSelector(BranchId) || "ZODU035B1";
//   const zoduId = useSelector(ZoduId) || "ZODU035";
//   const userId = "8f0d9c7e-6a8b-4f6d-b7e1-4b9bdfc11234";

//   const {
//     data: checklistData,
//     isLoading: isChecklistLoading,
//     error: checklistError,
//     refetch: refetchChecklists,
//   } = useGetChecklistDashboardQuery({
//     zoduId,
//     branchId,
//     userId,
//     limit: 100,
//     offset: 0,
//   });

//   const [updateChecklistStatus] = useUpdateChecklistStatusMutation();

//   // Helper function to get initials from name
//   const getInitials = (name: string): string => {
//     if (!name) return "??";
//     return name
//       .split(" ")
//       .map((n) => n[0])
//       .join("")
//       .toUpperCase()
//       .slice(0, 2);
//   };

//   // Transform API data for all views
//   const transformedChecklists = useMemo(() => {
//     if (!checklistData?.Data?.checklists) return [];

//     return checklistData.Data.checklists.map(
//       (checklist: any): ChecklistItem => {
//         // Map the API status to frontend status
//         const checklistStatus = checklist.due?.status || "pending";
//         const frontendStatus = mapChecklistStatus(checklistStatus);

//         // Calculate progress
//         const totalTasks = checklist.total_tasks || 0;
//         const completedTasks = checklist.completed_tasks || 0;
//         const progress =
//           totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

//         // Get due date
//         let dueDate = "";
//         if (checklist.schedule?.start_date) {
//           dueDate = checklist.schedule.start_date;
//         } else if (checklist.due?.scheduled_for) {
//           dueDate = checklist.due.scheduled_for.split("T")[0];
//         }

//         // Transform assignees
//         const assignees =
//           checklist.assignees?.map((assignee: any) => ({
//             id: assignee.user_id || assignee.id || "",
//             name: assignee.name || "Unknown User",
//             initials: getInitials(assignee.name || ""),
//             color: getRandomColor(),
//           })) || [];

//         // Transform tasks
//         const tasks =
//           checklist.tasks?.map((task: any) => ({
//             id: task.id,
//             title: task.title,
//             description: task.description,
//             status: task.status,
//             custom_id: task.custom_id,
//             notes: task.notes || [],
//             voice_url: task.voice_url,
//             reference_image_url: task.reference_image_url || [],
//           })) || [];

//         return {
//           id: checklist.id,
//           checklist_id: checklist.custom_id,
//           title: checklist.name,
//           description: checklist.description || "",
//           category: checklist.category_name || "Uncategorized",
//           status: frontendStatus,
//           progress: progress,
//           total_tasks: totalTasks,
//           completed_tasks: completedTasks,
//           overdue_tasks: checklist.overdue_tasks || 0,
//           pending_tasks: checklist.pending_tasks || 0,
//           due_date: dueDate,
//           assignees: assignees,
//           tasks: tasks,
//           schedule: checklist.schedule,
//           created_at: checklist.created_at,
//           category_id: checklist.category_id,
//         };
//       }
//     );
//   }, [checklistData]);

//   const handleStatusUpdate = async (
//     itemId: string,
//     newStatus: BoardStatus,
//     oldStatus: BoardStatus
//   ) => {
//     try {
//       await updateChecklistStatus({
//         checklistId: itemId,
//         status: newStatus,
//       }).unwrap();
//       await refetchChecklists();
//     } catch (error) {
//       console.error("Status update error:", error);
//       throw error;
//     }
//   };

//   const handleAddChecklistClick = () => {
//     setModalOpen(true);
//   };

//   const handleModalClose = () => {
//     setModalOpen(false);
//   };

//   const handleChecklistClick = (checklist: ChecklistItem) => {
//     setSelectedChecklist(checklist);
//     setDetailsModalOpen(true);
//   };

//   const handleDetailsModalClose = () => {
//     setDetailsModalOpen(false);
//     setSelectedChecklist(null);
//   };

//   const handleChecklistSubmit = async (data: ChecklistFormData) => {
//     try {
//       // TODO: Implement create checklist API call
//       console.log("New checklist data:", data);
//       toast.success("Checklist created successfully!");
//       refetchChecklists(); // Refresh the data
//       setModalOpen(false);
//     } catch (error) {
//       toast.error("Failed to create checklist");
//       console.error("Create checklist error:", error);
//     }
//   };

//   const handleTaskUpdate = async (
//     checklistId: string,
//     taskId: string,
//     status: "completed" | "pending"
//   ) => {
//     try {
//       refetchChecklists(); // Refresh the data
//     } catch (error) {
//       toast.error("Failed to update task");
//       console.error("Update task error:", error);
//     }
//   };

//   const dashboardStats = useMemo(() => {
//     const stats = {
//       total: transformedChecklists.length,
//       pending: transformedChecklists.filter((item) => item.status === "pending" || item.status === "overdue").length,
//       active: transformedChecklists.filter((item) => item.status === "active").length,
//       testing: transformedChecklists.filter((item) => item.status === "testing").length,
//       closed: transformedChecklists.filter((item) => item.status === "closed").length,
//     };
//     return stats;
//   }, [transformedChecklists]);

//   return (
//     <Box sx={{ width: "100%", maxWidth: "100%", overflow: "visible" }}>
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           mb: 1.25,
//           flexWrap: "wrap",
//           gap: 1.25,
//         }}>
//         <Box sx={{ minWidth: 0, flex: "1 1 auto" }}>
//           <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.15, fontSize: "1.35rem" }}>
//             Task Board
//           </Typography>
//           <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
//             Manage and track your checklists with drag-and-drop
//           </Typography>
//         </Box>
//         <Button
//           variant="contained"
//           onClick={handleAddChecklistClick}
//           startIcon={<AddIcon sx={{ fontSize: 18 }} />}
//           sx={{
//             bgcolor: "#3b82f6",
//             "&:hover": { bgcolor: "#2563eb" },
//             textTransform: "none",
//             fontWeight: 600,
//             flexShrink: 0,
//             py: 0.65,
//             px: 1.75,
//             fontSize: "0.875rem",
//           }}>
//           Add Checklist
//         </Button>
//       </Box>

//       <KanbanBoard
//         data={transformedChecklists}
//         isLoading={isChecklistLoading}
//         onStatusUpdate={handleStatusUpdate}
//         onCardClick={handleChecklistClick}
//         stats={dashboardStats}
//       />

//       {/* Add Checklist modal */}
//       <AddChecklistModal
//         open={modalOpen}
//         onClose={handleModalClose}
//         onSubmit={handleChecklistSubmit}
//         branchId={branchId}
//         zoduId={zoduId}
//         userId={userId}
//       />

//       {/* Checklist Details modal */}
//       <ChecklistDetailsModal
//         open={detailsModalOpen}
//         onClose={handleDetailsModalClose}
//         checklist={selectedChecklist}
//         onTaskUpdate={handleTaskUpdate}
//       />
//     </Box>
//   );
// };

// export default ChecklistScreen;

import React from "react";
import { Routes, Route } from "react-router-dom";
import ChecklistPage from "@components/CheckListV2";
import AddChecklistModal from "@components/CheckListV2/AddCheckList";
import EditChecklistModal from "@components/CheckListV2/EditCheckList";

const ChecklistScreen: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ChecklistPage />} />
      <Route path="create/new" element={<AddChecklistModal />} />
      <Route path="edit/:id" element={<EditChecklistModal />} />
    </Routes>
  );
};

export default ChecklistScreen;
