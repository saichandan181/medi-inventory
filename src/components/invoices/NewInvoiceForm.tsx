
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createInvoice, InvoiceItem } from "@/services/inventoryService";
import { toast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getMedicines } from "@/services/inventoryService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const customerFormSchema = z.object({
  customer_name: z.string().min(2, "Customer name must be at least 2 characters"),
  customer_address: z.string().optional(),
  customer_gstin: z.string().optional(),
  customer_dl_number: z.string().optional(),
  customer_pan: z.string().optional(),
  invoice_date: z.date(),
  payment_type: z.enum(["cash", "credit"]),
});

const invoiceItemSchema = z.object({
  medicine_id: z.string().min(1, "Medicine is required"),
  batch_number: z.string().min(1, "Batch number is required"),
  expiry_date: z.date(),
  hsn_code: z.string().min(1, "HSN code is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  free_quantity: z.number().min(0, "Free quantity must be 0 or greater"),
  discount_percentage: z.number().min(0, "Discount must be 0 or greater").max(100, "Discount cannot exceed 100%"),
  mrp: z.number().min(0, "MRP must be 0 or greater"),
  rate: z.number().min(0, "Rate must be 0 or greater"),
  gst_percentage: z.number().min(0, "GST must be 0 or greater").max(100, "GST cannot exceed 100%"),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;
type InvoiceItemFormValues = z.infer<typeof invoiceItemSchema>;

interface NewInvoiceFormProps {
  onSuccess?: () => void;
}

export const NewInvoiceForm = ({ onSuccess }: NewInvoiceFormProps) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<(InvoiceItemFormValues & { medicineName: string })[]>([]);
  const [currentItem, setCurrentItem] = useState<InvoiceItemFormValues | null>(null);
  const [selectedMedicineId, setSelectedMedicineId] = useState<string>("");
  const [selectedMedicineName, setSelectedMedicineName] = useState<string>("");

  const { data: medicines } = useQuery({
    queryKey: ['medicines'],
    queryFn: getMedicines
  });

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      customer_name: "",
      customer_address: "",
      customer_gstin: "",
      customer_dl_number: "",
      customer_pan: "",
      invoice_date: new Date(),
      payment_type: "cash",
    },
  });

  const addItem = () => {
    if (!currentItem || !selectedMedicineId) return;
    setItems([...items, { ...currentItem, medicineName: selectedMedicineName }]);
    setCurrentItem(null);
    setSelectedMedicineId("");
    setSelectedMedicineName("");
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (medicineId: string) => {
    setSelectedMedicineId(medicineId);
    const medicine = medicines?.find(med => med.id === medicineId);
    if (medicine) {
      setSelectedMedicineName(medicine.name);
      setCurrentItem({
        medicine_id: medicineId,
        batch_number: medicine.batch_number,
        expiry_date: new Date(medicine.expiry_date),
        hsn_code: "", // You might want to store HSN codes in your medicine data
        quantity: 1,
        free_quantity: 0,
        discount_percentage: 0,
        mrp: medicine.unit_price,
        rate: medicine.unit_price,
        gst_percentage: 12, // Default GST rate, adjust as needed
      });
    }
  };

  const updateCurrentItem = (field: keyof InvoiceItemFormValues, value: any) => {
    if (!currentItem) return;
    
    const updatedItem = { ...currentItem, [field]: value };
    
    // Auto-calculate total if quantity or rate changes
    if (field === 'quantity' || field === 'rate' || field === 'discount_percentage' || field === 'gst_percentage') {
      const discountedRate = updatedItem.rate * (1 - updatedItem.discount_percentage / 100);
      const netAmount = discountedRate * updatedItem.quantity;
    }
    
    setCurrentItem(updatedItem);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      const discountedRate = item.rate * (1 - item.discount_percentage / 100);
      return sum + (discountedRate * item.quantity);
    }, 0);
  };

  const calculateTotalTax = () => {
    return items.reduce((sum, item) => {
      const discountedRate = item.rate * (1 - item.discount_percentage / 100);
      const baseAmount = discountedRate * item.quantity;
      return sum + (baseAmount * item.gst_percentage / 100);
    }, 0);
  };

  const calculateGrandTotal = () => {
    return calculateSubtotal() + calculateTotalTax();
  };

  const onSubmit = async (data: CustomerFormValues) => {
    if (items.length === 0) {
      toast({
        title: "No items added",
        description: "Please add at least one item to the invoice.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create invoice number format - current date + counter
      const invoiceNumber = `INV${format(new Date(), 'yyyyMMdd')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      const subtotal = calculateSubtotal();
      const totalTax = calculateTotalTax();
      const grandTotal = calculateGrandTotal();
      
      const invoiceData = {
        invoice_number: invoiceNumber,
        invoice_date: data.invoice_date.toISOString(),
        customer_name: data.customer_name,
        customer_address: data.customer_address || "",
        customer_gstin: data.customer_gstin || "",
        customer_dl_number: data.customer_dl_number || "",
        customer_pan: data.customer_pan || "",
        total_amount: subtotal,
        total_tax: totalTax,
        grand_total: grandTotal,
        payment_type: data.payment_type,
        notes: "",
        created_by: "system" // Usually this would be the authenticated user's ID
      };
      
      const invoiceItems = items.map(item => {
        const discountedRate = item.rate * (1 - item.discount_percentage / 100);
        const baseAmount = discountedRate * item.quantity;
        const gstAmount = baseAmount * item.gst_percentage / 100;
        
        return {
          medicine_id: item.medicine_id,
          batch_number: item.batch_number,
          expiry_date: item.expiry_date.toISOString().split('T')[0],
          hsn_code: item.hsn_code,
          quantity: item.quantity,
          free_quantity: item.free_quantity,
          discount_percentage: item.discount_percentage,
          mrp: item.mrp,
          rate: item.rate,
          gst_percentage: item.gst_percentage,
          gst_amount: gstAmount,
          total_amount: baseAmount + gstAmount
        };
      });
      
      await createInvoice(invoiceData, invoiceItems);
      
      toast({
        title: "Invoice created",
        description: `Invoice ${invoiceNumber} has been created successfully.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      form.reset();
      setItems([]);
      onSuccess?.();
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="customer_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter customer name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="invoice_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Invoice Date *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customer_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter customer address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Type *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customer_gstin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer GSTIN</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter customer GSTIN" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customer_pan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer PAN</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter customer PAN" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customer_dl_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer DL Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter customer DL number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Add Items</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medicine *</label>
                <Select 
                  value={selectedMedicineId} 
                  onValueChange={handleMedicineChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select medicine" />
                  </SelectTrigger>
                  <SelectContent>
                    {medicines?.map(medicine => (
                      <SelectItem key={medicine.id} value={medicine.id}>
                        {medicine.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {currentItem && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">HSN Code *</label>
                    <Input 
                      placeholder="HSN Code" 
                      value={currentItem.hsn_code} 
                      onChange={(e) => updateCurrentItem('hsn_code', e.target.value)}
                    />
                  </div>
                
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                    <Input 
                      type="number" 
                      min={1} 
                      value={currentItem.quantity} 
                      onChange={(e) => updateCurrentItem('quantity', parseInt(e.target.value))}
                    />
                  </div>
                
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rate (₹) *</label>
                    <Input 
                      type="number" 
                      min={0} 
                      step={0.01} 
                      value={currentItem.rate} 
                      onChange={(e) => updateCurrentItem('rate', parseFloat(e.target.value))}
                    />
                  </div>
                
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Free Qty</label>
                    <Input 
                      type="number" 
                      min={0} 
                      value={currentItem.free_quantity} 
                      onChange={(e) => updateCurrentItem('free_quantity', parseInt(e.target.value))}
                    />
                  </div>
                
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
                    <Input 
                      type="number" 
                      min={0} 
                      max={100} 
                      value={currentItem.discount_percentage} 
                      onChange={(e) => updateCurrentItem('discount_percentage', parseFloat(e.target.value))}
                    />
                  </div>
                
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">MRP (₹)</label>
                    <Input 
                      type="number" 
                      min={0} 
                      step={0.01} 
                      value={currentItem.mrp} 
                      onChange={(e) => updateCurrentItem('mrp', parseFloat(e.target.value))}
                    />
                  </div>
                
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST %</label>
                    <Input 
                      type="number" 
                      min={0} 
                      max={100} 
                      value={currentItem.gst_percentage} 
                      onChange={(e) => updateCurrentItem('gst_percentage', parseFloat(e.target.value))}
                    />
                  </div>
                </>
              )}
            </div>
            
            {currentItem && (
              <div className="flex justify-end mb-4">
                <Button type="button" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
            )}
            
            {items.length > 0 && (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicine</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Free</TableHead>
                      <TableHead>Rate (₹)</TableHead>
                      <TableHead>Discount%</TableHead>
                      <TableHead>GST%</TableHead>
                      <TableHead>Amount (₹)</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => {
                      const discountedRate = item.rate * (1 - item.discount_percentage / 100);
                      const baseAmount = discountedRate * item.quantity;
                      const gstAmount = baseAmount * item.gst_percentage / 100;
                      const totalAmount = baseAmount + gstAmount;
                      
                      return (
                        <TableRow key={index}>
                          <TableCell>{item.medicineName}</TableCell>
                          <TableCell>{item.batch_number}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.free_quantity}</TableCell>
                          <TableCell>₹{item.rate.toFixed(2)}</TableCell>
                          <TableCell>{item.discount_percentage}%</TableCell>
                          <TableCell>{item.gst_percentage}%</TableCell>
                          <TableCell>₹{totalAmount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeItem(index)}
                            >
                              <Trash className="h-4 w-4 text-accent-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {items.length > 0 && (
              <div className="flex justify-end mt-4 space-x-6">
                <div className="text-right">
                  <div className="flex justify-between gap-8">
                    <span className="font-medium">Subtotal:</span>
                    <span>₹{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between gap-8">
                    <span className="font-medium">GST:</span>
                    <span>₹{calculateTotalTax().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between gap-8 text-lg font-bold">
                    <span>Total:</span>
                    <span>₹{calculateGrandTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => form.reset()}>Reset</Button>
            <Button type="submit" disabled={isSubmitting || items.length === 0}>
              {isSubmitting ? "Creating..." : "Create Invoice"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
