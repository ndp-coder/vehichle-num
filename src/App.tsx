import Navbar from './components/Navbar';
import Hero from './components/Hero';
import LookupSection from './components/LookupSection';
import Footer from './components/Footer';
import { lookupVehicle } from './api/vehicleApi';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <LookupSection onLookup={lookupVehicle} />
      <Hero />
      <Footer />
    </div>
  );
}

export default App;
