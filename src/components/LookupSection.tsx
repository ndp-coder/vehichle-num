import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Car } from 'lucide-react';
import VehicleResults from './VehicleResults';
import { VehicleResultsData } from '../types';

interface LookupSectionProps {
  onLookup: (data: { vin?: string; plate?: string; state?: string }) => Promise<any>;
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export default function LookupSection({ onLookup }: LookupSectionProps) {
  const [lookupMethod, setLookupMethod] = useState<'quick' | 'detailed'>('quick');
  const [lookupType, setLookupType] = useState<'vin' | 'plate'>('vin');

  const [vin, setVin] = useState('');
  const [plate, setPlate] = useState('');
  const [state, setState] = useState('');

  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [partName, setPartName] = useState('');

  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [engine, setEngine] = useState('');
  const [fuel, setFuel] = useState('');
  const [transmission, setTransmission] = useState('');
  const [bodyStyle, setBodyStyle] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<VehicleResultsData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResults(null);

    if (!name.trim() || !mobileNumber.trim() || !partName.trim()) {
      setError('Please fill in your name, mobile number, and part name');
      setLoading(false);
      return;
    }

    try {
      if (lookupMethod === 'quick') {
        const data = lookupType === 'vin'
          ? { vin: vin.trim() }
          : { plate: plate.trim(), state };

        const response = await onLookup(data);
        setResults(response);

        if (response) {
          try {
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

            await fetch(`${supabaseUrl}/functions/v1/save-to-sheets`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseKey}`,
              },
              body: JSON.stringify({
                vehicleData: response,
                name: name.trim(),
                mobileNumber: mobileNumber.trim(),
                partName: partName.trim(),
                lookupType: lookupType === 'vin' ? 'VIN' : 'License Plate',
              }),
            });
          } catch (sheetError) {
            console.error('Failed to save to Google Sheets:', sheetError);
          }
        }
      } else {
        const detailedVehicleData = {
          make: make.trim(),
          model: model.trim(),
          year: year.trim(),
          engine: engine.trim(),
          fuel: fuel.trim(),
          transmission: transmission.trim(),
          bodyStyle: bodyStyle.trim(),
        };

        setResults({
          vehicleInfo: detailedVehicleData,
          message: 'Vehicle information submitted successfully'
        } as VehicleResultsData);

        try {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

          await fetch(`${supabaseUrl}/functions/v1/save-to-sheets`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              vehicleData: detailedVehicleData,
              name: name.trim(),
              mobileNumber: mobileNumber.trim(),
              partName: partName.trim(),
              lookupType: 'Detailed Selection',
            }),
          });
        } catch (sheetError) {
          console.error('Failed to save to Google Sheets:', sheetError);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during lookup');
    } finally {
      setLoading(false);
    }
  };

  const isQuickLookupValid = lookupType === 'vin'
    ? vin.trim().length === 17
    : plate.trim().length > 0 && state.length > 0;

  const isDetailedLookupValid = make.trim() && model.trim() && year.trim();

  const isFormValid = name.trim() && mobileNumber.trim() && partName.trim() &&
    (lookupMethod === 'quick' ? isQuickLookupValid : isDetailedLookupValid);

  return (
    <section id="lookup" className="py-24 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 mb-4">
            Find Your Vehicle Parts
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            Enter your details and vehicle information to get started
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-200"
        >
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-full bg-gray-100 p-1">
              <button
                onClick={() => setLookupMethod('quick')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  lookupMethod === 'quick'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Quick Lookup
              </button>
              <button
                onClick={() => setLookupMethod('detailed')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  lookupMethod === 'detailed'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Detailed Selection
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6 border-b border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className="w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="(555) 123-4567"
                  required
                  className="w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Part Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  placeholder="e.g., Brake Pads"
                  required
                  className="w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {lookupMethod === 'quick' ? (
                <motion.div
                  key="quick"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex justify-center">
                    <div className="inline-flex rounded-full bg-gray-100 p-1">
                      <button
                        type="button"
                        onClick={() => setLookupType('vin')}
                        className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          lookupType === 'vin'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        VIN
                      </button>
                      <button
                        type="button"
                        onClick={() => setLookupType('plate')}
                        className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          lookupType === 'plate'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        License Plate
                      </button>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {lookupType === 'vin' ? (
                      <motion.div
                        key="vin"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <input
                          type="text"
                          value={vin}
                          onChange={(e) => setVin(e.target.value.toUpperCase())}
                          placeholder="Enter 17-character VIN"
                          maxLength={17}
                          className="w-full px-6 py-4 text-lg bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                        <p className="mt-2 text-sm text-gray-500 text-center">
                          {vin.length}/17 characters
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="plate"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <input
                          type="text"
                          value={plate}
                          onChange={(e) => setPlate(e.target.value.toUpperCase())}
                          placeholder="License Plate Number"
                          className="w-full px-6 py-4 text-lg bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                        <select
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full px-6 py-4 text-lg bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="">Select State</option>
                          {US_STATES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  key="detailed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-center mb-4 text-gray-700">
                    <Car className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">Select Your Vehicle Details</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Make <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={make}
                        onChange={(e) => setMake(e.target.value)}
                        placeholder="e.g., Toyota, Ford"
                        required
                        className="w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Model <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        placeholder="e.g., Camry, F-150"
                        required
                        className="w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Year <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        placeholder="e.g., 2020"
                        required
                        className="w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Engine
                      </label>
                      <input
                        type="text"
                        value={engine}
                        onChange={(e) => setEngine(e.target.value)}
                        placeholder="e.g., 2.5L 4-Cylinder"
                        className="w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fuel Type
                      </label>
                      <select
                        value={fuel}
                        onChange={(e) => setFuel(e.target.value)}
                        className="w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Select Fuel Type</option>
                        <option value="Gasoline">Gasoline</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Electric">Electric</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Plug-in Hybrid">Plug-in Hybrid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transmission
                      </label>
                      <select
                        value={transmission}
                        onChange={(e) => setTransmission(e.target.value)}
                        className="w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Select Transmission</option>
                        <option value="Automatic">Automatic</option>
                        <option value="Manual">Manual</option>
                        <option value="CVT">CVT</option>
                        <option value="Semi-Automatic">Semi-Automatic</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Body Style
                      </label>
                      <select
                        value={bodyStyle}
                        onChange={(e) => setBodyStyle(e.target.value)}
                        className="w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Select Body Style</option>
                        <option value="Sedan">Sedan</option>
                        <option value="SUV">SUV</option>
                        <option value="Truck">Truck</option>
                        <option value="Coupe">Coupe</option>
                        <option value="Hatchback">Hatchback</option>
                        <option value="Convertible">Convertible</option>
                        <option value="Van">Van</option>
                        <option value="Wagon">Wagon</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={!isFormValid || loading}
              className={`w-full py-4 rounded-full font-medium text-white text-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                isFormValid && !loading
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Look Up Vehicle</span>
                </>
              )}
            </button>
          </form>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl"
              >
                <p className="text-red-600 text-center text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="mt-12"
            >
              <VehicleResults data={results} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
