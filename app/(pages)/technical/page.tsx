import React from 'react';

const TechnicalPage: React.FC = () => {
    return (
        <div className="technical-page">
            <h1>Technical Information</h1>
            <div className="technical-content">
                <h2>Product Specifications</h2>
                <ul>
                    <li><strong>Model:</strong> XYZ-1000</li>
                    <li><strong>Dimensions:</strong> 10in x 5in x 3in</li>
                    <li><strong>Weight:</strong> 2.5 lbs</li>
                    <li><strong>Color:</strong> Black</li>
                </ul>
                <h2>Technical Documentation</h2>
                <p>Here you can find technical documentation, user manuals, and guides related to our products.</p>
                <a href="/documentation/user-manual.pdf" target="_blank" rel="noopener noreferrer">User Manual (PDF)</a>
            </div>
        </div>
    );
}

export default TechnicalPage;
