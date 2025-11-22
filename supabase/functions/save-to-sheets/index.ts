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

    const serviceAccountJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
    const spreadsheetId = Deno.env.get("GOOGLE_SHEETS_SPREADSHEET_ID");

    if (!serviceAccountJson || !spreadsheetId) {
      const errorMessage = "Google Sheets configuration missing";
      console.error(errorMessage, {
        hasServiceAccount: !!serviceAccountJson,
        hasSpreadsheetId: !!spreadsheetId,
        timestamp: new Date().toISOString(),
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          details: "Please configure GOOGLE_SERVICE_ACCOUNT_JSON and GOOGLE_SHEETS_SPREADSHEET_ID",
          timestamp: new Date().toISOString(),
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

    console.log("Preparing to save data:", {
      row,
      spreadsheetId: spreadsheetId.substring(0, 10) + "...",
      timestamp: new Date().toISOString(),
    });

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountJson);
    } catch (parseError) {
      const errorMessage = "Failed to parse service account JSON";
      console.error(errorMessage, {
        error: parseError.message,
        timestamp: new Date().toISOString(),
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          details: parseError.message,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

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
    if (!privateKeyPem) {
      const errorMessage = "Private key missing from service account";
      console.error(errorMessage, {
        timestamp: new Date().toISOString(),
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          details: "Service account JSON is missing private_key field",
          timestamp: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const pemContents = privateKeyPem
      .replace(/-----BEGIN PRIVATE KEY-----/, "")
      .replace(/-----END PRIVATE KEY-----/, "")
      .replace(/\s/g, "");

    let binaryKey;
    let cryptoKey;
    try {
      binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));
      cryptoKey = await crypto.subtle.importKey(
        "pkcs8",
        binaryKey,
        {
          name: "RSASSA-PKCS1-v1_5",
          hash: "SHA-256",
        },
        false,
        ["sign"]
      );
    } catch (keyError) {
      const errorMessage = "Failed to import private key";
      console.error(errorMessage, {
        error: keyError.message,
        timestamp: new Date().toISOString(),
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          details: keyError.message,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let signatureBuffer;
    try {
      signatureBuffer = await crypto.subtle.sign(
        "RSASSA-PKCS1-v1_5",
        cryptoKey,
        new TextEncoder().encode(signatureInput)
      );
    } catch (signError) {
      const errorMessage = "Failed to sign JWT";
      console.error(errorMessage, {
        error: signError.message,
        timestamp: new Date().toISOString(),
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          details: signError.message,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const signatureBase64 = base64url(String.fromCharCode(...signatureArray));
    const jwt = `${signatureInput}.${signatureBase64}`;

    console.log("JWT generated successfully, exchanging for access token...");

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
      const errorMessage = "Failed to get OAuth2 access token";
      console.error(errorMessage, {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText,
        timestamp: new Date().toISOString(),
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          details: `Status ${tokenResponse.status}: ${errorText}`,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let tokenData;
    try {
      tokenData = await tokenResponse.json();
    } catch (jsonError) {
      const errorMessage = "Failed to parse OAuth2 token response";
      console.error(errorMessage, {
        error: jsonError.message,
        timestamp: new Date().toISOString(),
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          details: jsonError.message,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { access_token } = tokenData;
    if (!access_token) {
      const errorMessage = "Access token not found in response";
      console.error(errorMessage, {
        timestamp: new Date().toISOString(),
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          details: "OAuth2 response did not contain access_token",
          timestamp: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Access token obtained successfully, appending to Google Sheets...");

    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A:G:append?valueInputOption=USER_ENTERED`;

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
      const errorMessage = "Failed to append data to Google Sheets";
      console.error(errorMessage, {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        spreadsheetId,
        range: "Sheet1!A:G",
        timestamp: new Date().toISOString(),
      });

      let errorDetails = `Status ${response.status}: ${errorText}`;
      if (response.status === 403) {
        errorDetails += " - Check that the service account has edit access to the spreadsheet";
      } else if (response.status === 404) {
        errorDetails += " - Check that the spreadsheet ID is correct and the sheet exists";
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          details: errorDetails,
          status: response.status,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let result;
    try {
      result = await response.json();
    } catch (jsonError) {
      const errorMessage = "Failed to parse Google Sheets response";
      console.error(errorMessage, {
        error: jsonError.message,
        timestamp: new Date().toISOString(),
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          details: jsonError.message,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Data successfully appended to Google Sheets:", {
      updatedRange: result.updates?.updatedRange,
      updatedRows: result.updates?.updatedRows,
      updatedColumns: result.updates?.updatedColumns,
      updatedCells: result.updates?.updatedCells,
      timestamp: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Data successfully saved to Google Sheets",
        result: {
          updatedRange: result.updates?.updatedRange,
          updatedRows: result.updates?.updatedRows,
          updatedColumns: result.updates?.updatedColumns,
          updatedCells: result.updates?.updatedCells,
        },
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const errorMessage = "Unexpected error while saving to Google Sheets";
    console.error(errorMessage, {
      error: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString(),
    });
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        details: error.message || "Internal server error",
        errorType: error.name,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
