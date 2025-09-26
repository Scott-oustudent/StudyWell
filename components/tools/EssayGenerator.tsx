import React, { useState } from 'react';
import { generateEssayStructure } from '../../services/geminiService';
import { DownloadIcon } from '../icons/Icons';

const EssayGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [type, setType] = useState<'Essay' | 'Report'>('Essay');
  const [wordCount, setWordCount] = useState(1500);
  const [structure, setStructure] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setIsLoading(true);
    setStructure('');
    const response = await generateEssayStructure(topic, type, wordCount);
    setStructure(response);
    setIsLoading(false);
  };

  const handleDownload = () => {
    if (!structure) return;
    const blob = new Blob([structure], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const sanitizedTopic = topic.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${type.toLowerCase()}_structure_${sanitizedTopic || 'untitled'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <form onSubmit={handleGenerate}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., The Impact of Renewable Energy"
            className="w-full p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Document Type</label>
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'Essay' | 'Report')}
                    className="w-full p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:outline-none"
                >
                    <option>Essay</option>
                    <option>Report</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Target Word Count</label>
                <input
                    type="number"
                    value={wordCount}
                    onChange={(e) => setWordCount(Number(e.target.value))}
                    placeholder="e.g., 1500"
                    className="w-full p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:outline-none"
                    min="100"
                    step="50"
                    required
                />
            </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:bg-blue-400"
        >
          {isLoading ? 'Generating...' : 'Generate Structure'}
        </button>
      </form>

      {structure && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-lg text-blue-700 dark:text-blue-400">Suggested Structure:</h4>
          </div>
          <pre className="whitespace-pre-wrap font-sans text-gray-600 dark:text-gray-300">{structure}</pre>
          <button
            onClick={handleDownload}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
            title="Download structure as a .txt file"
          >
            <DownloadIcon className="w-5 h-5" />
            <span>Download Structure</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default EssayGenerator;