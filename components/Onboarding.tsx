import React, { useState } from 'react';
import { OnboardingStep } from '../types';
import { BookOpenIcon, HeartIcon, UsersIcon, CheckCircleIcon } from './icons/Icons';

const steps: OnboardingStep[] = [
    {
        title: "Welcome to StudyWell!",
        content: "Let's take a quick tour of the features that will help you excel in your studies and maintain your well-being.",
        targetId: 'welcome'
    },
    {
        title: "The Tools Section",
        content: "This is your academic hub. Here you'll find the Scheduler, Pomodoro Timer, Note Taker, and powerful AI assistants to help with your assignments.",
        targetId: 'tools'
    },
    {
        title: "The Wellness Section",
        content: "Your mental health is important. Track your wellness, relax with guided breathing exercises, and find focus with curated study music.",
        targetId: 'wellness'
    },
    {
        title: "The Community Section",
        content: "Connect with fellow students! Join subject-specific chat rooms, find study partners, and be part of a supportive network.",
        targetId: 'community'
    },
    {
        title: "Ready to Go!",
        content: "You're all set. Explore the app and start your journey to becoming a more organized, productive, and balanced student.",
        targetId: 'finish'
    }
];

const Onboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const step = steps[currentStep];

    const next = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const getIcon = (targetId: string) => {
        switch (targetId) {
            case 'tools': return <BookOpenIcon className="w-12 h-12 text-blue-500" />;
            case 'wellness': return <HeartIcon className="w-12 h-12 text-orange-500" />;
            case 'community': return <UsersIcon className="w-12 h-12 text-green-500" />;
            case 'finish': return <CheckCircleIcon className="w-12 h-12 text-purple-500" />;
            default:
                const rainbowGradient = 'bg-clip-text text-transparent bg-gradient-to-r from-rainbow-red to-rainbow-violet';
                return <span className={`text-4xl font-bold ${rainbowGradient}`}>🚀</span>;
        }
    }

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-sm text-center p-8 transform transition-all animate-fade-in scale-95">
                <div className="mb-6 flex justify-center">
                    {getIcon(step.targetId)}
                </div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">{step.title}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">{step.content}</p>

                <div className="flex justify-center items-center mb-6">
                    {steps.map((_, index) => (
                        <div key={index} className={`w-2 h-2 rounded-full mx-1 transition-colors ${index === currentStep ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                    ))}
                </div>

                <button 
                    onClick={next}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                    {currentStep === steps.length - 1 ? "Let's Go!" : "Next"}
                </button>
            </div>
        </div>
    );
};

export default Onboarding;