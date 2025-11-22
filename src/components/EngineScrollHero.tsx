import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useInView } from 'framer-motion';

export interface EngineItem {
  id: string;
  title: string;
  description: string;
  image?: string;
  imageLQIP?: string;
  altText: string;
}

interface EngineScrollHeroProps {
  items: EngineItem[];
  staggerDelay?: number;
}

export default function EngineScrollHero({
  items,
  staggerDelay = 0.3,
}: EngineScrollHeroProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative bg-gradient-to-b from-black via-gray-900 to-black text-white py-20">
      <div className="w-full max-w-6xl mx-auto px-6 space-y-32">
        {items.map((item, index) => (
          <EngineRevealItem
            key={item.id}
            item={item}
            index={index}
            staggerDelay={staggerDelay}
            shouldReduceMotion={shouldReduceMotion || false}
          />
        ))}
      </div>
    </section>
  );
}

interface EngineRevealItemProps {
  item: EngineItem;
  index: number;
  staggerDelay: number;
  shouldReduceMotion: boolean;
}

function EngineRevealItem({
  item,
  index,
  staggerDelay,
  shouldReduceMotion,
}: EngineRevealItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(itemRef, { once: true, margin: '-100px' });

  const animationVariants = {
    hidden: {
      opacity: 0,
      y: 60,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.7,
        delay: shouldReduceMotion ? 0 : index * staggerDelay,
        ease: [0.25, 0.1, 0.25, 1],
      }
    }
  };

  return (
    <motion.div
      ref={itemRef}
      className="flex flex-col items-center justify-center"
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={animationVariants}
    >
      <div className="relative w-full max-w-4xl aspect-[16/9] mb-8">
        <motion.div
          className="absolute -inset-4 bg-gradient-to-br from-blue-500/20 via-cyan-400/10 to-blue-600/20 rounded-3xl blur-[60px]"
          animate={{
            opacity: isInView ? [0.3, 0.5, 0.3] : 0,
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />

        <div
          className="relative z-10 w-full h-full rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] ring-1 ring-white/5"
          role="img"
          aria-label={item.altText}
          tabIndex={0}
        >
          <ImageFallback
            image={item.image}
            imageLQIP={item.imageLQIP}
            altText={item.altText}
          />
        </div>
      </div>

      <motion.div
        className="text-center max-w-2xl px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
        transition={{
          delay: shouldReduceMotion ? 0 : index * staggerDelay + 0.3,
          duration: 0.6,
          ease: [0.25, 0.1, 0.25, 1]
        }}
      >
        <h2 className="text-4xl md:text-6xl font-semibold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
          {item.title}
        </h2>
        <p className="text-lg md:text-xl text-gray-400 leading-relaxed">
          {item.description}
        </p>
      </motion.div>
    </motion.div>
  );
}

interface ImageFallbackProps {
  image?: string;
  imageLQIP?: string;
  altText: string;
}

function ImageFallback({ image, imageLQIP, altText }: ImageFallbackProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(imageLQIP || image);

  useEffect(() => {
    if (!image) return;

    const img = new Image();
    img.src = image;
    img.onload = () => {
      setCurrentSrc(image);
      setImageLoaded(true);
    };
  }, [image]);

  if (!image && !imageLQIP) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
        <svg
          className="w-24 h-24 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={altText}
      className="w-full h-full object-cover transition-all duration-700"
      style={{
        filter: imageLoaded ? 'blur(0) brightness(1.05)' : 'blur(20px)',
      }}
      loading="lazy"
    />
  );
}
