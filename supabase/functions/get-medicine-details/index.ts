
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { medicineName } = await req.json();

    if (!medicineName) {
      return new Response(
        JSON.stringify({ error: "Medicine name is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching details for medicine: ${medicineName}`);

    // When dealing with common pain relievers like Dolo, we can provide accurate information
    if (medicineName.toLowerCase().includes("dolo") || 
        medicineName.toLowerCase().includes("pacimol") || 
        medicineName.toLowerCase().includes("paracetamol")) {
      return new Response(
        JSON.stringify({
          generic_name: "Paracetamol",
          manufacturer: medicineName.toLowerCase().includes("dolo") ? "Micro Labs" : "Various",
          category: "Analgesics"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // For antihistamines like Cetirizine
    if (medicineName.toLowerCase().includes("cetriz") || 
        medicineName.toLowerCase().includes("zyrtec")) {
      return new Response(
        JSON.stringify({
          generic_name: "Cetirizine",
          manufacturer: medicineName.toLowerCase().includes("zyrtec") ? "Johnson & Johnson" : "Various",
          category: "Antihistamines"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For antibiotics like Amoxicillin
    if (medicineName.toLowerCase().includes("amox") || 
        medicineName.toLowerCase().includes("mox")) {
      return new Response(
        JSON.stringify({
          generic_name: "Amoxicillin",
          manufacturer: medicineName.toLowerCase().includes("amoxil") ? "GSK" : "Various",
          category: "Antibiotics"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If GEMINI_API_KEY is available, try to get more accurate information
    if (GEMINI_API_KEY) {
      try {
        const prompt = `
You are a pharmaceutical database assistant. Based on the medicine name "${medicineName}", provide its generic name, manufacturer, and category.
Return ONLY a JSON object with these three fields: generic_name, manufacturer, and category.
If you're not sure about specific information, provide the most likely answer based on common medications.
Be precise and accurate with pharmaceutical information.
Example response format:
{
  "generic_name": "example generic name",
  "manufacturer": "example manufacturer",
  "category": "example category"
}
`;

        const response = await fetch("https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": GEMINI_API_KEY,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              topP: 0.8,
              topK: 40,
              maxOutputTokens: 1024,
            }
          }),
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
          try {
            const textContent = data.candidates[0].content.parts[0].text;
            const jsonMatch = textContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const medicineDetails = JSON.parse(jsonMatch[0]);
              console.log("Successfully processed medicine details from Gemini");
              return new Response(
                JSON.stringify(medicineDetails),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
          } catch (parseError) {
            console.error("Error parsing Gemini response:", parseError);
          }
        }
      } catch (apiError) {
        console.error("Error calling Gemini API:", apiError);
      }
    }

    // Fallback response with educated guess based on name patterns
    let category = "Other";
    if (medicineName.toLowerCase().includes("cough") || medicineName.toLowerCase().includes("cold")) {
      category = "Respiratory";
    } else if (medicineName.toLowerCase().includes("pain") || medicineName.toLowerCase().includes("ache")) {
      category = "Analgesics";
    } else if (medicineName.toLowerCase().includes("allerg")) {
      category = "Antihistamines";
    }

    return new Response(
      JSON.stringify({
        generic_name: medicineName,
        manufacturer: "Please update manually",
        category: category
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in get-medicine-details function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        generic_name: "Error occurred",
        manufacturer: "Please enter manually", 
        category: "Other"
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
