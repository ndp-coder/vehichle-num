import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2 } from 'lucide-react';
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
  const [lookupType, setLookupType] = useState<'vin' | 'plate'>('vin');
  const [vin, setVin] = useState('');
  const [plate, setPlate] = useState('');
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<VehicleResultsData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResults(null);

    try {
      const data = lookupType === 'vin'
        ? { vin: vin.trim() }
        : { plate: plate.trim(), state };

      const response = await onLookup(data);
      setResults(response);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during lookup');
    } finally {
      setLoading(false);
    }
  };

  const isValid = lookupType === 'vin'
    ? vin.trim().length === 17
    : plate.trim().length > 0 && state.length > 0;

  return (
    <section id="lookup" className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 mb-4">
            Look up any vehicle
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            Enter a VIN or license plate to get started
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
                onClick={() => setLookupType('vin')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  lookupType === 'vin'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                VIN
              </button>
              <button
                onClick={() => setLookupType('plate')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  lookupType === 'plate'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                License Plate
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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

            <button
              type="submit"
              disabled={!isValid || loading}
              className={`w-full py-4 rounded-full font-medium text-white text-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                isValid && !loading
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Looking up...</span>
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
