'use client'
import Link from 'next/link';
import  Logo  from '../../public/logo.svg';
import { motion } from 'framer-motion';

import React, { ReactNode } from 'react';

const sectionVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  };
  
  const headingVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

export default function PageLayout({children} : {children : ReactNode}) {
    return (
        <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ duration: 0.5 }}
        >
        <div className="layout">
            <div className="centered-content relative flex h-screen flex-col
        bg-black md:items-center md:justify-center
        md:bg-transparent">
                {children}
            </div>
        </div>
        </motion.div>
    );
}

