import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  vehicleData: any;
  name?: string;
  mobileNumber: string;
  email?: string;
  partName?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { vehicleData, name, mobileNumber, email, partName }: RequestBody = await req.json();

    const apiKey = Deno.env.get("VITE_GOOGLE_SHEETS_API_KEY");
    const spreadsheetId = Deno.env.get("VITE_GOOGLE_SHEETS_SPREADSHEET_ID");

    if (!apiKey || !spreadsheetId) {
      console.error("Missing configuration:", {
        hasApiKey: !!apiKey,
        hasSpreadsheetId: !!spreadsheetId,
      });
      return new Response(
        JSON.stringify({
          error: "Google Sheets configuration missing",
          details: "Please configure VITE_GOOGLE_SHEETS_API_KEY and VITE_GOOGLE_SHEETS_SPREADSHEET_ID"
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const vehicle = vehicleData?.vehicle || vehicleData?.vehicleInfo || vehicleData;
    const plate = vehicleData?.plate;

    const customerName = name || "";
    const phoneNumber = mobileNumber || "";
    const customerEmail = email || "";
    const make = vehicle?.make || plate?.make || "";
    const model = vehicle?.model || plate?.model || "";
    const year = vehicle?.year || plate?.year || "";
    const part = partName || "";

    const row = [
      customerName,
      phoneNumber,
      customerEmail,
      year,
      make,
      model,
      part,
    ];

    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A:G:append?valueInputOption=USER_ENTERED&key=${apiKey}`;

    const response = await fetch(appendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: [row],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Sheets API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to save to Google Sheets", details: errorText }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const result = await response.json();

    return new Response(
      JSON.stringify({ success: true, result }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
