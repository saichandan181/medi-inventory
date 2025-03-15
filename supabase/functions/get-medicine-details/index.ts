
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const GEMINI_API_KEY = "AIzaSyC5uX4DEObRUXW6fsRdTFESeb1xl7K_nKQ";

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

    const prompt = `
You are a pharmaceutical database assistant. Based on the medicine name "${medicineName}", provide its generic name, manufacturer, and category.
Return ONLY a JSON object with these three fields: generic_name, manufacturer, and category.
If you're not sure about any information, provide the most likely answer based on common medications.
Example response format:
{
  "generic_name": "example generic name",
  "manufacturer": "example manufacturer",
  "category": "example category"
}
`;

    const response = await fetch("https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent", {
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
    console.log("Gemini API response:", JSON.stringify(data));

    // Extract JSON from the text response
    let medicineDetails;
    try {
      const textContent = data.candidates[0].content.parts[0].text;
      // Extract JSON from text if needed
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        medicineDetails = JSON.parse(jsonMatch[0]);
      } else {
        medicineDetails = JSON.parse(textContent);
      }
    } catch (error) {
      console.error("Error parsing Gemini response:", error);
      return new Response(
        JSON.stringify({ error: "Failed to parse medicine details" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(medicineDetails),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in get-medicine-details function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
