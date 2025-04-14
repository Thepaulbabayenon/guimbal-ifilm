"use client"
import React, { useState } from 'react';
import { FiHeart, FiUser, FiAward, FiCheck } from 'react-icons/fi'; // Icons for support/perks

// Interface for a support tier
interface SupportTier {
    id: number;
    name: string;
    price: number | 'Custom'; // Allow fixed price or custom donation
    frequency: 'monthly' | 'one-time';
    description: string;
    features: string[];
    isPopular?: boolean;
}

const SupportTiersPage: React.FC = () => {
    const [supportTiers] = useState<SupportTier[]>([
        {
            id: 1,
            name: "Community Member",
            price: 0,
            frequency: 'monthly', // Or N/A
            description: "Enjoy access to the film archive.",
            features: [
                "Access to the full Guimbal iFilm Society archive",
                "Standard streaming quality",
                "Basic recommendations"
            ]
        },
        {
            id: 2,
            name: "Platform Supporter",
            price: 150, 
            frequency: 'monthly',
            description: "Help sustain the platform and archive preservation.",
            features: [
                "All Community Member features",
                "Supporter badge on profile (coming soon)",
                "Access to supporter-only updates/news",
                "Warm fuzzy feeling of supporting local arts!"
            ],
            isPopular: true,
        },
        {
            id: 3,
            name: "Festival Patron",
            price: 500,
            frequency: 'monthly',
            description: "Directly support the filmmakers and the annual festival.",
            features: [
                "All Platform Supporter features",
                "Early access notifications for festival events",
                "Special mention in platform supporter list (optional)",
                "Higher priority support (if applicable)"
            ]
        },
         {
            id: 4,
            name: "One-Time Donation",
            price: 'Custom',
            frequency: 'one-time',
            description: "Make a single contribution to support the cause.",
            features: [
                "Directly supports the Society and Platform",
                "Acknowledgement of your contribution",
                "Flexible amount"
            ]
        }
    ]);

    const [selectedTierId, setSelectedTierId] = useState<number | null>(2); // Default to popular
    const [customAmount, setCustomAmount] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [processMessage, setProcessMessage] = useState<string>('');


    const handleTierSelect = (tierId: number) => {
        setSelectedTierId(tierId);
        setProcessMessage(''); // Clear previous messages
    };

    const handleSupportAction = () => {
        const selectedTier = supportTiers.find(tier => tier.id === selectedTierId);
        if (!selectedTier) {
            setProcessMessage("Please select a support tier.");
            return;
        }

        setIsProcessing(true);
        setProcessMessage('');

        let amount = selectedTier.price;
        if (selectedTier.price === 'Custom') {
            const parsedAmount = parseFloat(customAmount);
            if (isNaN(parsedAmount) || parsedAmount <= 0) {
                 setProcessMessage("Please enter a valid donation amount.");
                 setIsProcessing(false);
                 return;
            }
            amount = parsedAmount;
        }


        // --- Placeholder for Payment/Subscription Processing ---
        console.log(`Processing support for: ${selectedTier.name}`);
        console.log(`Amount: ${amount}, Frequency: ${selectedTier.frequency}`);
        // In a real app, integrate with Stripe, PayPal, or another payment gateway here.
        // This would involve redirecting the user or using a payment element.

        setTimeout(() => { // Simulate processing
            setProcessMessage(`Thank you for supporting the ${selectedTier.name} tier! (Simulation)`);
            setIsProcessing(false);
             // Optionally redirect to a thank you page or dashboard
        }, 2000);
        // --- End Placeholder ---
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white py-12"> {/* Dark theme */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <FiHeart className="text-red-500 text-5xl mx-auto mb-4"/>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">Support the Platform & Society</h1>
                    <p className="mt-4 text-xl text-gray-400 max-w-2xl mx-auto">
                        Your contribution helps preserve local films and keeps this platform accessible. Choose a way to support us!
                    </p>
                </div>

                {/* Support Tiers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
                    {supportTiers.map(tier => (
                        <div
                            key={tier.id}
                            className={`relative flex flex-col bg-gray-800 rounded-xl shadow-lg p-6 border-2 transition-all ${
                                selectedTierId === tier.id ? 'border-red-500 scale-105' : 'border-gray-700 hover:border-red-400'
                            }`}
                        >
                             {tier.isPopular && selectedTierId !== tier.id && (
                                <div className="absolute top-0 right-0 -mt-3 mr-3 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">
                                    Popular
                                </div>
                            )}
                            <div className="flex-grow">
                                <h2 className="text-xl font-bold text-white mb-2">{tier.name}</h2>
                                <p className="text-sm text-gray-400 mb-4">{tier.description}</p>
                                <div className="mb-6">
                                    <span className="text-3xl font-extrabold text-white">
                                        {typeof tier.price === 'number' ? `₱${tier.price.toFixed(2)}` : 'Custom'}
                                    </span>
                                     {typeof tier.price === 'number' && tier.frequency === 'monthly' && (
                                        <span className="text-sm text-gray-400">/ month</span>
                                    )}
                                     {tier.frequency === 'one-time' && typeof tier.price !== 'number' && (
                                        <span className="text-sm text-gray-400"> (One-Time)</span>
                                    )}
                                </div>
                                <ul className="space-y-2 text-sm mb-6">
                                    {tier.features.map((feature, index) => (
                                        <li key={index} className="flex items-start">
                                            <FiCheck className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-300">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Custom Amount Input */}
                            {tier.price === 'Custom' && selectedTierId === tier.id && (
                                <div className="mb-4">
                                    <label htmlFor="customAmount" className="block text-sm font-medium text-gray-300 mb-1">Enter Amount (₱)</label>
                                    <input
                                        type="number"
                                        id="customAmount"
                                        name="customAmount"
                                        min="1"
                                        step="1"
                                        value={customAmount}
                                        onChange={(e) => setCustomAmount(e.target.value)}
                                        required={selectedTierId === tier.id && tier.price === 'Custom'}
                                        className="block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                                        placeholder="e.g., 10"
                                        disabled={isProcessing}
                                    />
                                </div>
                            )}

                            {/* Select Button */}
                            <button
                                onClick={() => handleTierSelect(tier.id)}
                                disabled={isProcessing}
                                className={`w-full mt-auto px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                                    selectedTierId === tier.id
                                        ? 'bg-red-600 text-white cursor-default'
                                        : 'bg-gray-700 text-gray-300 hover:bg-red-800 hover:text-white'
                                }`}
                            >
                                {selectedTierId === tier.id ? 'Selected' : 'Select Tier'}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Action Button Area */}
                 <div className="mt-12 text-center">
                    {processMessage && (
                        <p className={`mb-4 text-sm ${processMessage.includes('Thank you') ? 'text-green-400' : 'text-red-400'}`}>{processMessage}</p>
                    )}
                    <button
                        onClick={handleSupportAction}
                        disabled={selectedTierId === null || isProcessing}
                        className="px-8 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                        {isProcessing ? 'Processing...' : `Proceed with ${supportTiers.find(t => t.id === selectedTierId)?.name || 'Selection'}`}
                    </button>
                     <p className="text-xs text-gray-500 mt-4">
                         Secure processing placeholder. You will be redirected to a payment provider in a real implementation.
                     </p>
                </div>
            </div>
        </div>
    );
}

export default SupportTiersPage; // Renamed component