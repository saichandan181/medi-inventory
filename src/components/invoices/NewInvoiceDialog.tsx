
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NewInvoiceForm } from "./NewInvoiceForm";

interface NewInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewInvoiceDialog = ({ open, onOpenChange }: NewInvoiceDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
          <DialogDescription>
            Enter customer and product details to generate a GST invoice.
          </DialogDescription>
        </DialogHeader>
        <NewInvoiceForm onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
};
