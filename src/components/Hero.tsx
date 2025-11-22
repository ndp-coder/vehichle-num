import { motion } from 'framer-motion';
import EngineScrollHero, { EngineItem } from './EngineScrollHero';

const engineItems: EngineItem[] = [
  {
    id: 'v8-chrome-engine',
    title: 'V8 Performance',
    description: 'Raw power and precision engineering in perfect harmony',
    image: 'https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=1600',
    imageLQIP: 'https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=50',
    altText: 'Close-up of a chrome V8 engine with detailed components',
    use3D: false
  },
  {
    id: 'modern-engine-bay',
    title: 'Modern Engineering',
    description: 'Cutting-edge technology meets mechanical excellence',
    image: 'https://images.pexels.com/photos/279949/pexels-photo-279949.jpeg?auto=compress&cs=tinysrgb&w=1600',
    imageLQIP: 'https://images.pexels.com/photos/279949/pexels-photo-279949.jpeg?auto=compress&cs=tinysrgb&w=50',
    altText: 'Modern car engine bay showing advanced automotive engineering',
    use3D: false
  },
  {
    id: 'engine-detail',
    title: 'Precision Mechanics',
    description: 'Every component crafted for optimal performance',
    image: 'https://images.pexels.com/photos/190574/pexels-photo-190574.jpeg?auto=compress&cs=tinysrgb&w=1600',
    imageLQIP: 'https://images.pexels.com/photos/190574/pexels-photo-190574.jpeg?auto=compress&cs=tinysrgb&w=50',
    altText: 'Detailed view of car engine components and mechanical parts',
    use3D: false
  },
  {
    id: 'performance-engine',
    title: 'High Performance',
    description: 'Built for speed, designed for reliability',
    image: 'https://images.pexels.com/photos/13861/IMG_3496bfreeCC.jpg?auto=compress&cs=tinysrgb&w=1600',
    imageLQIP: 'https://images.pexels.com/photos/13861/IMG_3496bfreeCC.jpg?auto=compress&cs=tinysrgb&w=50',
    altText: 'High-performance car engine with custom modifications',
    use3D: false
  }
];

export default function Hero() {
  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white"></div>

        <div className="relative z-10 text-center px-6 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-gray-900 mb-4">
              Vehicle Intelligence,
            </h1>
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-gray-900 mb-8">
              Reimagined.
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-xl md:text-2xl text-gray-600 mb-6 font-normal"
          >
            Instant vehicle insights at your fingertips.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-base md:text-lg text-gray-500 mb-12"
          >
            Decode any VIN or license plate in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <a
              href="#engines"
              className="inline-block text-blue-600 text-lg hover:underline font-normal"
            >
              Explore engines →
            </a>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-6 h-10 border-2 border-gray-300 rounded-full flex items-start justify-center p-2"
          >
            <div className="w-1 h-2 bg-gray-400 rounded-full"></div>
          </motion.div>
        </div>
      </section>

      <div id="engines">
        <EngineScrollHero
          items={engineItems}
          autoplay={true}
          staggerDelay={0.5}
          itemPadding="12rem"
        />
      </div>
    </>
  );
}
