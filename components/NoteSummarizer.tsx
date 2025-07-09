
import React, { useState, useCallback } from 'react';
import { summarizeText } from '../services/geminiService';
import { User, AppView, SubscriptionTier } from '../types';
import { useUsageTracker } from '../hooks/useUsageTracker';
import Button from './common/Button';
import Spinner from './common/Spinner';
import Card from './common/Card';
import ExportMenu from './common/ExportMenu';

interface NoteSummarizerProps {
  currentUser: User;
  navigateTo: (view: AppView) => void;
}

const DAILY_LIMIT = 5;

const NoteSummarizer: React.FC<NoteSummarizerProps> = ({ currentUser, navigateTo }) => {
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { usage, isLimitReached, incrementUsage } = useUsageTracker('summarizer', DAILY_LIMIT);
  const isFreeTier = currentUser.subscriptionTier === SubscriptionTier.FREE;

  const handleSummarize = useCallback(async () => {
    if (isFreeTier && isLimitReached) {
        setError(`You have reached your daily limit of ${DAILY_LIMIT} summaries.`);
        return;
    }

    if (!notes.trim()) {
      setError('Please enter some notes to summarize.');
      return;
    }
    setIsLoading(true);
    setError('');
    setSummary('');
    try {
      const result = await summarizeText(notes);
      setSummary(result);
      if (isFreeTier) {
        incrementUsage();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [notes, isFreeTier, isLimitReached, incrementUsage]);
  
  const renderUsageInfo = () => {
    if (!isFreeTier) return null;
    return (
        <div className={`text-sm text-center p-3 rounded-lg ${isLimitReached ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'} mt-4`}>
            {isLimitReached ? (
                <span>
                    You've used all your summaries for today.
                    <button onClick={() => navigateTo(AppView.UPGRADE_PAGE)} className="font-bold underline ml-1">Upgrade to Premium</button> for unlimited access.
                </span>
            ) : (
                <span>You have used {usage} of your {DAILY_LIMIT} free summaries for today.</span>
            )}
        </div>
    );
  }

  return (
    <div className="p-8 h-full flex flex-col">
      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 mb-2">Note Summarizer</h1>
      <p className="text-lg text-gray-600 mb-6">Paste your notes below and get a concise summary.</p>
      
      <div className="flex-grow flex flex-col gap-6">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Paste your lecture notes, article, or any text here..."
          className="w-full h-64 p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-shadow duration-200 resize-none"
          disabled={isLoading || (isFreeTier && isLimitReached)}
        />
        
        <div className="flex items-center">
          <Button onClick={handleSummarize} disabled={isLoading || !notes || (isFreeTier && isLimitReached)}>
            {isLoading ? 'Summarizing...' : 'Summarize'}
          </Button>
          {isLoading && <Spinner size="sm" />}
        </div>
        
        {renderUsageInfo()}

        {error && <p className="text-red-500 mt-2">{error}</p>}

        {summary && (
          <Card className="p-6 mt-4 flex-shrink-0 flex flex-col">
             <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Summary</h2>
              <ExportMenu
                elementId="summary-content-export"
                textContent={summary}
                filename="note-summary"
                disabled={!summary}
              />
            </div>
            <div id="summary-content-export" className="flex-grow overflow-y-auto">
                <pre className="text-gray-700 whitespace-pre-wrap font-sans">{summary}</pre>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NoteSummarizer;