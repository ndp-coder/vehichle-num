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
  vehicleData: any;
  name?: string;
  mobileNumber: string;
  partName?: string;
  lookupType?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { vehicleData, name, mobileNumber, partName, lookupType }: RequestBody = await req.json();

    const googleServiceAccountJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
    const spreadsheetId = Deno.env.get("GOOGLE_SHEETS_SPREADSHEET_ID");

    if (!googleServiceAccountJson || !spreadsheetId) {
      console.error("Missing configuration:", {
        hasServiceAccount: !!googleServiceAccountJson,
        hasSpreadsheetId: !!spreadsheetId,
      });
      return new Response(
        JSON.stringify({
          error: "Google Sheets configuration missing",
          details: "Please configure GOOGLE_SERVICE_ACCOUNT_JSON and GOOGLE_SHEETS_SPREADSHEET_ID secrets"
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const vehicle = vehicleData?.vehicle || vehicleData?.vehicleInfo || vehicleData;
    const history = vehicleData?.history;
    const plate = vehicleData?.plate;

    const customerName = name || plate?.owner || "";
    const vin = vehicle?.vin || plate?.vin || "";
    const make = vehicle?.make || plate?.make || "";
    const model = vehicle?.model || plate?.model || "";
    const year = vehicle?.year || plate?.year || "";
    const bodyClass = vehicle?.bodyClass || vehicle?.bodyStyle || "";
    const vehicleType = vehicle?.vehicleType || "";
    const manufacturer = vehicle?.manufacturer || "";
    const fuelType = vehicle?.fuelType || vehicle?.fuel || "";
    const engineCylinders = vehicle?.engineCylinders || "";
    const displacement = vehicle?.displacement || "";
    const vehicleEngine = vehicle?.engine || "";
    const transmission = vehicle?.transmission || "";
    const driveType = vehicle?.driveType || "";

    const accidents = history?.accidents?.reported?.toString() || "";
    const ownership = history?.ownershipHistory?.owners?.toString() || "";
    const odometer = history?.odometer?.lastReading?.toString() || "";
    const serviceRecords = history?.serviceRecords?.count?.toString() || "";
    const recalls = history?.recalls?.open?.toString() || "";

    const row = [
      customerName,
      partName || "",
      lookupType || "",
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
      vehicleEngine,
      transmission,
      driveType,
      accidents,
      ownership,
      odometer,
      serviceRecords,
      recalls,
      mobileNumber,
    ];

    const serviceAccount = JSON.parse(googleServiceAccountJson);

    const now = Math.floor(Date.now() / 1000);
    const jwtHeader = { alg: "RS256", typ: "JWT" };
    const jwtClaimSet = {
      iss: serviceAccount.client_email,
      scope: "https://www.googleapis.com/auth/spreadsheets",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    };

    const base64url = (input: string) => {
      return btoa(input)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    };

    const headerEncoded = base64url(JSON.stringify(jwtHeader));
    const claimSetEncoded = base64url(JSON.stringify(jwtClaimSet));
    const signatureInput = `${headerEncoded}.${claimSetEncoded}`;

    const privateKeyPem = serviceAccount.private_key;
    const pemContents = privateKeyPem
      .replace(/-----BEGIN PRIVATE KEY-----/, "")
      .replace(/-----END PRIVATE KEY-----/, "")
      .replace(/\s/g, "");

    const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      binaryKey,
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256",
      },
      false,
      ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      new TextEncoder().encode(signatureInput)
    );

    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const signatureBase64 = base64url(String.fromCharCode(...signatureArray));
    const jwt = `${signatureInput}.${signatureBase64}`;

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to get access token", details: errorText }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { access_token } = await tokenResponse.json();

    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A:V:append?valueInputOption=USER_ENTERED`;

    const response = await fetch(appendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${access_token}`,
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
