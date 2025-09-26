import React, { useState } from 'react';
import { generateMindfulMoment } from '../../services/geminiService';
import { BrainIcon, SparklesIcon } from '../icons/Icons';

const MindfulMoment: React.FC = () => {
    const [moment, setMoment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        setIsLoading(true);
        setError('');
        setMoment('');
        try {
            const response = await generateMindfulMoment();
            if (response.toLowerCase().includes('error')) {
                setError(response);
            } else {
                setMoment(response);
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        }
        setIsLoading(false);
    };

    return (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-lg text-center flex flex-col items-center border border-gray-200 dark:border-gray-700">
            <BrainIcon className="w-16 h-16 text-orange-500 dark:text-orange-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                Feeling overwhelmed? Take a brief pause. Click the button below to get a simple, AI-powered mindfulness exercise to help you reset and refocus.
            </p>

            <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full max-w-sm bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200 disabled:bg-orange-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    'Generating...'
                ) : (
                    <>
                        <SparklesIcon className="w-5 h-5" />
                        Generate Mindful Moment
                    </>
                )}
            </button>

            {isLoading && (
                 <div className="mt-8 text-gray-600 dark:text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-2">Finding a moment of calm for you...</p>
                 </div>
            )}
            
            {error && <p className="text-red-500 mt-8">{error}</p>}
            
            {moment && (
                <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg w-full max-w-md animate-fade-in">
                    <p className="font-serif text-lg italic text-gray-800 dark:text-gray-200 leading-relaxed">{moment}</p>
                </div>
            )}
        </div>
    );
};

export default MindfulMoment;