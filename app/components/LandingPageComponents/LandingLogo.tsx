"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import logo from "@/public/logo.svg";

export const LandingLogo = () => {
    return (
        <motion.div
            className="fixed top-5 left-5 flex items-center space-x-2 cursor-pointer"
            whileHover={{ scale: 1.5 }} 
            whileTap={{ scale: 0.5, rotate: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }} 
        >
            <Image src={logo} alt="Guimbal iFilm Logo" width={40} height={40} />
            <p className="text-yellow-400 text-sm font-semibold">
                GUIMBAL IFILM SOCIETY
            </p>
        </motion.div>
    );
};
