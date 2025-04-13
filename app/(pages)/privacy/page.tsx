import Head from "next/head";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <Head>
        <title>Privacy Policy - YourAppName</title>
        <meta name="description" content="Privacy Policy of YourAppName" />
      </Head>

      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="mb-4">
          Last updated: <strong>March 29, 2025</strong>
        </p>

        <p className="mb-4">
          Thebantayan Film Festival ("we," "our," or "us") is committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, and disclose your personal information.
        </p>

        <h2 className="text-2xl font-semibold mt-6">1. Information We Collect</h2>
        <p className="mb-4">
          We collect the following types of information:
        </p>
        <ul className="list-disc pl-5 mb-4">
          <li>
            <strong>Personal Information:</strong> This includes your name, email address, and any other information you provide when you register for an account, submit content, or contact us.
          </li>
          <li>
            <strong>Usage Data:</strong> We automatically collect information about how you use our platform, such as the films you watch, the comments you make, and the pages you visit.
          </li>
          <li>
            <strong>Device Information:</strong> We may collect information about the device you use to access our platform, such as your device type, operating system, and browser.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6">2. How We Use Your Information</h2>
        <p className="mb-4">
          We use your information for the following purposes:
        </p>
        <ul className="list-disc pl-5 mb-4">
          <li>
            To provide and improve our services.
          </li>
          <li>
            To personalize your experience.
          </li>
          <li>
            To communicate with you about updates, promotions, and other news.
          </li>
          <li>
            To ensure the security of our platform.
          </li>
          <li>
            To comply with legal obligations.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6">3. Data Security</h2>
        <p className="mb-4">
          We take reasonable measures to protect your information from unauthorized access, use, or disclosure.
          These measures include encryption, firewalls, and regular security audits.
        </p>

        <h2 className="text-2xl font-semibold mt-6">4. Your Rights</h2>
        <p className="mb-4">
          You have the following rights:
        </p>
        <ul className="list-disc pl-5 mb-4">
          <li>
            To access your personal information.
          </li>
          <li>
            To correct any inaccuracies in your personal information.
          </li>
          <li>
            To request the deletion of your personal information.
          </li>
          <li>
            To object to the processing of your personal information.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6">5. Third-Party Services</h2>
        <p className="mb-4">
          We may share your information with trusted third-party services for analytics, security, and advertising purposes.
          These services have their own privacy policies, which we encourage you to review.
        </p>

        <h2 className="text-2xl font-semibold mt-6">6. Updates to this Policy</h2>
        <p className="mb-4">
          We may update this Privacy Policy from time to time.
          We will notify you of any changes by posting the new policy on our platform.
        </p>

        <h2 className="text-2xl font-semibold mt-6">7. Contact Us</h2>
        <p className="mb-4">
          If you have any questions, contact us at
          <a href="mailto:support@thebantayanfilmfestival.com" className="text-blue-500"> support@thebantayanfilmfestival.com</a>.
        </p>
      </main>
    </div>
  );
}
