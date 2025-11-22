export interface NHTSAResult {
  Variable: string;
  Value: string;
}

export interface VehicleData {
  vin: string;
  make: string;
  model: string;
  year: string;
  vehicleType: string;
  bodyClass: string;
  manufacturer: string;
  plantCity: string;
  plantCountry: string;
  fuelType: string;
  engineCylinders: string;
  displacement: string;
  transmission: string;
  driveType: string;
  errors: string[];
}

export interface PlateData {
  plate: string;
  state: string;
  vin: string | null;
  make: string;
  model: string;
  year: string;
  color: string;
  owner: string;
  address: string;
}

export interface HistoryData {
  vin: string;
  accidents: {
    reported: number;
    summary: string;
  };
  ownershipHistory: {
    owners: number;
    lastSaleDate: string;
  };
  odometer: {
    lastReading: number;
    date: string;
  };
  serviceRecords: {
    count: number;
    lastService: string;
  };
  titleCheck: {
    status: string;
  };
  recalls: {
    open: number;
    resolved: number;
  };
  note?: string;
}

export interface VehicleResultsData {
  vehicle?: VehicleData;
  plate?: PlateData;
  history?: HistoryData;
}
