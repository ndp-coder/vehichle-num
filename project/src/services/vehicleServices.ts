import axios from 'axios';
import { NHTSAResult, VehicleData, HistoryData } from '../types';

export async function decodeVIN(vin: string): Promise<VehicleData> {
  // Mock data for demonstration
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

  const vehicleData: VehicleData = {
    vin: vin,
    make: 'Honda',
    model: 'Civic',
    year: '2020',
    vehicleType: 'Passenger Car',
    bodyClass: 'Sedan',
    manufacturer: 'Honda Motor Company',
    plantCity: 'Greensboro',
    plantCountry: 'USA',
    fuelType: 'Gasoline',
    engineCylinders: '4',
    displacement: '2.0',
    transmission: 'Automatic',
    driveType: 'FWD',
    errors: []
  };

  return vehicleData;
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
  // Mock data for demonstration
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

  const historyData: HistoryData = {
    vin: vin,
    accidents: {
      reported: 1,
      summary: 'Minor rear-end collision'
    },
    ownershipHistory: {
      owners: 2,
      lastSaleDate: '2022-08-20'
    },
    odometer: {
      lastReading: 30000,
      date: '2022-06-05'
    },
    serviceRecords: {
      count: 2,
      lastService: '2022-06-05'
    },
    titleCheck: {
      status: 'Clean'
    },
    recalls: {
      open: 0,
      resolved: 1
    },
    note: 'No major issues found'
  };

  return historyData;
}
