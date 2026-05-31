import { motion } from 'framer-motion';

const slide = {
  initial: { opacity: 0, y: 28, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -16, filter: 'blur(6px)' },
};

export default function PageTransition({ children }) {
  return (
    <motion.div
      initial={slide.initial}
      animate={slide.animate}
      exit={slide.exit}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
