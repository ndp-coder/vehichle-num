import { google } from 'googleapis';
import type { VehicleResultsData } from '../types';

interface SheetsConfig {
  apiKey: string;
  spreadsheetId: string;
}

export class GoogleSheetsService {
  private sheets;
  private spreadsheetId: string;

  constructor(config: SheetsConfig) {
    this.sheets = google.sheets({
      version: 'v4',
      auth: config.apiKey,
    });
    this.spreadsheetId = config.spreadsheetId;
  }

  async appendVehicleData(data: VehicleResultsData, mobileNumber: string): Promise<void> {
    const row = this.formatDataForSheet(data, mobileNumber);

    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: 'Sheet1!A:S',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });
  }

  private formatDataForSheet(data: VehicleResultsData, mobileNumber: string): string[] {
    const vehicle = data.vehicle;
    const history = data.history;
    const plate = data.plate;

    const name = plate?.owner || '';
    const vin = vehicle?.vin || plate?.vin || '';
    const make = vehicle?.make || plate?.make || '';
    const model = vehicle?.model || plate?.model || '';
    const year = vehicle?.year || plate?.year || '';
    const bodyClass = vehicle?.bodyClass || '';
    const vehicleType = vehicle?.vehicleType || '';
    const manufacturer = vehicle?.manufacturer || '';
    const fuelType = vehicle?.fuelType || '';
    const engineCylinders = vehicle?.engineCylinders || '';
    const displacement = vehicle?.displacement || '';
    const transmission = vehicle?.transmission || '';
    const driveType = vehicle?.driveType || '';

    const accidents = history?.accidents?.reported?.toString() || '0';
    const ownership = history?.ownershipHistory?.owners?.toString() || 'N/A';
    const odometer = history?.odometer?.lastReading?.toString() || 'N/A';
    const serviceRecords = history?.serviceRecords?.count?.toString() || '0';
    const recalls = history?.recalls?.open?.toString() || '0';

    return [
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
  }
}

export const createGoogleSheetsService = (apiKey: string, spreadsheetId: string) => {
  return new GoogleSheetsService({ apiKey, spreadsheetId });
};
