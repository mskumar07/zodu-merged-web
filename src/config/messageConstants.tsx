interface MessageGroup {
  [key: string]: string;
}

interface MessageConstant {
  success: MessageGroup;
  pending: MessageGroup;
  failure: MessageGroup;
}

export const messageConstant: MessageConstant = {
  success: {
    PAID_SUCCESS: "Order paid successfully",
    SEND_TO_KDS: "Send ordered items to KDS",
    HOLD_SUCCESS: "Order hold successfully!",
    KOT_SUCCESS: "Order sent to kitchen successfully!",
    MENU_ADDED: "Menu item added successfully!",
    MENU_UPDATED: "Menu item updated successfully!",
    MENU_DELETED: "Menu item deleted successfully!",
  },
  pending: {
    ADDING_HOLD: "Placing order on hold...",
    ADDING_KOT: "Sending order to kitchen...",
  },
  failure: {
    PAYMENT_FAILED: "Payment failed, please try again",
    SEND_KOT_TO_KDS: "Please send the order to kitchen before proceeding to payment",
    NETWORK_ERROR: "Network error, please check your connection",
    NO_TABLE_SELECTED: "Please select a table to procced",
    NO_PRODUCT: "Please select a item  to proceed",
    HOLD_ERROR: "Failed to hold items, please try again",
    KOT_ERROR: "Failed to send order to kitchen, please try again",
    MENU_ADD_FAILED: "Failed to add menu item, please try again",
    MENU_UPDATE_FAILED: "Failed to update menu item, please try again",
    MENU_DELETE_FAILED: "Failed to delete menu item, please try again",
    IMAGE_UPLOAD_FAILED: "Image upload failed, please try again",
  },
};
