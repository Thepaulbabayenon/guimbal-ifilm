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
          YourAppName ("we," "our," or "us") is committed to protecting your privacy. 
          This Privacy Policy explains how we collect, use, and disclose your personal information.
        </p>

        <h2 className="text-2xl font-semibold mt-6">1. Information We Collect</h2>
        <p className="mb-4">
          We may collect information such as your name, email address, and usage data when you use our app.
        </p>

        <h2 className="text-2xl font-semibold mt-6">2. How We Use Your Information</h2>
        <p className="mb-4">
          We use your information to provide and improve our services, communicate with you, and ensure security.
        </p>

        <h2 className="text-2xl font-semibold mt-6">3. Third-Party Services</h2>
        <p className="mb-4">
          We may share your information with trusted third-party services for analytics and security purposes.
        </p>

        <h2 className="text-2xl font-semibold mt-6">4. Contact Us</h2>
        <p className="mb-4">
          If you have any questions, contact us at 
          <a href="mailto:support@yourapp.com" className="text-blue-500"> support@yourapp.com</a>.
        </p>
      </main>
    </div>
  );
}
