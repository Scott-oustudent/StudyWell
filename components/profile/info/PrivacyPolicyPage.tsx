import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
    return (
        <div>
            <h4>Data Storage</h4>
            <p>StudyWell is designed with a "privacy-first" approach. The majority of your data, including your notes, schedule events, and wellness entries, is stored locally in your browser's localStorage. This means we do not have access to this personal information.</p>
            
            <h4>Community Features</h4>
            <p>Data related to community features, such as chat messages and friend lists, is simulated using localStorage for this demonstration. In a real-world application, this data would be stored on a secure server to enable real-time communication between users.</p>

            <h4>Data Collected</h4>
            <p>We collect basic account information such as your email and username for authentication purposes. We do not sell or share your personal data with third parties. This is a placeholder document.</p>
        </div>
    );
};

export default PrivacyPolicyPage;
