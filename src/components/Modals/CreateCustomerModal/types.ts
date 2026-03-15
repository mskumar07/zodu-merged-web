export interface CustomerFormData {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface CreateCustomerModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerFormData) => void;
}
