import React, { useState } from 'react';
import { explainConcept } from '../../services/geminiService';

type Complexity = 'Simple' | 'Detailed' | 'For a 5-year-old';

const ConceptExplainer: React.FC = () => {
  const [concept, setConcept] = useState('');
  const [complexity, setComplexity] = useState<Complexity>('Simple');
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim()) return;
    setIsLoading(true);
    setExplanation('');
    const response = await explainConcept(concept, complexity);
    setExplanation(response);
    setIsLoading(false);
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <form onSubmit={handleGenerate}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Concept or Question</label>
          <textarea
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="e.g., What is quantum entanglement? or Explain the Krebs cycle"
            className="w-full h-24 p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Explanation Complexity</label>
          <select
            value={complexity}
            onChange={(e) => setComplexity(e.target.value as Complexity)}
            className="w-full p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:outline-none"
          >
            <option>Simple</option>
            <option>Detailed</option>
            <option>For a 5-year-old</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:bg-blue-400"
        >
          {isLoading ? 'Explaining...' : 'Explain Concept'}
        </button>
      </form>

      {explanation && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-md">
          <h4 className="font-bold text-lg mb-2 text-blue-700 dark:text-blue-400">Explanation:</h4>
          <pre className="whitespace-pre-wrap font-sans text-gray-600 dark:text-gray-300">{explanation}</pre>
        </div>
      )}
    </div>
  );
};

export default ConceptExplainer;