import React from 'react';

const EmergencyPage: React.FC = () => {
    const emergencyContacts = [
        {
            id: 1,
            type: "Police",
            number: "911"
        },
        {
            id: 2,
            type: "Fire Department",
            number: "911"
        },
        {
            id: 3,
            type: "Medical Emergency",
            number: "911"
        },
        {
            id: 4,
            type: "Local Hospital",
            number: "(XXX) XXX-XXXX"
        }
    ];

    return (
        <div className="emergency-page">
            <h1>Emergency Contacts</h1>
            <div className="emergency-contacts">
                {emergencyContacts.map(contact => (
                    <div key={contact.id} className="emergency-contact">
                        <h2>{contact.type}</h2>
                        <p><strong>Number:</strong> {contact.number}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default EmergencyPage;
