
import React, { useState, useCallback, useMemo } from 'react';
import * as geminiService from '../services/geminiService';
import { User, AppView, SubscriptionTier } from '../types';
import { useUsageTracker } from '../hooks/useUsageTracker';
import Button from './common/Button';
import Spinner from './common/Spinner';
import Card from './common/Card';
import ExportMenu from './common/ExportMenu';
import Icon from './common/Icon';

type EssayTool = 'thesis' | 'outline' | 'expander' | 'proofreader' | 'plagiarism';
const DAILY_LIMIT = 2;

interface EssayHelperProps {
  currentUser: User;
  navigateTo: (view: AppView) => void;
  isSandboxMode: boolean;
}

const EssayHelper: React.FC<EssayHelperProps> = ({ currentUser, navigateTo, isSandboxMode }) => {
  const [activeTool, setActiveTool] = useState<EssayTool>('thesis');
  
  const [topic, setTopic] = useState('');
  const [thesis, setThesis] = useState('');
  const [pointToExpand, setPointToExpand] = useState('');
  const [textToProofread, setTextToProofread] = useState('');
  const [textToCheck, setTextToCheck] = useState('');
  
  const [result, setResult] = useState('');
  const [plagiarismSources, setPlagiarismSources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { usage, isLimitReached, incrementUsage } = useUsageTracker(currentUser, `essay-${activeTool}`, DAILY_LIMIT, isSandboxMode);
  const isFreeTier = currentUser.subscriptionTier === SubscriptionTier.FREE;

  const resetState = useCallback(() => {
    setError('');
    setResult('');
    setPlagiarismSources([]);
  }, []);

  const handleToolChange = (tool: EssayTool) => {
    setActiveTool(tool);
    resetState();
  };

  const handleGenerate = async () => {
    if (isFreeTier && isLimitReached && !isSandboxMode) {
        setError(`You have reached your daily limit of ${DAILY_LIMIT} uses for this tool.`);
        return;
    }

    setIsLoading(true);
    resetState();

    try {
      let apiResponse: any;
      let generatedContent = false;
      switch (activeTool) {
        case 'thesis':
          if (!topic) { setError('Please enter a topic.'); break; }
          apiResponse = await geminiService.generateThesis(topic);
          setResult(apiResponse);
          if (apiResponse) generatedContent = true;
          break;
        case 'outline':
          if (!topic || !thesis) { setError('Please enter a topic and a thesis statement.'); break; }
          apiResponse = await geminiService.generateOutline(topic, thesis);
          setResult(apiResponse);
          if (apiResponse) generatedContent = true;
          break;
        case 'expander':
          if (!pointToExpand) { setError('Please enter a point to expand.'); break; }
          apiResponse = await geminiService.expandPoint(pointToExpand);
          setResult(apiResponse);
          if (apiResponse) generatedContent = true;
          break;
        case 'proofreader':
          if (!textToProofread) { setError('Please enter text to proofread.'); break; }
          apiResponse = await geminiService.proofreadText(textToProofread);
          setResult(apiResponse);
          if (apiResponse) generatedContent = true;
          break;
        case 'plagiarism':
          if (!textToCheck) { setError('Please enter text to check.'); break; }
          apiResponse = await geminiService.checkPlagiarism(textToCheck);
          setResult(apiResponse.text);
          setPlagiarismSources(apiResponse.sources);
          if (apiResponse.text) generatedContent = true;
          break;
      }
      if(generatedContent && isFreeTier && !isSandboxMode) {
        incrementUsage();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const textContentForExport = useMemo(() => {
    if (activeTool !== 'plagiarism' || plagiarismSources.length === 0) {
        return result;
    }
    const sourcesText = plagiarismSources.map(s => `- ${s.web.title || ''}: ${s.web.uri}`).join('\n');
    return `${result}\n\n--- Sources Found ---\n${sourcesText}`;
  }, [result, plagiarismSources, activeTool]);
  
  const renderUsageInfo = () => {
    if (!isFreeTier || isSandboxMode) return null;
    return (
        <div className={`text-sm text-center p-3 rounded-lg ${isLimitReached ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'} mt-4`}>
            {isLimitReached ? (
                <span>
                    You've used all your free generations for this tool today.
                    <button onClick={() => navigateTo(AppView.UPGRADE_PAGE)} className="font-bold underline ml-1">Upgrade to Premium</button> for unlimited access.
                </span>
            ) : (
                <span>You have used {usage} of your {DAILY_LIMIT} free uses for this tool today.</span>
            )}
        </div>
    );
  }

  const renderToolContent = () => {
    const disabled = isLoading || (isFreeTier && isLimitReached && !isSandboxMode);
    switch (activeTool) {
      case 'thesis':
        return (
          <div className="space-y-4">
            <label htmlFor="topic-thesis" className="block text-sm font-medium text-gray-700">Essay Topic</label>
            <input
              id="topic-thesis"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., The impact of renewable energy on the global economy"
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-pink-500"
              disabled={disabled}
            />
          </div>
        );
      case 'outline':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="topic-outline" className="block text-sm font-medium text-gray-700">Essay Topic</label>
              <input
                id="topic-outline"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., The causes and effects of the Industrial Revolution"
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-pink-500"
                disabled={disabled}
              />
            </div>
            <div>
              <label htmlFor="thesis-outline" className="block text-sm font-medium text-gray-700">Thesis Statement</label>
              <textarea
                id="thesis-outline"
                value={thesis}
                onChange={(e) => setThesis(e.target.value)}
                rows={3}
                placeholder="Paste your thesis statement here..."
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-pink-500 resize-none"
                disabled={disabled}
              />
            </div>
          </div>
        );
      case 'expander':
        return (
          <div className="space-y-4">
            <label htmlFor="point-expand" className="block text-sm font-medium text-gray-700">Point to Expand</label>
            <textarea
              id="point-expand"
              value={pointToExpand}
              onChange={(e) => setPointToExpand(e.target.value)}
              rows={4}
              placeholder="Enter a sentence or a key point you want to elaborate on..."
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-pink-500 resize-none"
              disabled={disabled}
            />
          </div>
        );
      case 'proofreader':
        return (
          <div className="space-y-4">
            <label htmlFor="text-proofread" className="block text-sm font-medium text-gray-700">Your Essay Text</label>
            <textarea
              id="text-proofread"
              value={textToProofread}
              onChange={(e) => setTextToProofread(e.target.value)}
              rows={10}
              placeholder="Paste your full essay or a paragraph here for proofreading..."
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-pink-500 resize-y"
              disabled={disabled}
            />
          </div>
        );
      case 'plagiarism':
        return (
          <div className="space-y-4">
            <label htmlFor="text-check" className="block text-sm font-medium text-gray-700">Text to Check</label>
            <textarea
              id="text-check"
              value={textToCheck}
              onChange={(e) => setTextToCheck(e.target.value)}
              rows={10}
              placeholder="Paste your essay or a paragraph here to check for potential plagiarism..."
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-pink-500 resize-y"
              disabled={disabled}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const toolConfig = {
    thesis: { title: 'Thesis Statement Generator', description: 'Create a powerful thesis statement from your topic.' },
    outline: { title: 'Essay Outline Creator', description: 'Structure your essay with a logical outline.' },
    expander: { title: 'Content Expander', description: 'Elaborate on a single point to build a strong paragraph.' },
    proofreader: { title: 'Proofreader & Editor', description: 'Check your text for errors and get style suggestions.' },
    plagiarism: { title: 'Plagiarism Checker', description: 'Check your text for potential plagiarism against web sources.' },
  };

  const currentTool = toolConfig[activeTool];

  return (
    <div className="p-8 h-full flex flex-col">
      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 mb-2">Essay Helper</h1>
      <p className="text-lg text-gray-600 mb-6">{currentTool.description}</p>
      
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {Object.keys(toolConfig).map((toolKey) => (
            <button
              key={toolKey}
              onClick={() => handleToolChange(toolKey as EssayTool)}
              className={`${
                activeTool === toolKey
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              {toolConfig[toolKey as EssayTool].title}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6 flex flex-col">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{currentTool.title}</h2>
          {renderToolContent()}
           {renderUsageInfo()}
          <div className="mt-6">
            <Button onClick={handleGenerate} disabled={isLoading || (isFreeTier && isLimitReached && !isSandboxMode)} className="w-full">
              {isLoading ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        </Card>

        <Card className="p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Result</h2>
            <ExportMenu
                elementId="essay-result-export"
                textContent={textContentForExport}
                filename="essay-helper-result"
                disabled={!result || isLoading}
            />
          </div>
          <div id="essay-result-export" className="flex-grow bg-gray-50 rounded-lg p-4 overflow-y-auto">
            {isLoading && <Spinner />}
            {error && <p className="text-red-500 text-center">{error}</p>}
            {result && (
              <>
                {activeTool === 'proofreader' ? (
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: result }} />
                ) : (
                    <pre className="text-gray-700 whitespace-pre-wrap font-sans">{result}</pre>
                )}
                {activeTool === 'plagiarism' && plagiarismSources.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 border-t pt-4">Sources Found</h3>
                    <ul className="space-y-2">
                      {plagiarismSources.map((source, index) => (
                        <li key={index} className="bg-white p-3 rounded-md border">
                          <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline">
                            <Icon>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                            </Icon>
                            <span className="truncate">{source.web.title || source.web.uri}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
            {!isLoading && !result && !error && <p className="text-gray-500 text-center">Your results will appear here.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EssayHelper;
