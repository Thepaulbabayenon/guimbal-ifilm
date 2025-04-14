import Head from "next/head";
import Link from "next/link"; // Import Link

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 py-12"> {/* Dark Theme */}
      <Head>
        {/* Update Title */}
        <title>Privacy Policy - Guimbal iFilm Platform</title>
        <meta name="description" content="Privacy Policy for the Guimbal iFilm Society Streaming Platform" />
      </Head>

      {/* Adjusted padding and max-width */}
      <main className="max-w-4xl mx-auto p-6 sm:p-8 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4 text-white border-b border-gray-700 pb-2">Privacy Policy</h1>
        <p className="mb-6 text-sm text-gray-400">
          {/* Update Date */}
          Last updated: <strong>July 19, 2025</strong>
        </p>

        <p className="mb-4">
          The Guimbal iFilm Society and the maintainers of this streaming platform ("we," "our," or "us") are committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our cloud-based streaming platform (the "Platform"). Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the platform.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-red-400">1. Information We Collect</h2>
        <p className="mb-4">
          We may collect information about you in a variety of ways. The information we may collect on the Platform includes:
        </p>
        <ul className="list-disc space-y-2 pl-6 mb-4 text-gray-300">
          <li>
            <strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, that you voluntarily give to us when you register with the Platform or when you choose to participate in various activities related to the Platform, such as creating a profile, or contacting us.
          </li>
          <li>
            <strong>Usage Data:</strong> Information our servers automatically collect when you access the Platform, such as your IP address, browser type, operating system, access times, and the pages you have viewed directly before and after accessing the Platform. We also collect information about your interactions with the Platform, including films watched, watch duration, ratings provided, comments made (if feature is available), and items added to your watchlist. This data is crucial for the functioning of our recommendation system.
          </li>
          <li>
            <strong>Device Information:</strong> Information about your computer or mobile device, such as device ID, model, manufacturer, and operating system, used to access the Platform.
          </li>
           <li>
            <strong>Data From Social Networks:</strong> User information from social networking sites, such as Google, including your name, your social network username, location, gender, birth date, email address, profile picture, and public data for contacts, if you connect your account to such social networks.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-red-400">2. How We Use Your Information</h2>
        <p className="mb-4">
          Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Platform to:
        </p>
        <ul className="list-disc space-y-2 pl-6 mb-4 text-gray-300">
          <li>Create and manage your account.</li>
          <li>Provide, operate, and maintain the Platform.</li>
          <li>Improve, personalize, and expand the Platform and its content.</li>
          <li>Deliver personalized film recommendations using our custom hybrid algorithm based on your viewing history, preferences, and similar user patterns.</li>
          <li>Understand and analyze how you use the Platform for improvements and feature development.</li>
          <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the Platform, and for informational purposes (not typically marketing for this type of platform).</li>
          <li>Process your interactions (like ratings or watchlist additions).</li>
          <li>Find and prevent fraud and ensure the security of the Platform.</li>
          <li>Comply with legal obligations.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-red-400">3. Disclosure of Your Information</h2>
         <p className="mb-4">
            We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
         </p>
         <ul className="list-disc space-y-2 pl-6 mb-4 text-gray-300">
            <li>
                <strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.
            </li>
             <li>
                <strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including data analysis, hosting services (e.g., AWS, NeonDB as per thesis), customer service, and recommendation algorithm processing. These providers will have access to your information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
            </li>
            <li>
                <strong>Aggregated Data:</strong> We may share aggregated and anonymized data, which does not identify you, for analysis or research purposes.
            </li>
            {/* Add sections for Business Transfers or Affiliates only if applicable */}
         </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-red-400">4. Data Security</h2>
        <p className="mb-4">
          We use administrative, technical, and physical security measures to help protect your personal information. We leverage cloud provider security features (e.g., AWS security tools) and implement best practices like data encryption where feasible. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-red-400">5. Your Data Rights</h2>
        <p className="mb-4">
          Depending on your location, you may have the following rights regarding your personal information:
        </p>
        <ul className="list-disc space-y-2 pl-6 mb-4 text-gray-300">
          <li>The right to request access to the personal data we hold about you.</li>
          <li>The right to request correction of inaccurate personal data.</li>
          <li>The right to request deletion of your personal data, subject to certain exceptions.</li>
          <li>The right to object to or restrict processing of your personal data under certain conditions.</li>
          <li>The right to data portability under certain conditions.</li>
        </ul>
        <p className="mb-4">
            To exercise these rights, please contact us using the contact information provided below.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-red-400">6. Policy for Children</h2>
         <p className="mb-4">
            We do not knowingly solicit information from or market to children under the age of 13 (or higher age as required by local law). If we learn that we have collected personal information from a child under the relevant age without verification of parental consent, we will delete that information as quickly as possible. If you believe we might have any information from or about a child under the relevant age, please contact us.
         </p>


        <h2 className="text-2xl font-semibold mt-8 mb-3 text-red-400">7. Third-Party Websites & Services</h2>
        <p className="mb-4">
          The Platform may contain links to third-party websites and applications of interest, including advertisements and external services, that are not affiliated with us. Once you have used these links to leave the Platform, any information you provide to these third parties is not covered by this Privacy Policy, and we cannot guarantee the safety and privacy of your information. We are not responsible for the content or privacy and security practices and policies of any third parties.
        </p>


        <h2 className="text-2xl font-semibold mt-8 mb-3 text-red-400">8. Updates to this Policy</h2>
        <p className="mb-4">
          We may update this Privacy Policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal, or regulatory reasons. We will notify you of any changes by posting the new Privacy Policy on the Platform and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-red-400">9. Contact Us</h2>
        <p className="mb-4">
          If you have questions or comments about this Privacy Policy, please contact us at:
          {/* Update Email */}
          <Link href="mailto:support@ifilmplatform.com" className="text-red-400 hover:text-red-300 ml-1">
            support@ifilmplatform.com 
          </Link>
          {/* Or provide Society contact */}
           or
          <Link href="mailto:thebantayanfilmfestival@gmail.com" className="text-red-400 hover:text-red-300 ml-1">
             thebantayanfilmfestival@gmail.com
          </Link>
        </p>
      </main>
    </div>
  );
}