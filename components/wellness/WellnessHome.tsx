import React, { useState } from 'react';
import StudyMusic from './StudyMusic';
import StudentTips from './StudentTips';
import Meditation from './Meditation';
import WellnessTracker from './WellnessTracker';
import BreathingExercise from './BreathingExercise';
import MindfulMoment from './MindfulMoment';
import { ChevronLeftIcon, StarIcon } from '../icons/Icons';
import { useSubscription } from '../../context/SubscriptionContext';
import SubscriptionPage from '../profile/SubscriptionPage';


type WellnessPage = 'music' | 'tips' | 'meditation' | 'tracking' | 'breathing' | 'mindfulness';

const WellnessCard: React.FC<{ title: string; description: string; isPremium: boolean; isPaidUser: boolean; onClick: () => void }> = ({ title, description, isPremium, isPaidUser, onClick }) => (
    <button onClick={onClick} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 text-left w-full border border-gray-200 dark:border-gray-700 relative">
     {isPremium && (
        <div className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${isPaidUser ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            <StarIcon className="w-3 h-3"/>
            Premium
        </div>
    )}
      <h3 className="text-lg font-bold text-orange-500 dark:text-orange-400">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
    </button>
);

const WellnessHome: React.FC = () => {
    const [activePage, setActivePage] = useState<WellnessPage | null>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const { isPaid } = useSubscription();

    const pages = [
        { id: 'tracking', title: 'Wellness Tracking', description: 'Log your mood, sleep, and stress levels daily.', component: WellnessTracker, isPremium: false },
        { id: 'breathing', title: 'Guided Breathing', description: 'Follow a visual guide to calm your mind.', component: BreathingExercise, isPremium: false },
        { id: 'music', title: 'Study Music', description: 'Focus-enhancing playlists to help you concentrate.', component: StudyMusic, isPremium: false },
        { id: 'tips', title: 'Student Tips', description: 'Helpful videos on time management, learning, and more.', component: StudentTips, isPremium: false },
        { id: 'meditation', title: 'Meditation', description: 'Guided audio to relax and de-stress.', component: Meditation, isPremium: false },
        { id: 'mindfulness', title: 'AI Mindful Moment', description: 'Get a quick, AI-generated mindfulness exercise.', component: MindfulMoment, isPremium: true },
    ];
    
    const handlePageClick = (page: (typeof pages)[0]) => {
      if (page.isPremium && !isPaid) {
          setShowUpgradeModal(true);
      } else {
          setActivePage(page.id as WellnessPage);
      }
    };

    if (showUpgradeModal) {
      return (
        <div>
           <button onClick={() => setShowUpgradeModal(false)} className="flex items-center gap-2 mb-4 text-orange-500 dark:text-orange-400 hover:text-orange-600 transition-colors">
            <ChevronLeftIcon className="w-5 h-5" />
            Back to Wellness
          </button>
          <SubscriptionPage isModal={true}/>
        </div>
      );
    }

    if (activePage) {
        const page = pages.find(p => p.id === activePage);
        const Component = page?.component;
        if (!Component) return null;

        return (
            <div className="animate-fade-in">
                 <button onClick={() => setActivePage(null)} className="flex items-center gap-2 mb-4 text-orange-500 dark:text-orange-400 hover:text-orange-600 transition-colors">
                    <ChevronLeftIcon className="w-5 h-5" />
                    Back to Wellness
                </button>
                <h2 className="text-2xl font-bold mb-4 text-center">{page.title}</h2>
                <Component />
            </div>
        )
    }

    return (
        <div className="animate-fade-in">
             <h2 className="text-2xl font-bold mb-6 text-center">Student Wellness</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pages.map(page => (
                    <WellnessCard 
                      key={page.id} 
                      title={page.title} 
                      description={page.description}
                      isPremium={page.isPremium}
                      isPaidUser={isPaid}
                      onClick={() => handlePageClick(page)} 
                    />
                ))}
            </div>
        </div>
    );
};

export default WellnessHome;