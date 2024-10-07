"use client"
import React, { useState } from 'react';

interface SubscriptionPlan {
    id: number;
    name: string;
    price: number;
    features: string[];
}

const SubscriptionsPage: React.FC = () => {
    const [subscriptionPlans] = useState<SubscriptionPlan[]>([
        {
            id: 1,
            name: "Basic Plan",
            price: 19.99,
            features: ["Access to basic features", "Limited support"]
        },
        {
            id: 2,
            name: "Premium Plan",
            price: 29.99,
            features: ["Access to all features", "Priority support"]
        },
        {
            id: 3,
            name: "Enterprise Plan",
            price: 49.99,
            features: ["Access to all features", "Dedicated account manager"]
        }
    ]);

    const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

    const handlePlanSelect = (planId: number) => {
        setSelectedPlan(planId);
    };

    const handleSubscription = () => {
        if (selectedPlan !== null) {
            console.log(`Subscribing to plan with id: ${selectedPlan}`);
        } else {
            console.error("No plan selected.");
        }
    };

    return (
        <div className="subscriptions-page">
            <h1>Subscription Plans</h1>
            <div className="subscription-plans">
                {subscriptionPlans.map(plan => (
                    <div key={plan.id} className={`plan ${selectedPlan === plan.id ? 'selected' : ''}`}>
                        <h2>{plan.name}</h2>
                        <p><strong>Price:</strong> ${plan.price.toFixed(2)} / month</p>
                        <ul>
                            {plan.features.map((feature, index) => (
                                <li key={index}>{feature}</li>
                            ))}
                        </ul>
                        <button onClick={() => handlePlanSelect(plan.id)}>
                            {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                        </button>
                    </div>
                ))}
            </div>
            <div className="subscribe-button">
                <button onClick={handleSubscription} disabled={selectedPlan === null}>
                    Subscribe Now
                </button>
            </div>
        </div>
    );
}

export default SubscriptionsPage;
