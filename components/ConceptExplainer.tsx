
import React, { useState, useCallback } from 'react';
import { explainConcept } from '../services/geminiService';
import { User, AppView, SubscriptionTier } from '../types';
import { useUsageTracker } from '../hooks/useUsageTracker';
import Button from './common/Button';
import Spinner from './common/Spinner';
import Card from './common/Card';
import ExportMenu from './common/ExportMenu';

interface ConceptExplainerProps {
  currentUser: User;
  navigateTo: (view: AppView) => void;
}

const DAILY_LIMIT = 5;

const ConceptExplainer: React.FC<ConceptExplainerProps> = ({ currentUser, navigateTo }) => {
  const [concept, setConcept] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { usage, isLimitReached, incrementUsage } = useUsageTracker('explainer', DAILY_LIMIT);
  const isFreeTier = currentUser.subscriptionTier === SubscriptionTier.FREE;

  const handleExplain = useCallback(async () => {
    if (isFreeTier && isLimitReached) {
        setError(`You have reached your daily limit of ${DAILY_LIMIT} explanations.`);
        return;
    }

    if (!concept.trim()) {
      setError('Please enter a concept to explain.');
      return;
    }
    setIsLoading(true);
    setError('');
    setExplanation('');
    try {
      const result = await explainConcept(concept);
      setExplanation(result);
       if (isFreeTier) {
            incrementUsage();
        }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [concept, isFreeTier, isLimitReached, incrementUsage]);

  const renderUsageInfo = () => {
    if (!isFreeTier) return null;
    return (
        <div className={`text-sm text-center p-3 rounded-lg ${isLimitReached ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'} mt-4`}>
            {isLimitReached ? (
                <span>
                    You've used all your free explanations for today.
                    <button onClick={() => navigateTo(AppView.UPGRADE_PAGE)} className="font-bold underline ml-1">Upgrade to Premium</button> for unlimited access.
                </span>
            ) : (
                <span>You have used {usage} of your {DAILY_LIMIT} free explanations for today.</span>
            )}
        </div>
    );
  }

  return (
    <div className="p-8 h-full flex flex-col">
      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 mb-2">Concept Explainer</h1>
      <p className="text-lg text-gray-600 mb-6">Stuck on a tricky concept? Get a simple explanation here.</p>
      
      <div className="flex items-start gap-4 mb-6">
        <input
          type="text"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          placeholder="e.g., Quantum Entanglement, Supply and Demand"
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          disabled={isLoading || (isFreeTier && isLimitReached)}
        />
        <Button onClick={handleExplain} disabled={isLoading || !concept || (isFreeTier && isLimitReached)}>
          {isLoading ? 'Explaining...' : 'Explain'}
        </Button>
      </div>
      
      {renderUsageInfo()}

      {isLoading && <Spinner />}
      {error && <p className="text-red-500 mt-2">{error}</p>}
      
      {explanation && (
        <Card className="p-6 mt-4 flex-grow overflow-y-auto flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Explanation of <span className="text-pink-600">{concept}</span></h2>
             <ExportMenu
                elementId="explanation-content-export"
                textContent={explanation}
                filename={`explanation-${concept.replace(/\s+/g, '_')}`}
                disabled={!explanation}
              />
          </div>
          <div id="explanation-content-export" className="text-gray-700 whitespace-pre-wrap font-sans space-y-4">
            {explanation.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ConceptExplainer;