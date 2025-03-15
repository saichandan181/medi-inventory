
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddSupplierForm } from "./AddSupplierForm";
import { Supplier } from "@/services/inventoryService";

interface AddSupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSupplierAdded?: (supplier: Supplier) => void;
}

export const AddSupplierDialog = ({ open, onOpenChange, onSupplierAdded }: AddSupplierDialogProps) => {
  const handleSuccess = (supplier: Supplier) => {
    if (onSupplierAdded) {
      onSupplierAdded(supplier);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Supplier</DialogTitle>
          <DialogDescription>
            Enter the details of the new supplier below.
          </DialogDescription>
        </DialogHeader>
        <AddSupplierForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};
