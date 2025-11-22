import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface VehicleData {
  vin?: string;
  make?: string;
  model?: string;
  year?: string;
  vehicleType?: string;
  bodyClass?: string;
  manufacturer?: string;
  fuelType?: string;
  engineCylinders?: string;
  displacement?: string;
  transmission?: string;
  driveType?: string;
}

interface PlateData {
  vin?: string | null;
  make?: string;
  model?: string;
  year?: string;
  owner?: string;
}

interface HistoryData {
  accidents?: {
    reported?: number;
  };
  ownershipHistory?: {
    owners?: number;
  };
  odometer?: {
    lastReading?: number;
  };
  serviceRecords?: {
    count?: number;
  };
  recalls?: {
    open?: number;
  };
}

interface RequestBody {
  vehicleData: {
    vehicle?: VehicleData;
    plate?: PlateData;
    history?: HistoryData;
  };
  mobileNumber: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { vehicleData, mobileNumber }: RequestBody = await req.json();

    const googleApiKey = Deno.env.get("GOOGLE_SHEETS_API_KEY");
    const spreadsheetId = Deno.env.get("GOOGLE_SHEETS_SPREADSHEET_ID");

    if (!googleApiKey || !spreadsheetId) {
      return new Response(
        JSON.stringify({ error: "Google Sheets configuration missing" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const vehicle = vehicleData.vehicle;
    const history = vehicleData.history;
    const plate = vehicleData.plate;

    const name = plate?.owner || "";
    const vin = vehicle?.vin || plate?.vin || "";
    const make = vehicle?.make || plate?.make || "";
    const model = vehicle?.model || plate?.model || "";
    const year = vehicle?.year || plate?.year || "";
    const bodyClass = vehicle?.bodyClass || "";
    const vehicleType = vehicle?.vehicleType || "";
    const manufacturer = vehicle?.manufacturer || "";
    const fuelType = vehicle?.fuelType || "";
    const engineCylinders = vehicle?.engineCylinders || "";
    const displacement = vehicle?.displacement || "";
    const transmission = vehicle?.transmission || "";
    const driveType = vehicle?.driveType || "";

    const accidents = history?.accidents?.reported?.toString() || "0";
    const ownership = history?.ownershipHistory?.owners?.toString() || "N/A";
    const odometer = history?.odometer?.lastReading?.toString() || "N/A";
    const serviceRecords = history?.serviceRecords?.count?.toString() || "0";
    const recalls = history?.recalls?.open?.toString() || "0";

    const row = [
      name,
      vin,
      make,
      model,
      year,
      bodyClass,
      vehicleType,
      manufacturer,
      fuelType,
      engineCylinders,
      displacement,
      transmission,
      driveType,
      accidents,
      ownership,
      odometer,
      serviceRecords,
      recalls,
      mobileNumber,
    ];

    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A:S:append?valueInputOption=USER_ENTERED&key=${googleApiKey}`;

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
