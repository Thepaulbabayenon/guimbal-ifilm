'use client'
import Link from 'next/link';
import React from 'react';
import { Logo } from '../../components/Logo';
import { motion } from 'framer-motion';

const sectionVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0 },
};

const headingVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

const TermsAndConditions: React.FC = () => {
  return (
    <div>
      <Logo />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto p-8 bg-black shadow-lg rounded-lg"
      >
        <motion.h1
          variants={headingVariants}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-3xl font-bold mb-6 border-b pb-2"
        >
          Terms and Conditions
        </motion.h1>

        <section className="mb-6">
          <motion.h2
            variants={headingVariants}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-2xl font-semibold mb-4"
          >
            Introduction
          </motion.h2>
          <p>
            Welcome to our platform. By using our services, you agree to comply
            with and be bound by the following terms and conditions. Please
            review these terms carefully.
          </p>
        </section>

        <section className="mb-6">
          <motion.h2
            variants={headingVariants}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-2xl font-semibold mb-4"
          >
            Account Registration
          </motion.h2>
          <div>
            <motion.h3
              variants={headingVariants}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-xl font-semibold mb-2"
            >
              User Accounts
            </motion.h3>
            <p>
              To access certain features of our platform, you must register for
              an account. During registration, you must provide accurate and
              complete information. You are responsible for maintaining the
              confidentiality of your account credentials and for all activities
              that occur under your account.
            </p>
          </div>
          <div className="mt-4">
            <motion.h3
              variants={headingVariants}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-xl font-semibold mb-2"
            >
              Account Security
            </motion.h3>
            <p>
              You must notify us immediately if you suspect any unauthorized use
              of your account. We are not liable for any loss or damage arising
              from your failure to comply with these security obligations.
            </p>
          </div>
        </section>

        <section className="mb-6">
          <motion.h2
            variants={headingVariants}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-2xl font-semibold mb-4"
          >
            User Responsibilities
          </motion.h2>
          <div>
            <motion.h3
              variants={headingVariants}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="text-xl font-semibold mb-2"
            >
              Compliance with Laws
            </motion.h3>
            <p>
              You agree to use our platform in compliance with all applicable
              laws and regulations.
            </p>
          </div>
          <div className="mt-4">
            <motion.h3
              variants={headingVariants}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="text-xl font-semibold mb-2"
            >
              Prohibited Activities
            </motion.h3>
            <p>You are prohibited from:</p>
            <ul className="list-disc list-inside ml-4">
              <li>Using our platform for any illegal activities.</li>
              <li>
                Attempting to gain unauthorized access to our system or user
                accounts.
              </li>
              <li>
                Using our platform to distribute malware or other harmful
                software.
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-6">
          <motion.h2
            variants={headingVariants}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="text-2xl font-semibold mb-4"
          >
            Content
          </motion.h2>
          <div>
            <motion.h3
              variants={headingVariants}
              transition={{ delay: 1.0, duration: 0.5 }}
              className="text-xl font-semibold mb-2"
            >
              User Content
            </motion.h3>
            <p>
              You retain ownership of any content you post on our platform. By
              posting content, you grant us a non-exclusive, worldwide,
              royalty-free license to use, reproduce, and distribute your
              content in connection with our services.
            </p>
          </div>
          <div className="mt-4">
            <motion.h3
              variants={headingVariants}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="text-xl font-semibold mb-2"
            >
              Prohibited Content
            </motion.h3>
            <p>You may not post content that:</p>
            <ul className="list-disc list-inside ml-4">
              <li>Is unlawful, defamatory, or obscene.</li>
              <li>Infringes on the intellectual property rights of others.</li>
              <li>Contains harmful or malicious software.</li>
            </ul>
          </div>
        </section>

        <section className="mb-6">
          <motion.h2
            variants={headingVariants}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="text-2xl font-semibold mb-4"
          >
            Data and Privacy
          </motion.h2>
          <div>
            <motion.h3
              variants={headingVariants}
              transition={{ delay: 1.3, duration: 0.5 }}
              className="text-xl font-semibold mb-2"
            >
              Data Collection
            </motion.h3>
            <p>
              We collect and use your personal data in accordance with our
              Privacy Policy. By using our platform, you consent to our data
              collection and use practices.
            </p>
          </div>
          <div className="mt-4">
            <motion.h3
              variants={headingVariants}
              transition={{ delay: 1.4, duration: 0.5 }}
              className="text-xl font-semibold mb-2"
            >
              User Data
            </motion.h3>
            <p>
              We are committed to protecting your data. However, you acknowledge
              that no method of transmission over the internet or electronic
              storage is completely secure.
            </p>
          </div>
        </section>

        <section className="mb-6">
          <motion.h2
            variants={headingVariants}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="text-2xl font-semibold mb-4"
          >
            Movie and Watchlist Features
          </motion.h2>
          <div>
            <motion.h3
              variants={headingVariants}
              transition={{ delay: 1.6, duration: 0.5 }}
              className="text-xl font-semibold mb-2"
            >
              Movies
            </motion.h3>
            <p>
              Our platform provides information about various movies, including
              images, titles, overviews, and more. While we strive to ensure the
              accuracy of this information, we do not guarantee its completeness
              or accuracy.
            </p>
          </div>
          <div className="mt-4">
            <motion.h3
              variants={headingVariants}
              transition={{ delay: 1.7, duration: 0.5 }}
              className="text-xl font-semibold mb-2"
            >
              Watchlists
            </motion.h3>
            <p>
              You can create and manage watchlists on our platform. Movies added
              to your watchlist may be subject to availability and other
              limitations.
            </p>
          </div>
        </section>

        <section className="mb-6">
          <motion.h2
            variants={headingVariants}
            transition={{ delay: 1.8, duration: 0.5 }}
            className="text-2xl font-semibold mb-4"
          >
            Termination
          </motion.h2>
          <p>
            We reserve the right to terminate or suspend your account at our
            sole discretion, without prior notice, for conduct that we believe
            violates these terms or is harmful to other users of our platform.
          </p>
        </section>

        <section className="mb-6">
          <motion.h2
            variants={headingVariants}
            transition={{ delay: 1.9, duration: 0.5 }}
            className="text-2xl font-semibold mb-4"
          >
            Disclaimer of Warranties
          </motion.h2>
          <p>
            Our platform is provided "as is" and "as available." We disclaim all
            warranties, express or implied, including, but not limited to,
            implied warranties of merchantability and fitness for a particular
            purpose.
          </p>
        </section>

        <section className="mb-6">
          <motion.h2
            variants={headingVariants}
            transition={{ delay: 2.0, duration: 0.5 }}
            className="text-2xl font-semibold mb-4"
          >
            Limitation of Liability
          </motion.h2>
          <p>
            To the fullest extent permitted by law, we shall not be liable for
            any indirect, incidental, special, consequential, or punitive
            damages, or any loss of profits or revenues, whether incurred
            directly or indirectly, or any loss of data, use, goodwill, or other
            intangible losses, resulting from:
          </p>
          <ul className="list-disc list-inside ml-4">
            <li>Your use of or inability to use our platform.</li>
            <li>
              Any unauthorized access to or use of our servers and/or any
              personal information stored therein.
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <motion.h2
            variants={headingVariants}
            transition={{ delay: 2.1, duration: 0.5 }}
            className="text-2xl font-semibold mb-4"
          >
            Changes to Terms
          </motion.h2>
          <p>
            We reserve the right to modify these terms at any time. We will
            provide notice of changes by posting the new terms on our platform.
            Your continued use of our platform following the posting of changes
            constitutes your acceptance of such changes.
          </p>
        </section>

        <section className="mb-6">
          <motion.h2
            variants={headingVariants}
            transition={{ delay: 2.2, duration: 0.5 }}
            className="text-2xl font-semibold mb-4"
          >
            Contact Us
          </motion.h2>
          <p>
            If you have any questions about these terms, please contact us{' '}
            <Link href="/about">
              <span className="underline">here</span>
            </Link>
            .
          </p>
        </section>
      </motion.div>
    </div>
  );
};

export default TermsAndConditions;
