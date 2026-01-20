'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const WireframeShip = dynamic(() => import('@/components/WireframeShip'), { ssr: false });

interface AnimatedShipEntryProps {
  className?: string;
}

export default function AnimatedShipEntry({ className }: AnimatedShipEntryProps) {
  return (
    <motion.div
      className={className}
      initial={{
        x: '-30%',
        y: '-50%',
        opacity: 0,
      }}
      animate={{
        x: '0%',
        y: '0%',
        opacity: 1,
      }}
      transition={{
        duration: 2.5,
        ease: [0.25, 0.1, 0.25, 1],
        opacity: { duration: 0.8 },
      }}
    >
      <WireframeShip className="w-full h-full" />
    </motion.div>
  );
}
