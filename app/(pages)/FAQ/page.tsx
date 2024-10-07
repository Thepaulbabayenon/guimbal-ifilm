import React from 'react';

const FAQPage: React.FC = () => {
    const faqs = [
        {
            id: 1,
            question: "What payment methods do you accept?",
            answer: "We accept credit/debit cards (Visa, MasterCard, American Express) and PayPal."
        },
        {
            id: 2,
            question: "How can I track my order?",
            answer: "You can track your order by logging into your account and visiting the order tracking page."
        },
        {
            id: 3,
            question: "Do you offer international shipping?",
            answer: "Yes, we offer international shipping to most countries. Shipping rates and times may vary."
        },
    ];

    return (
        <div className="faq-page">
            <h1>FAQ</h1>
            <div className="faq-list">
                {faqs.map(faq => (
                    <div key={faq.id} className="faq-item">
                        <h2>{faq.question}</h2>
                        <p>{faq.answer}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default FAQPage;
