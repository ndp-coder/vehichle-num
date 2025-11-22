import { useEffect, useRef, useState, Suspense, lazy } from 'react';
import { motion, useScroll, useTransform, useReducedMotion, MotionValue } from 'framer-motion';
import { useInView } from 'framer-motion';

const Engine3DModel = lazy(() => import('./Engine3DModel'));

export interface EngineItem {
  id: string;
  title: string;
  description: string;
  image?: string;
  imageLQIP?: string;
  model3D?: string;
  altText: string;
  use3D?: boolean;
}

interface EngineScrollHeroProps {
  items: EngineItem[];
  autoplay?: boolean;
  staggerDelay?: number;
  itemPadding?: string;
}

export default function EngineScrollHero({
  items,
  autoplay = true,
  staggerDelay = 0.5,
  itemPadding = '12rem'
}: EngineScrollHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  return (
    <section
      ref={containerRef}
      className="relative bg-gradient-to-b from-black via-gray-950 to-black text-white overflow-hidden"
      style={{ minHeight: `${items.length * 100}vh` }}
    >
      <div className="sticky top-0 h-screen flex items-center justify-center">
        <div className="w-full max-w-7xl mx-auto px-6">
          {items.map((item, index) => (
            <EngineRevealItem
              key={item.id}
              item={item}
              index={index}
              totalItems={items.length}
              staggerDelay={staggerDelay}
              scrollProgress={scrollYProgress}
              shouldReduceMotion={shouldReduceMotion || false}
              autoplay={autoplay}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface EngineRevealItemProps {
  item: EngineItem;
  index: number;
  totalItems: number;
  staggerDelay: number;
  scrollProgress: MotionValue<number>;
  shouldReduceMotion: boolean;
  autoplay: boolean;
}

function EngineRevealItem({
  item,
  index,
  totalItems,
  staggerDelay,
  scrollProgress,
  shouldReduceMotion,
  autoplay
}: EngineRevealItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(itemRef, { once: false, margin: '-20%' });
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const startProgress = index / totalItems;
  const endProgress = (index + 1) / totalItems;

  const opacity = useTransform(
    scrollProgress,
    [startProgress - 0.05, startProgress + 0.08, startProgress + 0.15, endProgress - 0.1, endProgress],
    [0, 0.5, 1, 1, 0]
  );

  const scale = useTransform(
    scrollProgress,
    [startProgress - 0.05, startProgress + 0.08, startProgress + 0.15, endProgress - 0.1, endProgress],
    [0.92, 0.98, 1.02, 1, 0.95]
  );

  const y = useTransform(
    scrollProgress,
    [startProgress - 0.05, startProgress + 0.08, startProgress + 0.15, endProgress - 0.1, endProgress],
    [50, 10, 0, 0, -30]
  );

  const rotateY = useTransform(
    scrollProgress,
    [startProgress - 0.05, startProgress + 0.12, startProgress + 0.18],
    [index % 2 === 0 ? -12 : 12, 0, 0]
  );

  const blur = useTransform(
    scrollProgress,
    [startProgress - 0.05, startProgress + 0.08, endProgress - 0.08, endProgress],
    [8, 0, 0, 5]
  );

  useEffect(() => {
    if (isInView && !hasAnimated && autoplay) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setHasAnimated(true);
      }, index * staggerDelay * 1000);

      return () => clearTimeout(timer);
    }
  }, [isInView, hasAnimated, index, staggerDelay, autoplay]);

  const animationVariants = {
    hidden: {
      opacity: 0,
      scale: 0.92,
      y: 40,
      rotateY: index % 2 === 0 ? -12 : 12
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      rotateY: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.8,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  const supports3D = typeof window !== 'undefined' &&
    window.WebGLRenderingContext !== undefined;

  return (
    <motion.div
      ref={itemRef}
      className="absolute inset-0 flex flex-col items-center justify-center perspective-[1000px]"
      style={
        shouldReduceMotion
          ? { opacity: isVisible ? 1 : 0 }
          : { opacity, scale, y }
      }
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      variants={animationVariants}
    >
      <div className="relative w-full max-w-5xl aspect-[16/10] mb-12">
        <motion.div
          className="absolute -inset-8 bg-gradient-to-br from-blue-500/30 via-cyan-400/20 to-blue-600/30 rounded-[4rem] blur-[100px]"
          style={{ rotateY: shouldReduceMotion ? 0 : rotateY }}
          animate={{
            opacity: isVisible ? [0.4, 0.7, 0.4] : 0,
            scale: isVisible ? [1, 1.08, 1] : 1
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />

        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent rounded-[2.5rem]"
          style={{ opacity }}
        />

        <motion.div
          className="relative z-10 w-full h-full rounded-[2.5rem] overflow-hidden shadow-[0_30px_100px_-20px_rgba(0,0,0,0.7)] ring-1 ring-white/10"
          role="img"
          aria-label={item.altText}
          tabIndex={0}
          style={{ rotateY: shouldReduceMotion ? 0 : rotateY }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          {item.use3D && supports3D && item.model3D ? (
            <Suspense
              fallback={
                <ImageFallback
                  image={item.image}
                  imageLQIP={item.imageLQIP}
                  altText={item.altText}
                />
              }
            >
              <Engine3DModel modelPath={item.model3D} />
            </Suspense>
          ) : (
            <ImageFallback
              image={item.image}
              imageLQIP={item.imageLQIP}
              altText={item.altText}
            />
          )}
        </motion.div>
      </div>

      <motion.div
        className="text-center max-w-3xl px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
        transition={{ delay: shouldReduceMotion ? 0 : 0.35, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <h2 className="text-5xl md:text-7xl font-semibold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-400">
          {item.title}
        </h2>
        <p className="text-xl md:text-2xl text-gray-400 leading-relaxed font-light">
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
      <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-950 to-black flex items-center justify-center">
        <svg
          className="w-32 h-32 text-gray-700"
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
    <motion.img
      src={currentSrc}
      alt={altText}
      className="w-full h-full object-cover"
      style={{
        filter: imageLoaded ? 'blur(0) brightness(1.05) contrast(1.05)' : 'blur(20px)',
        transform: imageLoaded ? 'scale(1)' : 'scale(1.05)'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      loading="lazy"
    />
  );
}
