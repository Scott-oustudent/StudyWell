import React from 'react';

const FAQPage: React.FC = () => {
    return (
        <div>
            <h4>What is StudyWell?</h4>
            <p>StudyWell is an all-in-one application designed to help students manage their academic life, maintain their well-being, and connect with a community of peers. It combines productivity tools, wellness features, and social networking in one platform.</p>

            <h4>Is StudyWell free to use?</h4>
            <p>Yes, StudyWell offers a robust free tier with access to many core features like the scheduler, pomodoro timer, and a limited number of notes. For unlimited access to all features, including our advanced AI tools, you can upgrade to StudyWell Premium.</p>
            
            <h4>How does the AI Plagiarism Checker work?</h4>
            <p>Our Plagiarism Checker uses a powerful AI model to analyze your text and compare it against a vast database of online sources. It provides a similarity score and highlights passages that may be too similar to existing work, helping you maintain academic integrity.</p>

            <h4>Can I export my data?</h4>
            <p>Yes! You can export your notes and Pomodoro session history from the respective tool pages. We believe you should always have control over your data.</p>
            
            <h4>Is my data private?</h4>
            <p>We take your privacy very seriously. All your personal data is stored locally on your device's browser storage and is not transmitted to our servers unless required for a specific feature (like community chat). Please see our full Privacy Policy for more details.</p>
        </div>
    );
};

export default FAQPage;
