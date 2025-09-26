import React, { useState, useEffect } from 'react';
import { generateCitation } from '../../services/geminiService';
import { ReferencingStyles, ReferencingStyle, Citation } from '../../types';

type Field = { name: string; label: string; placeholder: string };
type PublicationTypes = Record<string, Field[]>;

const publicationTypes: PublicationTypes = {
    'Book': [
        { name: 'author', label: 'Author(s)', placeholder: 'e.g., Jane Smith' },
        { name: 'title', label: 'Title', placeholder: 'e.g., A History of Science' },
        { name: 'year', label: 'Year of Publication', placeholder: 'e.g., 2021' },
        { name: 'publisher', label: 'Publisher', placeholder: 'e.g., Academic Press' },
        { name: 'place', label: 'Place of Publication', placeholder: 'e.g., New York, NY' }
    ],
    'Conference Paper': [
        { name: 'author', label: 'Author(s)', placeholder: 'e.g., David Chen' },
        { name: 'paperTitle', label: 'Paper Title', placeholder: 'e.g., Advances in Machine Learning' },
        { name: 'conferenceName', label: 'Conference Name', placeholder: 'e.g., International Conference on AI' },
        { name: 'location', label: 'Location', placeholder: 'e.g., San Francisco, CA' },
        { name: 'date', label: 'Date(s)', placeholder: 'e.g., June 5-7, 2023' },
    ],
    'Film / Video': [
        { name: 'title', label: 'Title', placeholder: 'e.g., The Social Network' },
        { name: 'director', label: 'Director(s)', placeholder: 'e.g., David Fincher' },
        { name: 'productionCompany', label: 'Production Company', placeholder: 'e.g., Columbia Pictures' },
        { name: 'year', label: 'Year of Release', placeholder: 'e.g., 2010' },
    ],
    'Gen AI': [
        { name: 'author', label: 'Author/Company', placeholder: 'e.g., Google' },
        { name: 'title', label: 'Title of Model', placeholder: 'e.g., Gemini' },
        { name: 'version', label: 'Version', placeholder: 'e.g., 2.5 Flash' },
        { name: 'date', label: 'Date', placeholder: 'e.g., 2024' },
        { name: 'publisher', label: 'Publisher', placeholder: 'e.g., Google' },
        { name: 'url', label: 'URL', placeholder: 'https://gemini.google.com' }
    ],
    'Journal Article': [
        { name: 'author', label: 'Author(s)', placeholder: 'e.g., Alex Johnson' },
        { name: 'articleTitle', label: 'Title of Article', placeholder: 'e.g., Quantum Entanglement Explained' },
        { name: 'journalName', label: 'Name of Journal', placeholder: 'e.g., Journal of Physics' },
        { name: 'volume', label: 'Volume', placeholder: 'e.g., 42' },
        { name: 'issue', label: 'Issue', placeholder: 'e.g., 3' },
        { name: 'pages', label: 'Page Numbers', placeholder: 'e.g., 112-120' },
        { name: 'year', label: 'Year of Publication', placeholder: 'e.g., 2022' },
        { name: 'doi', label: 'DOI', placeholder: '10.1000/xyz123' }
    ],
    'Magazine Article': [
        { name: 'author', label: 'Author(s)', placeholder: 'e.g., John Appleseed' },
        { name: 'articleTitle', label: 'Article Title', placeholder: 'e.g., The Future of Space Travel' },
        { name: 'magazineName', label: 'Magazine Name', placeholder: 'e.g., Science Weekly' },
        { name: 'publicationDate', label: 'Publication Date', placeholder: 'e.g., October 2023' },
        { name: 'volume', label: 'Volume', placeholder: 'e.g., 12' },
        { name: 'issue', label: 'Issue', placeholder: 'e.g., 4' },
        { name: 'pages', label: 'Page(s)', placeholder: 'e.g., 22-28' },
    ],
    'Newspaper Article': [
        { name: 'author', label: 'Author(s)', placeholder: 'e.g., Jane Doe' },
        { name: 'articleTitle', label: 'Article Title', placeholder: 'e.g., City Council Approves New Park' },
        { name: 'newspaperName', label: 'Newspaper Name', placeholder: 'e.g., The Daily Chronicle' },
        { name: 'publicationDate', label: 'Publication Date', placeholder: 'e.g., 2023-11-15' },
        { name: 'pages', label: 'Page(s)', placeholder: 'e.g., A1, A4-A5' }
    ],
    'Podcast Episode': [
        { name: 'host', label: 'Host(s) or Creator(s)', placeholder: 'e.g., Michael Barbaro' },
        { name: 'episodeTitle', label: 'Episode Title', placeholder: 'e.g., The Sunday Read' },
        { name: 'podcastTitle', label: 'Podcast Title', placeholder: 'e.g., The Daily' },
        { name: 'publisher', label: 'Publisher/Platform', placeholder: 'e.g., The New York Times' },
        { name: 'date', label: 'Date Published', placeholder: 'e.g., 2023-10-22' },
        { name: 'url', label: 'URL', placeholder: 'https://...' },
    ],
    'Report': [
        { name: 'author', label: 'Author(s) or Organization', placeholder: 'e.g., World Health Organization' },
        { name: 'title', label: 'Report Title', placeholder: 'e.g., Global Health Report 2023' },
        { name: 'reportNumber', label: 'Report Number (if any)', placeholder: 'e.g., WHO/GHR/2023.1' },
        { name: 'publisher', label: 'Publisher or Institution', placeholder: 'e.g., World Health Organization' },
        { name: 'year', label: 'Year of Publication', placeholder: 'e.g., 2023' },
    ],
    'Thesis / Dissertation': [
        { name: 'author', label: 'Author', placeholder: 'e.g., Emily Carter' },
        { name: 'title', label: 'Title', placeholder: 'e.g., The Role of Mitochondria in Aging' },
        { name: 'degree', label: 'Degree', placeholder: 'e.g., PhD dissertation' },
        { name: 'institution', label: 'Institution', placeholder: 'e.g., University of Science' },
        { name: 'year', label: 'Year', placeholder: 'e.g., 2022' },
    ],
    'Website': [
        { name: 'author', label: 'Author(s)', placeholder: 'e.g., John Doe' },
        { name: 'title', label: 'Title of Page', placeholder: 'e.g., How AI is Changing Education' },
        { name: 'websiteName', label: 'Name of Website', placeholder: 'e.g., Tech Today' },
        { name: 'url', label: 'URL', placeholder: 'https://...' },
        { name: 'accessDate', label: 'Date Accessed', placeholder: 'e.g., 2023-10-27' }
    ],
};

const ReferencingWizard: React.FC = () => {
  const [style, setStyle] = useState<ReferencingStyle>('APA');
  const [sourceType, setSourceType] = useState<keyof typeof publicationTypes>('Website');
  const [sourceDetails, setSourceDetails] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [citations, setCitations] = useState<Citation[]>([]);

  // Reset details when source type changes
  useEffect(() => {
    setSourceDetails({});
  }, [sourceType]);

  const handleDetailChange = (fieldName: string, value: string) => {
    setSourceDetails(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const detailsString = Object.entries(sourceDetails)
      // FIX: Added a type guard to ensure the value is a string before trimming, resolving an issue where TypeScript inferred the type as 'unknown'.
      .filter(([, value]) => typeof value === 'string' && value.trim() !== '')
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    if (!detailsString) return;

    setIsLoading(true);
    const result = await generateCitation(style, sourceType, detailsString);
    if (!result.toLowerCase().includes('error')) {
      const newCitation: Citation = {
        id: Date.now().toString(),
        sourceDetails: `${sourceType}: ${sourceDetails.title || sourceDetails.articleTitle || sourceDetails.paperTitle || sourceDetails.episodeTitle || '...'}`,
        formattedCitation: result,
        style: style,
      };
      setCitations(prev => [newCitation, ...prev]);
      setSourceDetails({}); // Clear inputs on success
    } else {
      alert(result);
    }
    setIsLoading(false);
  };

  const currentFields = publicationTypes[sourceType];

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Referencing Style</label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value as ReferencingStyle)}
            className="w-full p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:outline-none"
          >
            {ReferencingStyles.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Source Type</label>
          <select
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value as keyof typeof publicationTypes)}
            className="w-full p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:outline-none"
          >
            {Object.keys(publicationTypes).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        {currentFields.map(field => (
            <div key={field.name}>
                 <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{field.label}</label>
                 <input
                    type="text"
                    value={sourceDetails[field.name] || ''}
                    onChange={(e) => handleDetailChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:outline-none"
                 />
            </div>
        ))}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:bg-blue-400"
        >
          {isLoading ? 'Generating...' : 'Generate Citation'}
        </button>
      </form>
      
      {citations.length > 0 && (
        <div className="mt-6">
          <h4 className="font-bold text-lg mb-2 text-blue-700 dark:text-blue-400">Saved Citations:</h4>
          <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
            {citations.map(c => (
              <div key={c.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-md">
                <p 
                    className="text-sm font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded cursor-pointer"
                    onClick={() => navigator.clipboard.writeText(c.formattedCitation)}
                    title="Click to copy"
                >
                    {c.formattedCitation}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Style: {c.style} | Source: {c.sourceDetails}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferencingWizard;