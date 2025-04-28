'use client';

import { cn } from '@/lib/utils';
import {
  motion,
  AnimatePresence,
  Transition,
  Variants,
  AnimatePresenceProps,
} from 'motion/react';
import { useState, useEffect, Children, useRef } from 'react';

export type TextLoopProps = {
  children: React.ReactNode[];
  className?: string;
  interval?: number;
  transition?: Transition;
  variants?: Variants;
  onIndexChange?: (index: number) => void;
  trigger?: boolean;
  mode?: AnimatePresenceProps['mode'];
};

export function TextLoop({
  children,
  className,
  interval = 2,
  transition = { duration: 0.3 },
  variants,
  onIndexChange,
  trigger = true,
  mode = 'popLayout',
}: TextLoopProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const items = Children.toArray(children);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Don't set up interval if not triggered or only one item
    if (!trigger || items.length <= 1) {
      // Make sure to clear any existing interval
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    
    const intervalMs = interval * 1000;
    
    // Clear any existing timers first
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Set up new interval
    timerRef.current = setInterval(() => {
      setCurrentIndex((current) => {
        const next = (current + 1) % items.length;
        if (onIndexChange) onIndexChange(next);
        return next;
      });
    }, intervalMs);
    
    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [items.length, interval, onIndexChange, trigger]);
  
  // Additional cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const motionVariants: Variants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  };

  // Don't animate if there's only one item
  if (items.length <= 1) {
    return <div className={cn('relative inline-block whitespace-nowrap', className)}>{items[0]}</div>;
  }

  return (
    <div className={cn('relative inline-block whitespace-nowrap overflow-hidden', className)}>
      <AnimatePresence mode={mode} initial={false}>
        <motion.div
          key={currentIndex}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transition}
          variants={variants || motionVariants}
        >
          {items[currentIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}