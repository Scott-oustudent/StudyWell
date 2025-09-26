import React, { useState } from 'react';
import PlagiarismChecker from './PlagiarismChecker';
import ReferencingWizard from './ReferencingWizard';
import EssayGenerator from './EssayGenerator';
import FlashcardGenerator from './FlashcardGenerator';
import Scheduler from './Scheduler';
import PomodoroTimer from './PomodoroTimer';
import ConceptExplainer from './ConceptExplainer';
import NoteTaker from './NoteTaker';
import DocumentQA from './DocumentQA';
import { ChevronLeftIcon, StarIcon } from '../icons/Icons';
import { useSubscription } from '../../context/SubscriptionContext';
import SubscriptionPage from '../profile/SubscriptionPage';


type Tool = 'scheduler' | 'pomodoro' | 'noteTaker' | 'plagiarism' | 'referencing' | 'essay' | 'flashcards' | 'conceptExplainer' | 'docQA';

const ToolCard: React.FC<{ title: string; description: string; isPremium: boolean; isPaidUser: boolean; onClick: () => void }> = ({ title, description, isPremium, isPaidUser, onClick }) => (
  <button onClick={onClick} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 text-left w-full border border-gray-200 dark:border-gray-700 relative">
    {isPremium && (
        <div className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${isPaidUser ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            <StarIcon className="w-3 h-3"/>
            Premium
        </div>
    )}
    <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400">{title}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
  </button>
);

const ToolsHome: React.FC = () => {
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { isPaid } = useSubscription();

  const tools: { id: Tool; title: string; description: string; component: React.FC; isPremium: boolean; }[] = [
    { id: 'scheduler', title: 'Student Scheduler', description: 'Organize deadlines, exams, and lectures.', component: Scheduler, isPremium: false },
    { id: 'pomodoro', title: 'Pomodoro Timer', description: 'Boost focus with customizable work sessions.', component: PomodoroTimer, isPremium: false },
    { id: 'noteTaker', title: 'Note Taker', description: 'Create, edit, and organize your notes.', component: NoteTaker, isPremium: false },
    { id: 'plagiarism', title: 'Plagiarism Checker', description: 'Check your work for academic integrity.', component: PlagiarismChecker, isPremium: false },
    { id: 'docQA', title: 'Document Q&A', description: 'Upload a document and ask questions about it.', component: DocumentQA, isPremium: true },
    { id: 'conceptExplainer', title: 'AI Concept Explainer', description: 'Break down complex topics into simple terms.', component: ConceptExplainer, isPremium: true },
    { id: 'flashcards', title: 'AI Flashcard Generator', description: 'Create study flashcards from any subject.', component: FlashcardGenerator, isPremium: true },
    { id: 'referencing', title: 'Referencing & Citation Wizard', description: 'Generate citations in various styles.', component: ReferencingWizard, isPremium: true },
    { id: 'essay', title: 'AI Assisted Report & Essay Generator', description: 'Get help with structure and formatting.', component: EssayGenerator, isPremium: true },
  ];
  
  const handleToolClick = (tool: (typeof tools)[0]) => {
      if (tool.isPremium && !isPaid) {
          setShowUpgradeModal(true);
      } else {
          setActiveTool(tool.id);
      }
  };

  const renderContent = () => {
    if (showUpgradeModal) {
      return (
        <div>
           <button onClick={() => setShowUpgradeModal(false)} className="flex items-center gap-2 mb-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors">
            <ChevronLeftIcon className="w-5 h-5" />
            Back to Tools
          </button>
          <SubscriptionPage isModal={true}/>
        </div>
      );
    }

    if (activeTool) {
      const tool = tools.find(t => t.id === activeTool);
      const Component = tool?.component;
      if (!Component) return null;
      
      return (
        <div>
          <button onClick={() => setActiveTool(null)} className="flex items-center gap-2 mb-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors">
            <ChevronLeftIcon className="w-5 h-5" />
            Back to Tools
          </button>
          <h2 className="text-2xl font-bold mb-4 text-center">{tool.title}</h2>
          <Component />
        </div>
      );
    }

    return (
      <div>
        <h2 className="text-2xl font-bold mb-6 text-center">Student Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tools.map(tool => (
            <ToolCard 
              key={tool.id} 
              title={tool.title} 
              description={tool.description} 
              isPremium={tool.isPremium}
              isPaidUser={isPaid}
              onClick={() => handleToolClick(tool)} 
            />
          ))}
        </div>
      </div>
    );
  };

  return <div className="animate-fade-in">{renderContent()}</div>;
};

export default ToolsHome;