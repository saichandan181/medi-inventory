
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddPurchaseOrderForm } from "./AddPurchaseOrderForm";

interface AddPurchaseOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderCreated?: () => void;
}

export const AddPurchaseOrderDialog = ({ open, onOpenChange, onOrderCreated }: AddPurchaseOrderDialogProps) => {
  const handleSuccess = () => {
    if (onOrderCreated) {
      onOrderCreated();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
          <DialogDescription>
            Create a new order for medicine supplies.
          </DialogDescription>
        </DialogHeader>
        <AddPurchaseOrderForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};
