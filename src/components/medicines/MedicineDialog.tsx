
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddMedicineForm } from "./AddMedicineForm";

interface MedicineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MedicineDialog = ({ open, onOpenChange }: MedicineDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Medicine</DialogTitle>
          <DialogDescription>
            Enter the details of the new medicine to add it to your inventory.
          </DialogDescription>
        </DialogHeader>
        <AddMedicineForm onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
};
