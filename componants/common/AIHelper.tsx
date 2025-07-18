import React, { useState, useCallback } from 'react';
import { getStudyTip } from '../../services/geminiService';
import Modal from './Modal';
import Button from './Button';
import Icon from './Icon';
import Spinner from './Spinner';

const suggestedPrompts = [
    "How can I avoid procrastination?",
    "What's the best way to use the Flashcard tool?",
    "Give me a tip for staying focused during lectures.",
    "How do I prepare for a big exam?",
];

const AIHelper: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [tip, setTip] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFetchTip = useCallback(async (currentPrompt: string) => {
        if (!currentPrompt.trim()) {
            setError('Please enter a question or select a suggestion.');
            return;
        }
        setIsLoading(true);
        setError('');
        setTip('');
        try {
            const result = await getStudyTip(currentPrompt);
            setTip(result);
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handlePromptClick = (p: string) => {
        setPrompt(p);
        handleFetchTip(p);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleFetchTip(prompt);
    };
    
    const handleClose = () => {
        setIsOpen(false);
        setPrompt('');
        setTip('');
        setError('');
        setIsLoading(false);
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 z-40 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:animate-background-pan focus:outline-none focus:ring-4 focus:ring-pink-300 transition-transform hover:scale-110"
                aria-label="Open AI Study Coach"
            >
                <Icon>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                </Icon>
            </button>
            <Modal isOpen={isOpen} onClose={handleClose} title="AI Study Coach">
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-48"><Spinner /></div>
                    ) : tip ? (
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2">Here's a tip for: <span className="text-pink-600">{prompt}</span></h3>
                            <div className="bg-gray-100 p-4 rounded-lg text-gray-700 space-y-3 whitespace-pre-wrap font-sans">
                                {tip.split('\n').map((paragraph, index) => (
                                    <p key={index}>{paragraph}</p>
                                ))}
                            </div>
                            <Button variant="secondary" onClick={() => setTip('')} className="mt-4 w-full">Ask Another Question</Button>
                        </div>
                    ) : (
                        <>
                            <div>
                                <p className="text-gray-600 mb-3">Need some advice? Ask me anything or choose a suggestion below.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {suggestedPrompts.map(p => (
                                        <button key={p} onClick={() => handlePromptClick(p)} className="text-sm text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-md text-purple-800 transition-colors">
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <form onSubmit={handleFormSubmit} className="pt-4 border-t">
                                <label htmlFor="ai-coach-prompt" className="block text-sm font-medium text-gray-700">Your Question</label>
                                <textarea
                                    id="ai-coach-prompt"
                                    rows={3}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                    placeholder="e.g., How can I improve my memory?"
                                />
                                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                                <Button type="submit" disabled={isLoading} className="mt-2 w-full">Get Tip</Button>
                            </form>
                        </>
                    )}
                </div>
            </Modal>
        </>
    );
}

export default AIHelper;