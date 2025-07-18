
import React, { useState, useCallback } from 'react';
import { generateFlashcards } from '../services/geminiService';
import { Flashcard, User, AppView, SubscriptionTier } from '../types';
import { useUsageTracker } from '../hooks/useUsageTracker';
import Button from './common/Button';
import Spinner from './common/Spinner';
import Card from './common/Card';

interface FlashcardGeneratorProps {
  currentUser: User;
  navigateTo: (view: AppView) => void;
  isSandboxMode: boolean;
}

const DAILY_LIMIT = 3;

const FlashcardDisplay: React.FC<{ flashcard: Flashcard }> = ({ flashcard }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  React.useEffect(() => {
    setIsFlipped(false);
  }, [flashcard]);

  return (
    <div className="w-full h-64 [perspective:1000px]" onClick={() => setIsFlipped(!isFlipped)}>
      <div
        className={`relative w-full h-full text-center transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
      >
        <div className="absolute w-full h-full bg-white border border-gray-200 rounded-lg shadow-lg flex items-center justify-center p-6 [backface-visibility:hidden]">
          <div>
            <p className="text-gray-500 text-sm mb-2">Question</p>
            <p className="text-2xl font-semibold text-gray-800">{flashcard.question}</p>
          </div>
        </div>
        <div className="absolute w-full h-full bg-purple-50 border border-purple-200 rounded-lg shadow-lg flex items-center justify-center p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div>
            <p className="text-purple-500 text-sm mb-2">Answer</p>
            <p className="text-xl font-medium text-purple-800">{flashcard.answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
};


export const FlashcardGenerator: React.FC<FlashcardGeneratorProps> = ({ currentUser, navigateTo, isSandboxMode }) => {
  const [topic, setTopic] = useState('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { usage, isLimitReached, incrementUsage } = useUsageTracker(currentUser, 'flashcards', DAILY_LIMIT, isSandboxMode);
  const isFreeTier = currentUser.subscriptionTier === SubscriptionTier.FREE;

  const handleGenerate = useCallback(async () => {
     if (isFreeTier && isLimitReached && !isSandboxMode) {
        setError(`You have reached your daily limit of ${DAILY_LIMIT} flashcard sets.`);
        return;
    }

    if (!topic.trim()) {
      setError('Please enter a topic.');
      return;
    }
    setIsLoading(true);
    setError('');
    setFlashcards([]);
    try {
      const result = await generateFlashcards(topic);
      if (result && result.length > 0) {
        setFlashcards(result);
        setCurrentCardIndex(0);
        if (isFreeTier && !isSandboxMode) {
            incrementUsage();
        }
      } else {
        setError('Could not generate flashcards for this topic. The response might be empty or invalid. Please try another topic.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [topic, isFreeTier, isLimitReached, incrementUsage, isSandboxMode]);

  const goToNextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % flashcards.length);
  };

  const goToPrevCard = () => {
    setCurrentCardIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };
  
  const renderUsageInfo = () => {
    if (!isFreeTier || isSandboxMode) return null;
    return (
        <div className={`text-sm text-center p-3 rounded-lg ${isLimitReached ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'} mt-4`}>
            {isLimitReached ? (
                <span>
                    You've used all your free flashcard generations for today.
                    <button onClick={() => navigateTo(AppView.UPGRADE_PAGE)} className="font-bold underline ml-1">Upgrade to Premium</button> for unlimited access.
                </span>
            ) : (
                <span>You have generated {usage} of your {DAILY_LIMIT} free flashcard sets for today.</span>
            )}
        </div>
    );
  }


  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 mb-2">Flashcard Generator</h1>
      <p className="text-lg text-gray-600 mb-6">Enter a topic and get a set of flashcards to study.</p>

      <div className="flex items-start gap-4 mb-6">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., Photosynthesis, The Cold War, React Hooks"
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          disabled={isLoading || (isFreeTier && isLimitReached && !isSandboxMode)}
        />
        <Button onClick={handleGenerate} disabled={isLoading || !topic || (isFreeTier && isLimitReached && !isSandboxMode)}>
          {isLoading ? 'Generating...' : 'Generate'}
        </Button>
      </div>

      {renderUsageInfo()}

      {isLoading && <Spinner />}
      {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
      
      {flashcards.length > 0 && (
         <div className="mt-8">
            <p className="text-center text-gray-600 font-semibold mb-4">Card {currentCardIndex + 1} of {flashcards.length} (Click card to flip)</p>
            <FlashcardDisplay flashcard={flashcards[currentCardIndex]} />

            <div className="flex justify-center gap-4 mt-6">
                <Button onClick={goToPrevCard} variant="secondary">Previous</Button>
                <Button onClick={goToNextCard} variant="secondary">Next</Button>
            </div>
         </div>
      )}
    </div>
  );
};
