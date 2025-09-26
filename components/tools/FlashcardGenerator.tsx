import React, { useState, useCallback, useEffect } from 'react';
import { generateFlashcards } from '../../services/geminiService';
import { Flashcard } from '../../types';

interface FlashcardViewProps {
  card: Flashcard;
}

const FlashcardView: React.FC<FlashcardViewProps> = ({ card }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [card]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div 
      className="w-full h-64 [perspective:1000px]"
      onClick={handleFlip}
      role="button"
      tabIndex={0}
      aria-live="polite"
      onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') handleFlip(); }}
    >
      <div 
        className={`relative w-full h-full [transform-style:preserve-3d] transition-transform duration-500 ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
      >
        {/* Front of card */}
        <div className="absolute w-full h-full [backface-visibility:hidden] bg-blue-600 rounded-lg flex items-center justify-center p-4 text-center text-white">
          <div>
            <p className="text-sm text-blue-200 mb-2">Question</p>
            <p className="text-xl font-semibold">{card.question}</p>
          </div>
        </div>
        {/* Back of card */}
        <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-orange-500 rounded-lg flex items-center justify-center p-4 text-center text-white">
          <div>
            <p className="text-sm text-orange-200 mb-2">Answer</p>
            <p className="text-lg">{card.answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const FlashcardGenerator: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedSets, setSavedSets] = useState<Record<string, Flashcard[]>>({});
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;
    setIsLoading(true);
    setError('');
    setFlashcards([]);
    const generatedCards = await generateFlashcards(subject);
    if (generatedCards.length > 0) {
      setFlashcards(generatedCards);
      setSavedSets(prev => ({ ...prev, [subject]: generatedCards }));
      setCurrentCardIndex(0);
    } else {
      setError('Could not generate flashcards for this subject. Please try another one.');
    }
    setIsLoading(false);
    setSubject('');
  };

  const loadSet = (subj: string) => {
    setFlashcards(savedSets[subj]);
    setCurrentCardIndex(0);
  };

  const nextCard = useCallback(() => {
    if (flashcards.length === 0) return;
    setCurrentCardIndex(prev => (prev + 1) % flashcards.length);
  }, [flashcards.length]);
  
  const prevCard = useCallback(() => {
    if (flashcards.length === 0) return;
    setCurrentCardIndex(prev => (prev - 1 + flashcards.length) % flashcards.length);
  }, [flashcards.length]);

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <form onSubmit={handleGenerate}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., Photosynthesis, World War II"
            className="w-full p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:bg-blue-400"
        >
          {isLoading ? 'Generating...' : 'Generate Flashcards'}
        </button>
      </form>
      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      
      {flashcards.length > 0 && (
        <div className="mt-6">
          <h4 className="font-bold text-lg mb-4 text-blue-700 dark:text-blue-400 text-center">Flashcards ({currentCardIndex + 1}/{flashcards.length})</h4>
          <FlashcardView card={flashcards[currentCardIndex]} />
          <div className="flex justify-between mt-4">
            <button onClick={prevCard} className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md">Previous</button>
            <button onClick={nextCard} className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md">Next</button>
          </div>
        </div>
      )}

      {Object.keys(savedSets).length > 0 && (
        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-bold text-lg mb-2 text-blue-700 dark:text-blue-400">Previous Sessions:</h4>
          <div className="flex flex-wrap gap-2">
            {Object.keys(savedSets).map(subj => (
              <button key={subj} onClick={() => loadSet(subj)} className="bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 px-3 py-1 rounded-full text-sm">
                {subj}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardGenerator;