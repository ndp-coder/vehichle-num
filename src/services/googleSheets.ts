import type { VehicleResultsData } from '../types';

export const saveVehicleData = async (data: VehicleResultsData, mobileNumber: string): Promise<void> => {
  const vehicle = data.vehicle;
  const history = data.history;
  const plate = data.plate;

  const row = [
    plate?.owner || '',
    vehicle?.vin || plate?.vin || '',
    vehicle?.make || plate?.make || '',
    vehicle?.model || plate?.model || '',
    vehicle?.year || plate?.year || '',
    vehicle?.bodyClass || '',
    vehicle?.vehicleType || '',
    vehicle?.manufacturer || '',
    vehicle?.fuelType || '',
    vehicle?.engineCylinders || '',
    vehicle?.displacement || '',
    vehicle?.transmission || '',
    vehicle?.driveType || '',
    history?.accidents?.reported?.toString() || '0',
    history?.ownershipHistory?.owners?.toString() || 'N/A',
    history?.odometer?.lastReading?.toString() || 'N/A',
    history?.serviceRecords?.count?.toString() || '0',
    history?.recalls?.open?.toString() || '0',
    mobileNumber,
  ];

  const apiKey = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
  const spreadsheetId = import.meta.env.VITE_GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!apiKey || !spreadsheetId) {
    console.error('Google Sheets configuration missing');
    throw new Error('Google Sheets not configured');
  }

  const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A:S:append?valueInputOption=USER_ENTERED&key=${apiKey}`;

  const response = await fetch(appendUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [row],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Google Sheets API error:', errorText);
    throw new Error('Failed to save to Google Sheets');
  }
};
