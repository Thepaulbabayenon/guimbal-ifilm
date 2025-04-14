'use client'
import Link from 'next/link';
import React from 'react';
// Remove Logo import if not needed/available, or adjust path
// import { Logo } from '../../components/Logo';
import { motion } from 'framer-motion';
import { FiFileText } from 'react-icons/fi'; // Add an icon

// Animation variants (can be reused or customized)
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const headingVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { delay: 0.1, duration: 0.4 } },
};


const TermsAndConditions: React.FC = () => {
  return (
    // Apply dark theme background
    <div className="min-h-screen bg-gray-900 text-gray-300 py-12">
      {/* Optional: Add a simple logo/header if needed */}
      {/* <div className="text-center mb-8"><Logo /></div> */}

       {/* Adjusted max-width and padding */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="max-w-4xl mx-auto p-6 sm:p-10 bg-gray-800 shadow-xl rounded-lg border border-gray-700"
      >
        <motion.div
            variants={headingVariants}
            className="flex items-center mb-8 pb-4 border-b border-gray-700" // Added bottom border
        >
            <FiFileText className="text-red-500 text-4xl mr-4"/>
            <h1 className="text-3xl font-bold text-white">
              Terms and Conditions
            </h1>
        </motion.div>

        <p className="mb-6 text-sm text-gray-400">
            Last Updated: July 19, 2025
        </p>

        <section className="mb-8">
          <motion.h2 variants={headingVariants} className="text-2xl font-semibold mb-4 text-red-400">
            1. Introduction
          </motion.h2>
          <p>
            Welcome to the Guimbal iFilm Society Streaming Platform ("Platform", "we," "our," or "us"). This Platform provides access to a collection of films primarily from the Guimbal iFilm Society archive. By accessing or using our Platform, you agree to comply with and be bound by the following terms and conditions ("Terms"). Please review these Terms carefully. If you do not agree to these Terms, you should not use the Platform.
          </p>
        </section>

        <section className="mb-8">
          <motion.h2 variants={headingVariants} className="text-2xl font-semibold mb-4 text-red-400">
            2. Account Registration
          </motion.h2>
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2 text-white">User Accounts</h3>
            <p>
              To access certain features, such as watchlists and personalized recommendations, you may need to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 text-white">Account Security</h3>
            <p>
              You are responsible for safeguarding your password and any other credentials used to access your account. You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account. You are liable for activities conducted through your account.
            </p>
          </div>
        </section>

         <section className="mb-8">
          <motion.h2 variants={headingVariants} className="text-2xl font-semibold mb-4 text-red-400">
            3. Use of the Platform
          </motion.h2>
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2 text-white">Permitted Use</h3>
            <p>
              You are granted a limited, non-exclusive, non-transferable license to access and use the Platform for personal, non-commercial purposes, primarily for streaming the available film content, subject to these Terms.
            </p>
          </div>
           <div>
            <h3 className="text-xl font-semibold mb-2 text-white">Prohibited Activities</h3>
            <p>You agree not to engage in any of the following prohibited activities:</p>
            <ul className="list-disc list-inside ml-4 space-y-1 mt-2 text-gray-300">
              <li>Copying, distributing, modifying, or creating derivative works of the Platform or its content without authorization.</li>
              <li>Downloading, screen-capturing, or otherwise attempting to save copies of the films streamed on the Platform.</li>
              <li>Using the Platform for any illegal purpose or in violation of any local, state, national, or international law.</li>
              <li>Attempting to interfere with, compromise the system integrity or security, or decipher any transmissions to or from the servers running the Platform.</li>
              <li>Uploading invalid data, viruses, worms, or other software agents through the Platform.</li>
               <li>Impersonating another person or otherwise misrepresenting your affiliation with a person or entity.</li>
               <li>Circumventing any measures we may use to prevent or restrict access to the Platform.</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <motion.h2 variants={headingVariants} className="text-2xl font-semibold mb-4 text-red-400">
            4. Content and Intellectual Property
          </motion.h2>
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2 text-white">Platform Content</h3>
            <p>
              The films, images, text, graphics, logos, user interface, recommendation algorithms, and other content available on the Platform ("Platform Content") are the property of the Guimbal iFilm Society, its licensors (the filmmakers), or the platform developers, and are protected by copyright, trademark, and other intellectual property laws.
            </p>
          </div>
           <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2 text-white">Film Content</h3>
            <p>
              The films provided on the Platform are intended for streaming only. You acknowledge that the films are protected by copyright and other laws, and unauthorized reproduction, distribution, modification, or public display is strictly prohibited. The availability of films may change over time.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 text-white">User-Generated Content</h3>
            <p>
               If the Platform allows users to post comments, reviews, or other content ("User Content"), you retain ownership of your User Content. However, by submitting User Content, you grant us a non-exclusive, worldwide, royalty-free, perpetual, irrevocable license to use, reproduce, modify, adapt, publish, translate, distribute, and display such User Content in connection with the Platform. You are solely responsible for your User Content and represent that you have all necessary rights to grant this license. You may not post User Content that is illegal, defamatory, obscene, infringing, or otherwise objectionable.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <motion.h2 variants={headingVariants} className="text-2xl font-semibold mb-4 text-red-400">
            5. Privacy
          </motion.h2>
          <p>
            Your privacy is important to us. Our collection and use of personal information in connection with the Platform are described in our{' '}
            <Link href="/privacy-policy">
              <span className="text-red-400 hover:underline">Privacy Policy</span>
            </Link>
            , which is incorporated by reference into these Terms. By using the Platform, you agree to the collection and use of information in accordance with the Privacy Policy.
          </p>
        </section>


        <section className="mb-8">
          <motion.h2 variants={headingVariants} className="text-2xl font-semibold mb-4 text-red-400">
            6. Film Viewing and Features
          </motion.h2>
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2 text-white">Streaming Quality</h3>
            <p>
              The quality of the display of the streaming films may vary from device to device, and may be affected by a variety of factors, such as your location, the bandwidth available through and/or speed of your Internet connection. We make no representations or warranties about the quality of your watching experience on your display.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 text-white">Watchlists & Recommendations</h3>
            <p>
              Features like watchlists and personalized recommendations are provided as a convenience. We do not guarantee the accuracy or relevance of recommendations. Films added to your watchlist are subject to availability on the Platform.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <motion.h2 variants={headingVariants} className="text-2xl font-semibold mb-4 text-red-400">
            7. Termination
          </motion.h2>
          <p>
            We may terminate or suspend your access to the Platform immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms. Upon termination, your right to use the Platform will immediately cease. If you wish to terminate your account, you may simply discontinue using the Platform or contact us to request account deletion.
          </p>
        </section>

        <section className="mb-8">
          <motion.h2 variants={headingVariants} className="text-2xl font-semibold mb-4 text-red-400">
            8. Disclaimer of Warranties
          </motion.h2>
          <p>
            The Platform is provided on an "AS IS" and "AS AVAILABLE" basis. Your use of the Platform is at your sole risk. To the fullest extent permitted by applicable law, we expressly disclaim all warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement. We do not warrant that the Platform will meet your requirements; that the Platform will be uninterrupted, timely, secure, or error-free; or that the results obtained from the use of the Platform will be accurate or reliable.
          </p>
        </section>

        <section className="mb-8">
          <motion.h2 variants={headingVariants} className="text-2xl font-semibold mb-4 text-red-400">
            9. Limitation of Liability
          </motion.h2>
          <p>
            To the fullest extent permitted by applicable law, neither the Guimbal iFilm Society nor the platform developers/maintainers shall be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from (a) your access to or use of or inability to access or use the Platform; (b) any conduct or content of any third party on the Platform; (c) any content obtained from the Platform; or (d) unauthorized access, use, or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence), or any other legal theory, whether or not we have been informed of the possibility of such damage.
          </p>
        </section>

        <section className="mb-8">
          <motion.h2 variants={headingVariants} className="text-2xl font-semibold mb-4 text-red-400">
            10. Governing Law
          </motion.h2>
          <p>
              These Terms shall be governed and construed in accordance with the laws of the Philippines, without regard to its conflict of law provisions.
          </p>
        </section>


        <section className="mb-8">
          <motion.h2 variants={headingVariants} className="text-2xl font-semibold mb-4 text-red-400">
            11. Changes to Terms
          </motion.h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice (e.g., via a notice on the platform) prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Platform after any revisions become effective, you agree to be bound by the revised terms.
          </p>
        </section>

        <section className="mb-6">
          <motion.h2 variants={headingVariants} className="text-2xl font-semibold mb-4 text-red-400">
            12. Contact Us
          </motion.h2>
          <p>
            If you have any questions about these Terms, please{' '}
            <Link href="/contact">
              <span className="text-red-400 hover:underline">contact us</span>
            </Link>
            .
          </p>
        </section>
      </motion.div>
    </div>
  );
};

export default TermsAndConditions;