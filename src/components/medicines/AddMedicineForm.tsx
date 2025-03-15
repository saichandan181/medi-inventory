
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createMedicine, CreateMedicineInput } from "@/services/inventoryService";
import { toast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, RotateCw } from "lucide-react";
import { useMedicineAI } from "@/hooks/useMedicineAI";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  generic_name: z.string().min(2, "Generic name must be at least 2 characters"),
  manufacturer: z.string().min(2, "Manufacturer must be at least 2 characters"),
  category: z.string().min(1, "Category is required"),
  batch_number: z.string().min(1, "Batch number is required"),
  expiry_date: z.date(),
  stock_quantity: z.coerce.number().min(0, "Stock quantity must be 0 or greater"),
  unit_price: z.coerce.number().min(0, "Unit price must be 0 or greater"),
  reorder_level: z.coerce.number().min(1, "Reorder level must be at least 1"),
  storage_condition: z.string().optional(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddMedicineFormProps {
  onSuccess?: () => void;
}

export const AddMedicineForm = ({ onSuccess }: AddMedicineFormProps) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [aiProcessing, setAiProcessing] = useState(false);
  const { getMedicineDetails, isLoading: isLoadingAI } = useMedicineAI();
  const [lastProcessedName, setLastProcessedName] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      generic_name: "",
      manufacturer: "",
      category: "",
      batch_number: "",
      expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      stock_quantity: 0,
      unit_price: 0,
      reorder_level: 10,
      storage_condition: "",
      description: "",
    },
  });

  // Function to handle autofill using Gemini AI
  const handleAutofill = async () => {
    if (nameInput && nameInput.trim().length >= 3 && nameInput !== lastProcessedName) {
      setAiProcessing(true);
      const details = await getMedicineDetails(nameInput);
      setAiProcessing(false);
      
      if (details) {
        form.setValue("generic_name", details.generic_name);
        form.setValue("manufacturer", details.manufacturer);
        form.setValue("category", details.category);
        setLastProcessedName(nameInput);
        
        toast({
          title: "Fields updated",
          description: "Medicine details have been auto-filled.",
        });
      }
    }
  };

  // Debounced autofill on name change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (nameInput && nameInput.trim().length >= 3 && nameInput !== lastProcessedName) {
        handleAutofill();
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [nameInput]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const medicineData: CreateMedicineInput = {
        name: data.name,
        generic_name: data.generic_name,
        manufacturer: data.manufacturer,
        category: data.category,
        batch_number: data.batch_number,
        expiry_date: data.expiry_date,
        stock_quantity: data.stock_quantity,
        unit_price: data.unit_price,
        reorder_level: data.reorder_level,
        storage_condition: data.storage_condition || "",
        description: data.description || "",
      };
      
      await createMedicine(medicineData);
      toast({
        title: "Medicine added",
        description: `${data.name} has been added to your inventory.`,
      });
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['lowStockMedicines'] });
      form.reset();
      setNameInput("");
      setLastProcessedName("");
      onSuccess?.();
    } catch (error) {
      console.error("Error adding medicine:", error);
      toast({
        title: "Error",
        description: "Failed to add medicine. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Medicine Name *</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input 
                      placeholder="Enter medicine name" 
                      {...field} 
                      value={nameInput || field.value}
                      onChange={(e) => {
                        field.onChange(e);
                        setNameInput(e.target.value);
                      }}
                    />
                  </FormControl>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    disabled={isLoadingAI || aiProcessing || !nameInput || nameInput.trim().length < 3}
                    onClick={handleAutofill}
                    className="flex-shrink-0"
                    title="Auto-fill medicine details"
                  >
                    <RotateCw className={cn("h-4 w-4", (isLoadingAI || aiProcessing) && "animate-spin")} />
                  </Button>
                </div>
                {aiProcessing && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Fetching medicine details...
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="generic_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Generic Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter generic name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="manufacturer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Manufacturer *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter manufacturer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Antibiotics">Antibiotics</SelectItem>
                    <SelectItem value="Analgesics">Analgesics</SelectItem>
                    <SelectItem value="Antihistamines">Antihistamines</SelectItem>
                    <SelectItem value="Antidiabetics">Antidiabetics</SelectItem>
                    <SelectItem value="Respiratory">Respiratory</SelectItem>
                    <SelectItem value="Cardiovascular">Cardiovascular</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="batch_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Batch Number *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter batch number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expiry_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Expiry Date *</FormLabel>
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
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
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
            name="stock_quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Quantity *</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit Price ($) *</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reorder_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reorder Level *</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="storage_condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Storage Condition</FormLabel>
                <FormControl>
                  <Input placeholder="E.g., Room temperature, refrigerated" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter additional details about the medicine"
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => form.reset()}>Reset</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Medicine"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
