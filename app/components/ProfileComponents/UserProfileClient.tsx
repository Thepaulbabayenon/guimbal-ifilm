// components/UserProfileClient.tsx
'use client';

import { motion } from 'framer-motion';
import React from 'react';

type Props = {
  children: React.ReactNode;
};

export default function UserProfileClient({ children }: Props) {
  const animationProps = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  const staggerDelay = 0.15;

  return (
    <div className="space-y-8">
      {React.Children.map(children, (child, index) => (
        <motion.div
          {...animationProps}
          transition={{ ...animationProps.transition, delay: staggerDelay * index }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}
