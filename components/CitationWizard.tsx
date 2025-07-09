


import React, { useState, useEffect, useCallback } from 'react';
import { generateCitation } from '../services/geminiService';
import { User, AppView, SubscriptionTier } from '../types';
import { CITATION_STYLES, SOURCE_TYPE_CATEGORIES, SOURCE_FIELDS } from '../data/citationData';
import Button from './common/Button';
import Spinner from './common/Spinner';
import Card from './common/Card';
import Icon from './common/Icon';
import useLocalStorage from '../hooks/useLocalStorage';

interface CitationWizardProps {
  currentUser: User;
  navigateTo: (view: AppView) => void;
}

interface SavedCitation {
  id: number;
  citation: string;
  style: string;
  sourceType: string;
}

const CITATION_LIMIT = 10;

const CitationWizard: React.FC<CitationWizardProps> = ({ currentUser, navigateTo }) => {
  const [style, setStyle] = useState(CITATION_STYLES[0]);
  const [sourceType, setSourceType] = useState('Whole book');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [generatedCitation, setGeneratedCitation] = useState('');
  const [savedCitations, setSavedCitations] = useLocalStorage<SavedCitation[]>('savedCitations', []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isFreeTier = currentUser.subscriptionTier === SubscriptionTier.FREE;
  const isCitationLimitReached = isFreeTier && savedCitations.length >= CITATION_LIMIT;

  useEffect(() => {
    setFormData({});
    setGeneratedCitation('');
    setError('');
  }, [sourceType, style]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleGenerate = useCallback(async () => {
    if (Object.values(formData).every(v => !v)) {
        setError('Please fill in at least one field to generate a citation.');
        return;
    }
    setIsLoading(true);
    setError('');
    setGeneratedCitation('');
    setSuccessMessage('');
    try {
      const result = await generateCitation(style, sourceType, formData);
      setGeneratedCitation(result);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [style, sourceType, formData]);

  const handleCopyToClipboard = useCallback((textToCopy: string) => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
        setSuccessMessage('Copied to clipboard!');
        setTimeout(() => setSuccessMessage(''), 2000);
    }, () => {
        setError('Failed to copy text.');
    });
  }, []);

  const handleSaveCitation = useCallback(() => {
    if (!generatedCitation) return;
    if (isCitationLimitReached) {
        setError(`You have reached your limit of ${CITATION_LIMIT} saved citations.`);
        return;
    }
    const newSavedCitation: SavedCitation = {
      id: Date.now(),
      citation: generatedCitation,
      style,
      sourceType,
    };
    setSavedCitations(prev => [newSavedCitation, ...prev]);
    setGeneratedCitation('');
    setSuccessMessage('Citation saved!');
    setTimeout(() => setSuccessMessage(''), 2000);
  }, [generatedCitation, style, sourceType, setSavedCitations, isCitationLimitReached]);

  const handleDeleteCitation = useCallback((id: number) => {
    setSavedCitations(prev => prev.filter(c => c.id !== id));
  }, [setSavedCitations]);

  const currentFields = SOURCE_FIELDS[sourceType] || [];

  return (
    <div className="p-8 h-full flex flex-col">
      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 mb-2">Citation Wizard</h1>
      <p className="text-lg text-gray-600 mb-6">Generate and save academic citations for any source with ease.</p>
      
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card className="p-6 flex flex-col gap-6 overflow-y-auto">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-3">1. Select Style & Source</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="citation-style" className="block text-sm font-medium text-gray-700 mb-1">Citation Style</label>
                <select
                  id="citation-style"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                >
                  {CITATION_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="source-type" className="block text-sm font-medium text-gray-700 mb-1">Source Type</label>
                <select
                  id="source-type"
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                >
                  {Object.entries(SOURCE_TYPE_CATEGORIES).map(([category, types]) => (
                    <optgroup key={category} label={category}>
                      {types.map(t => <option key={t} value={t}>{t}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-3">2. Enter Source Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentFields.map(field => (
                <div key={field.name} className="flex flex-col">
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  <input
                    type={field.type || 'text'}
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Output Area */}
        <div className="flex flex-col gap-6">
            <div className="text-center lg:text-left">
              <Button onClick={handleGenerate} disabled={isLoading} className="w-full lg:w-auto">
                {isLoading ? 'Generating...' : 'Generate Citation'}
              </Button>
            </div>
          
            {error && <p className="text-red-500 text-center">{error}</p>}
            {successMessage && !generatedCitation && <p className="text-green-600 font-semibold text-center">{successMessage}</p>}

            {isLoading && <Spinner />}

            {generatedCitation && (
              <Card className="p-6 flex-grow flex flex-col">
                <h2 className="text-xl font-bold text-gray-800 mb-3">3. Your Generated Citation</h2>
                <div className="bg-gray-50 p-4 rounded-md text-gray-800 flex-grow relative font-serif text-lg leading-relaxed">
                  <p dangerouslySetInnerHTML={{ __html: generatedCitation }} />
                </div>
                <div className="mt-4 flex justify-end items-center gap-4">
                    {successMessage && <span className="text-green-600 font-semibold">{successMessage}</span>}
                    <Button onClick={() => handleCopyToClipboard(generatedCitation)} variant="secondary" className="flex items-center gap-2">
                        <Icon><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></Icon>
                        Copy
                    </Button>
                     <Button onClick={handleSaveCitation} variant="primary" className="flex items-center gap-2" disabled={isCitationLimitReached}>
                        <Icon><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg></Icon>
                        Save
                    </Button>
                </div>
              </Card>
            )}
        </div>
      </div>
      
      {/* Saved Citations List */}
      <div className="mt-10">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Saved Citations</h2>
             {isFreeTier && (
                <div className={`text-sm text-center p-2 rounded-lg ${isCitationLimitReached ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {savedCitations.length} / {CITATION_LIMIT} saved
                </div>
            )}
        </div>
        
        <Card className="p-6">
          {isCitationLimitReached && (
            <div className="text-center text-red-700 bg-red-100 p-3 rounded-md mb-4">
                You've reached your limit for saved citations. <button onClick={() => navigateTo(AppView.UPGRADE_PAGE)} className="font-bold underline">Upgrade to Premium</button> to save more.
            </div>
          )}
          {savedCitations.length > 0 ? (
            <ul className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {savedCitations.map(c => (
                <li key={c.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="font-serif text-gray-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: c.citation }} />
                    <div className="mt-3 flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                            <span className="font-semibold bg-purple-100 text-purple-800 py-1 px-2 rounded-full">{c.style}</span>
                            <span className="font-semibold bg-green-100 text-green-800 py-1 px-2 rounded-full ml-2">{c.sourceType}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={() => handleCopyToClipboard(c.citation)} className="text-gray-500 hover:text-pink-600 transition-colors" title="Copy citation">
                                <Icon><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></Icon>
                            </button>
                            <button onClick={() => handleDeleteCitation(c.id)} className="text-gray-500 hover:text-red-600 transition-colors" title="Delete citation">
                                <Icon><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></Icon>
                            </button>
                        </div>
                    </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-4">You haven't saved any citations yet. Saved citations will appear here.</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CitationWizard;