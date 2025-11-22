import { decodeVIN, lookupPlate, getVehicleHistory } from '../services/vehicleServices';
import { VehicleResultsData, PlateData } from '../types';

interface LookupRequest {
  vin?: string;
  plate?: string;
  state?: string;
}

export async function lookupVehicle(data: LookupRequest): Promise<VehicleResultsData> {
  try {
    const result = {} as VehicleResultsData;

    if (data.vin) {
      result.vehicle = await decodeVIN(data.vin);
      result.history = await getVehicleHistory(data.vin);
    } else if (data.plate && data.state) {
      result.plate = (await lookupPlate(data.plate, data.state)) as PlateData;
    }

    return result;
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : 'Failed to lookup vehicle');
  }
}

export default {
  lookupVehicle
};
