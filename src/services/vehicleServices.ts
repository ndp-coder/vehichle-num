import axios from 'axios';
import { NHTSAResult, VehicleData, HistoryData } from '../types';

export async function decodeVIN(vin: string): Promise<VehicleData> {
  try {
    const response = await axios.get<NHTSAResult>(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`
    );

    const results = response.data.Results;
    const errors = results
      .filter(item => item.Variable === 'Error Code' && item.Value !== '0')
      .map(item => item.Value || 'Unknown error');

    const getValue = (variable: string): string => {
      const item = results.find(r => r.Variable === variable);
      return item?.Value || 'N/A';
    };

    const vehicleData: VehicleData = {
      vin: vin,
      make: getValue('Make'),
      model: getValue('Model'),
      year: getValue('Model Year'),
      vehicleType: getValue('Vehicle Type'),
      bodyClass: getValue('Body Class'),
      manufacturer: getValue('Manufacturer Name'),
      plantCity: getValue('Plant City'),
      plantCountry: getValue('Plant Country'),
      fuelType: getValue('Fuel Type - Primary'),
      engineCylinders: getValue('Engine Number of Cylinders'),
      displacement: getValue('Displacement (L)'),
      transmission: getValue('Transmission Style'),
      driveType: getValue('Drive Type'),
      errors: errors
    };

    return vehicleData;
  } catch (error: unknown) {
    console.error('NHTSA API Error:', error instanceof Error ? error.message : String(error));
    throw new Error('Failed to decode VIN. Please check the VIN and try again.');
  }
}

export async function lookupPlate(plate: string, state: string): Promise<unknown> {
  try {
    const response = await axios.get(
      `https://api.platescrape.com/v1/lookup/${plate}/${state}`,
      {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_PLATESCRAPE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = response.data;

    const plateData = {
      plate: plate,
      state: state,
      vin: data.vin || null,
      make: data.make || 'Unknown',
      model: data.model || 'Unknown',
      year: data.year || 'Unknown',
      color: data.color || 'Unknown',
      owner: data.owner || 'Unknown',
      address: data.address || 'Unknown'
    };

    return plateData;
  } catch (error: unknown) {
    console.error('PlateScrape API Error:', error instanceof Error ? error.message : String(error));
    throw new Error('Failed to lookup license plate');
  }
}

export async function getVehicleHistory(vin: string): Promise<HistoryData> {
  await new Promise(resolve => setTimeout(resolve, 500));

  const historyData: HistoryData = {
    vin: vin,
    accidents: {
      reported: 0,
      summary: 'Data not available'
    },
    ownershipHistory: {
      owners: 0,
      lastSaleDate: 'N/A'
    },
    odometer: {
      lastReading: 0,
      date: 'N/A'
    },
    serviceRecords: {
      count: 0,
      lastService: 'N/A'
    },
    titleCheck: {
      status: 'Data not available'
    },
    recalls: {
      open: 0,
      resolved: 0
    },
    note: 'Vehicle history requires a paid service subscription'
  };

  return historyData;
}
