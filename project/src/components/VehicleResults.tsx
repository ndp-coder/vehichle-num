import { motion } from 'framer-motion';
import { Car, FileText, History, CheckCircle2, AlertCircle } from 'lucide-react';
import { VehicleResultsData } from '../types';

interface VehicleResultsProps {
  data: VehicleResultsData;
}

export default function VehicleResults({ data }: VehicleResultsProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {data.vehicle && (
        <motion.div
          variants={item}
          className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Car className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900">Vehicle Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem label="VIN" value={data.vehicle.vin} />
            <InfoItem label="Make" value={data.vehicle.make} />
            <InfoItem label="Model" value={data.vehicle.model} />
            <InfoItem label="Year" value={data.vehicle.year} />
            <InfoItem label="Body Class" value={data.vehicle.bodyClass} />
            <InfoItem label="Vehicle Type" value={data.vehicle.vehicleType} />
            <InfoItem label="Manufacturer" value={data.vehicle.manufacturer} />
            <InfoItem label="Fuel Type" value={data.vehicle.fuelType} />
            <InfoItem label="Engine Cylinders" value={data.vehicle.engineCylinders} />
            <InfoItem label="Displacement" value={data.vehicle.displacement} />
            <InfoItem label="Transmission" value={data.vehicle.transmission} />
            <InfoItem label="Drive Type" value={data.vehicle.driveType} />
          </div>
        </motion.div>
      )}

      {data.plate && (
        <motion.div
          variants={item}
          className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900">Registration Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem label="License Plate" value={data.plate.plate} />
            <InfoItem label="State" value={data.plate.state} />
            <InfoItem label="Status" value={data.plate.status} />
            <InfoItem label="Plate Type" value={data.plate.plateType} />
            <InfoItem label="Registration Expiry" value={data.plate.registrationExpiry} />
          </div>

          {data.plate.note && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
              <p className="text-sm text-yellow-800">{data.plate.note}</p>
            </div>
          )}
        </motion.div>
      )}

      {data.history && (
        <motion.div
          variants={item}
          className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <History className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900">Vehicle History</h3>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-2xl">
              <CheckCircle2 className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Title Status</h4>
                <p className="text-gray-600">{data.history.titleCheck.status}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <HistoryCard
                title="Accidents"
                value={`${data.history.accidents.reported} reported`}
                detail={data.history.accidents.summary}
              />
              <HistoryCard
                title="Ownership"
                value={`${data.history.ownershipHistory.owners} owners`}
                detail={`Last sale: ${data.history.ownershipHistory.lastSaleDate}`}
              />
              <HistoryCard
                title="Odometer"
                value={`${data.history.odometer.lastReading.toLocaleString()} miles`}
                detail={`As of ${data.history.odometer.date}`}
              />
              <HistoryCard
                title="Service Records"
                value={`${data.history.serviceRecords.count} records`}
                detail={`Last: ${data.history.serviceRecords.lastService}`}
              />
            </div>

            <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-2xl">
              <AlertCircle className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Recalls</h4>
                <p className="text-gray-600">
                  {data.history.recalls.open} open, {data.history.recalls.resolved} resolved
                </p>
              </div>
            </div>

            {data.history.note && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
                <p className="text-sm text-yellow-800">{data.history.note}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-base text-gray-900">{value || 'N/A'}</p>
    </div>
  );
}

function HistoryCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <div className="p-4 bg-gray-50 rounded-2xl">
      <h4 className="text-sm font-medium text-gray-500 mb-2">{title}</h4>
      <p className="text-lg font-semibold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-600">{detail}</p>
    </div>
  );
}
