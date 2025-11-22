import { useEffect, useRef, useState, Suspense, lazy } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
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
      className="relative bg-black text-white overflow-hidden"
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
  scrollProgress: any;
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
    [startProgress, startProgress + 0.1, endProgress - 0.1, endProgress],
    [0, 1, 1, 0]
  );

  const scale = useTransform(
    scrollProgress,
    [startProgress, startProgress + 0.1, endProgress - 0.1, endProgress],
    [0.95, 1, 1, 0.95]
  );

  const y = useTransform(
    scrollProgress,
    [startProgress, startProgress + 0.1, endProgress - 0.1, endProgress],
    [20, 0, 0, -20]
  );

  const rotateY = useTransform(
    scrollProgress,
    [startProgress, startProgress + 0.15],
    [index % 2 === 0 ? -15 : 15, 0]
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
      scale: 0.95,
      y: 20,
      rotateY: index % 2 === 0 ? -15 : 15
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      rotateY: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.7,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  const supports3D = typeof window !== 'undefined' &&
    window.WebGLRenderingContext !== undefined;

  return (
    <motion.div
      ref={itemRef}
      className="absolute inset-0 flex flex-col items-center justify-center"
      style={
        shouldReduceMotion
          ? { opacity: isVisible ? 1 : 0 }
          : { opacity, scale, y }
      }
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      variants={animationVariants}
    >
      <div className="relative w-full max-w-4xl aspect-[4/3] mb-8">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-purple-500/20 rounded-3xl blur-3xl"
          style={{ rotateY: shouldReduceMotion ? 0 : rotateY }}
          animate={{
            opacity: isVisible ? [0.3, 0.6, 0.3] : 0
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />

        <div
          className="relative z-10 w-full h-full rounded-3xl overflow-hidden shadow-2xl"
          role="img"
          aria-label={item.altText}
          tabIndex={0}
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
        </div>
      </div>

      <motion.div
        className="text-center max-w-2xl px-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 10 }}
        transition={{ delay: shouldReduceMotion ? 0 : 0.3, duration: 0.5 }}
      >
        <h2 className="text-4xl md:text-6xl font-semibold tracking-tight mb-4">
          {item.title}
        </h2>
        <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
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
          className="w-32 h-32 text-gray-600"
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
      className="w-full h-full object-cover transition-all duration-500"
      style={{
        filter: imageLoaded ? 'blur(0)' : 'blur(20px)',
        transform: imageLoaded ? 'scale(1)' : 'scale(1.05)'
      }}
      loading="lazy"
    />
  );
}
