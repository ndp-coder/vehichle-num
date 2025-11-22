// src/api/vehicleApi.ts
import axios from 'axios';
import { decodeVIN, lookupPlate, getVehicleHistory } from '../services/vehicleServices';
import { VehicleResultsData, PlateData } from '../types';

interface LookupRequest {
  vin?: string;
  plate?: string;
  state?: string;
}

export async function lookupVehicle(data: LookupRequest): Promise<VehicleResultsData> {
  try {
    // safer typing: start as partial, then assign
    const result = {} as VehicleResultsData;

    if (data.vin) {
      result.vehicle = await decodeVIN(data.vin);
      result.history = await getVehicleHistory(data.vin);
    } else if (data.plate && data.state) {
      result.plate = (await lookupPlate(data.plate, data.state)) as PlateData;
    }

    // Send data to Google Sheets via Apps Script / proxy
    await sendToGoogleSheets(result);

    return result;
  } catch (error: unknown) {
    // bubble up a real error so caller can handle it
    throw new Error(error instanceof Error ? error.message : 'Failed to lookup vehicle');
  }
}

async function sendToGoogleSheets(data: VehicleResultsData) {
  const sheetUrl = import.meta.env.VITE_GOOGLE_SHEETS_URL;
  if (!sheetUrl) {
    console.warn('Google Sheets URL not configured (VITE_GOOGLE_SHEETS_URL)');
    return;
  }

  // Build row object with exact column headers (match your sheet)
  const rowData: Record<string, string> = {
    'name': '',
    'VIN': data.vehicle?.vin ?? data.plate?.vin ?? '',
    'Make': data.vehicle?.make ?? data.plate?.make ?? '',
    'Model': data.vehicle?.model ?? data.plate?.model ?? '',
    'Year': String(data.vehicle?.year ?? data.plate?.year ?? ''),
    'Body Class': data.vehicle?.bodyClass ?? '',
    'Vehicle Type': data.vehicle?.vehicleType ?? '',
    'Manufacturer': data.vehicle?.manufacturer ?? '',
    'Fuel Type': data.vehicle?.fuelType ?? '',
    'Engine Cylinders': String(data.vehicle?.engineCylinders ?? ''),
    'Displacement': String(data.vehicle?.displacement ?? ''),
    'Transmission': data.vehicle?.transmission ?? '',
    'Drive Type': data.vehicle?.driveType ?? '',
    'Accidents': (data.history?.accidents?.reported != null) ? String(data.history.accidents.reported) : '',
    'Ownership': Array.isArray(data.history?.ownershipHistory?.owners)
      ? (data.history!.ownershipHistory!.owners as any[]).join('; ')
      : String((data.history?.ownershipHistory as any)?.owners ?? ''),
    'Odometer': (data.history?.odometer?.lastReading != null) ? String(data.history.odometer.lastReading) : '',
    'Service Records': (data.history?.serviceRecords?.count != null) ? String(data.history.serviceRecords.count) : '',
    'Recalls': (data.history?.recalls?.open != null) ? String(data.history.recalls.open) : '',
    'mobile number': ''
  };

  // Debug: always log the final payload before sending
  console.log('sendToGoogleSheets payload:', rowData);

  // Helper to pretty-print axios errors
  const logAxiosError = (err: any) => {
    console.error('Axios error message:', err?.message);
    if (err?.response) {
      console.error('Response status:', err.response.status);
      console.error('Response headers:', err.response.headers);
      console.error('Response data:', err.response.data);
    } else if (err?.request) {
      console.error('No response received. Request details:', err.request);
    } else {
      console.error('Error config:', err?.config);
    }
  };

  // DEV: try the local proxy first (JSON)
  if (import.meta.env.DEV) {
    try {
      const proxyUrl = '/google-sheets';
      const res = await axios.post(proxyUrl, rowData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      console.log('Proxy POST success:', res.status, res.data);
      return res.data;
    } catch (err: any) {
      console.error('Proxy POST failed. Detailed error follows:');
      logAxiosError(err);

      // fallthrough to try direct Apps Script (form-encoded) for diagnostics
      console.warn('FALLBACK: Attempting direct POST to Apps Script (form-encoded) for diagnostics...');
    }
  }

  // Production or fallback: try sending form-encoded directly to Apps Script exec URL.
  // Note: this will work from curl / server; from browser it may be blocked by CORS.
  try {
    const params = new URLSearchParams();
    Object.entries(rowData).forEach(([k, v]) => params.append(k, v ?? ''));

    const res = await axios.post(sheetUrl, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      timeout: 10000
    });
    console.log('Direct Apps Script POST success:', res.status, res.data);
    return res.data;
  } catch (err: any) {
    console.error('Direct Apps Script POST failed. Detailed error follows:');
    logAxiosError(err);

    // Final actionable advice printed to console
    console.error('--- ACTION REQUIRED ---');
    console.error('1) If you are in DEV (localhost): ensure you have a dev proxy forwarding "/google-sheets" to your server.');
    console.error('   - If you use Vite, add this to vite.config.ts (or update existing):');
    console.error(`
server: {
  proxy: {
    '/google-sheets': {
      target: 'http://localhost:4000', // or your proxy server
      changeOrigin: true,
      secure: false
    }
  }
}
    `);
    console.error('2) TESTS you must run in terminal to isolate the failure:');
    console.error('   a) Test Vite proxy endpoint (run while dev server is running):');
    console.error(`      curl -v -X POST http://localhost:5173/google-sheets -H "Content-Type: application/json" -d '{"VIN":"TESTVIN"}'`);
    console.error('   b) Test proxy server (if you have Node proxy at :4000):');
    console.error(`      curl -v -X POST http://localhost:4000/google-sheets -H "Content-Type: application/json" -d '{"VIN":"TESTVIN"}'`);
    console.error('   c) Test Apps Script URL (replace with your script URL):');
    console.error(`      curl -v -X POST '${sheetUrl}' -H "Content-Type: application/x-www-form-urlencoded" --data "VIN=TESTVIN&Make=TEST"`);
    console.error('3) If proxy fails: either configure vite proxy OR run a small Express proxy to forward requests.');
    console.error('   Example Express proxy (node):');
    console.error(`
import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch'; // or global fetch in Node 18+

const app = express();
app.use(bodyParser.json());
const SCRIPT_URL = process.env.SCRIPT_URL; // your Apps Script exec URL

app.post('/google-sheets', async (req, res) => {
  try {
    const r = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const text = await r.text();
    res.status(r.status).send(text);
  } catch (e) {
    console.error('proxy error', e);
    res.status(500).send({ success: false, error: e.message });
  }
});

app.listen(4000, () => console.log('proxy running on :4000'));
    `);
    throw new Error('Failed to send to Google Sheets (proxy and direct attempts failed). See console for details.');
  }
}

export default {
  lookupVehicle,
  sendToGoogleSheets
};
