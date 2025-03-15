
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface MedicineDetails {
  generic_name: string;
  manufacturer: string;
  category: string;
}

export const useMedicineAI = () => {
  const [isLoading, setIsLoading] = useState(false);

  const getMedicineDetails = async (medicineName: string): Promise<MedicineDetails | null> => {
    if (!medicineName || medicineName.trim().length < 3) {
      return null;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-medicine-details", {
        body: { medicineName },
      });

      if (error) {
        console.error("Error fetching medicine details:", error);
        toast({
          title: "Error",
          description: "Failed to fetch medicine details. Please try again or fill the fields manually.",
          variant: "destructive",
        });
        return null;
      }

      return data as MedicineDetails;
    } catch (error) {
      console.error("Exception in getMedicineDetails:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again or fill the fields manually.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getMedicineDetails,
    isLoading,
  };
};
