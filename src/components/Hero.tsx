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
    image: 'https://enchanting-plum-3rnpyxk0yu.edgeone.app/Generated%20Image%20November%2022,%202025%20-%2012_23PM.png',
    imageLQIP: 'https://images.pexels.com/photos/1092364/pexels-photo-1092364.jpeg?auto=compress&cs=tinysrgb&w=50',
    altText: 'Powerful racing engine with red cover showing peak performance engineering',
    use3D: false
  }
];

export default function Hero() {
  return (
    <>
      <section id="hero" className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-cyan-900/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-500/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent"></div>

        <div className="relative z-10 text-center px-6 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tight bg-gradient-to-r from-cyan-300 via-pink-300 to-purple-300 bg-clip-text text-transparent mb-4">
              Vehicle Intelligence,
            </h1>
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tight bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent mb-8">
              Reimagined.
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-xl md:text-2xl text-gray-300 mb-6 font-normal"
          >
            Instant vehicle insights at your fingertips.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-base md:text-lg text-gray-400 mb-12"
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
              className="inline-block text-cyan-400 text-lg hover:text-pink-400 transition-colors duration-300 font-normal"
            >
              Explore engines →
            </a>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-6 h-10 border-2 border-cyan-400 rounded-full flex items-start justify-center p-2"
          >
            <div className="w-1 h-2 bg-cyan-400 rounded-full"></div>
          </motion.div>
        </div>
      </section>

      <div id="engines">
        <EngineScrollHero
          items={engineItems}
          staggerDelay={0.3}
        />
      </div>
    </>
  );
}
