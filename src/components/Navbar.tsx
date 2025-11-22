import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ backgroundColor: 'rgba(255, 255, 255, 0)' }}
      animate={{
        backgroundColor: isScrolled ? 'rgba(251, 251, 251, 0.8)' : 'rgba(255, 255, 255, 0)',
        backdropFilter: isScrolled ? 'blur(20px)' : 'blur(0px)',
      }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-transparent"
      style={{
        borderBottomColor: isScrolled ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
      }}
    >
      <div className="max-w-screen-xl mx-auto px-6 h-11 flex items-center justify-between">
        <div className="flex items-center space-x-10">
          <motion.div
            className="text-xl font-semibold tracking-tight"
            whileHover={{ scale: 1.02 }}
          >
            VehicleIQ
          </motion.div>

          <div className="hidden md:flex items-center space-x-8 text-xs">
            <a href="#" className="text-gray-700 hover:text-black transition-colors duration-200">
              Lookup
            </a>
            <a href="#" className="text-gray-700 hover:text-black transition-colors duration-200">
              About
            </a>
            <a href="#" className="text-gray-700 hover:text-black transition-colors duration-200">
              Support
            </a>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <Search className="w-4 h-4 text-gray-700 cursor-pointer hover:text-black transition-colors" />
        </div>
      </div>
    </motion.nav>
  );
}
