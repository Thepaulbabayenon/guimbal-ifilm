"use client";
import React from "react";
import Link from "next/link";

const CookiePolicyPage = () => {
  const currentYear = new Date().getFullYear();

  return (
    <main className="bg-neutral-900 text-gray-300 min-h-screen">
      <div className="max-w-screen-lg mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-white mb-8">Cookie Policy</h1>
        <p className="text-gray-400 mb-4">Last Updated: July 20, {currentYear}</p> {/* Use a relevant date */}

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-4">What Are Cookies?</h2>
          <p className="text-gray-400 leading-relaxed">
            Cookies are small text files stored on your device (computer, tablet, mobile phone) when you visit certain websites. They are widely used to make websites work, or work more efficiently, as well as to provide information to the owners of the site. Cookies help us recognize your device and remember information about your visit, like your preferences, settings, and how you use our platform.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-4">How We Use Cookies</h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            The Guimbal iFilm Society streaming platform uses cookies for several essential purposes to enhance your experience:
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-3 leading-relaxed">
            <li>
              <span className="font-medium text-gray-300">Essential Functionality:</span> Some cookies are strictly necessary to provide you with services available through our platform and to use some of its features, such as accessing secure areas (logging into your account) and managing your session. Without these cookies, the services that you have asked for cannot be provided.
            </li>
            <li>
              <span className="font-medium text-gray-300">Performance and Analytics:</span> We use cookies to collect information about how you interact with our platform, such as which pages you visit most often, how long you stay on a page, and if you encounter any error messages. This data helps us understand usage patterns and improve the performance and usability of our service. We may use third-party analytics tools (like potentially Google Analytics) for this purpose, which may set their own cookies.
            </li>
            <li>
              <span className="font-medium text-gray-300">Personalization and Preferences:</span> These cookies allow our platform to remember choices you make (such as your username, preferred language, or region) and provide enhanced, more personal features. For example, they help us remember your playback progress on a film or tailor content recommendations based on your viewing history and preferences, which is core to our custom recommendation algorithm.
            </li>
            <li>
              <span className="font-medium text-gray-300">Security:</span> We use cookies to help maintain the security and integrity of our platform, such as detecting and preventing fraudulent activity and protecting your user data.
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-4">Types of Cookies We Use</h2>
          <ul className="list-disc list-inside text-gray-400 space-y-3 leading-relaxed">
            <li>
              <span className="font-medium text-gray-300">Session Cookies:</span> These are temporary cookies that expire once you close your browser. They are used for essential functions like maintaining your login state during a visit.
            </li>
            <li>
              <span className="font-medium text-gray-300">Persistent Cookies:</span> These cookies remain on your device for a set period or until you delete them. They help us recognize you as a returning user and remember your preferences for future visits.
            </li>
            <li>
              <span className="font-medium text-gray-300">First-Party Cookies:</span> These are set directly by our platform.
            </li>
             <li>
              <span className="font-medium text-gray-300">Third-Party Cookies:</span> These may be set by external services we use for analytics or specific functionalities. We aim to minimize the use of third-party cookies and ensure any partners adhere to strict privacy standards. (Note: Specify actual third parties if known, e.g., Google Analytics).
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-4">Your Choices and Managing Cookies</h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            You have the right to decide whether to accept or reject cookies (other than strictly necessary ones). Most web browsers allow some control of most cookies through the browser settings. You can typically set your browser to block cookies or to alert you when cookies are being sent.
          </p>
          <p className="text-gray-400 leading-relaxed mb-4">
            Please note that if you choose to block or reject cookies, you may still use our platform, but your access to some functionality and areas may be restricted or impaired. Essential features like logging in might not work correctly.
          </p>
          <p className="text-gray-400 leading-relaxed">
            To find out more about cookies, including how to see what cookies have been set and how to manage and delete them, visit <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline">www.allaboutcookies.org</a> or <a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline">www.aboutcookies.org</a>.
          </p>
          {/* Add links to browser-specific guides if desired */}
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-4">Changes to This Cookie Policy</h2>
          <p className="text-gray-400 leading-relaxed">
            We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We encourage you to review this policy periodically to stay informed about our use of cookies.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
          <p className="text-gray-400 leading-relaxed">
            If you have any questions about our use of cookies or this Cookie Policy, please contact us through our{' '}
            <Link href="/contact" className="text-indigo-400 hover:text-indigo-300 underline">
              Contact Page
            </Link>{' '}
            or refer to our{' '}
            <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300 underline">
              Privacy Policy
            </Link>
            {' '}for more information on how we handle your data.
          </p>
        </section>
      </div>
    </main>
  );
};

export default CookiePolicyPage;