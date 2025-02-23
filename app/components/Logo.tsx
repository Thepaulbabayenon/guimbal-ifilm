"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import logo from "../../public/logo.svg";

export const Logo = () => {
    return (
        <Link href="/home">
            <motion.div
                className="fixed top-5 left-5 cursor-pointer"
                whileHover={{ scale: 1.1 }} // Slight scale-up on hover
                whileTap={{ scale: 0.9, rotate: -10 }} // Shrinks & tilts when clicked
                transition={{ type: "spring", stiffness: 200, damping: 10 }} // Smooth animation
            >
                <Image src={logo} alt="GuimbalIfilm Logo" width={90} height={50} />
            </motion.div>
        </Link>
    );
};
