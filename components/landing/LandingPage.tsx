import React from 'react';
import { BookOpenIcon, HeartIcon, UsersIcon, StarIcon, CheckCircleIcon } from '../icons/Icons';

interface LandingPageProps {
  onGetStarted: () => void;
}

const FeatureCard: React.FC<{ icon: React.FC<any>, title: string, children: React.ReactNode }> = ({ icon: Icon, title, children }) => (
    <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-gray-700">
        <div className="bg-blue-100 dark:bg-blue-900/50 p-4 rounded-full inline-block mb-4">
            <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{children}</p>
    </div>
);

const PremiumBenefit: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex items-center gap-3">
        <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
        <span className="text-gray-800 dark:text-gray-200 font-medium">{children}</span>
    </li>
);

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="w-full min-h-screen text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900">
      
      {/* Hero Section */}
      <section className="relative text-center py-20 sm:py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-800 dark:via-blue-900/50 dark:to-gray-900 animate-calm-bg bg-[length:200%_200%]"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 tracking-tight">
            Unlock Your Academic Potential with <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-rainbow-red via-rainbow-orange via-rainbow-yellow via-rainbow-green via-rainbow-blue via-rainbow-indigo to-rainbow-violet animate-rainbow-text bg-[length:200%_auto]">
              StudyWell
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            The All-In-One AI Companion for Students Who Strive for Excellence.
          </p>
          <button
            onClick={onGetStarted}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg animate-subtle-pulse"
          >
            Get Started For Free
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-2">Everything You Need to Succeed</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-12">One platform, endless possibilities.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <FeatureCard icon={BookOpenIcon} title="Smarter Tools">
                    Boost productivity with AI-powered plagiarism checking, citation generation, essay structuring, and flashcard creation.
                 </FeatureCard>
                 <FeatureCard icon={HeartIcon} title="Enhanced Wellness">
                    Prioritize your well-being with guided breathing, wellness tracking, study music, and AI-generated mindful moments.
                 </FeatureCard>
                 <FeatureCard icon={UsersIcon} title="Thriving Community">
                    Connect with peers in subject-specific chat rooms, find friends, and engage in a supportive academic community.
                 </FeatureCard>
            </div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="py-20 px-4 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold mb-4 dark:bg-yellow-900/50 dark:text-yellow-300">
                    <StarIcon className="w-4 h-4" />
                    StudyWell Premium
                </div>
                <h2 className="text-3xl font-bold mb-4">Go Premium. Go Beyond.</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    While our free tier offers amazing value, StudyWell Premium unlocks unlimited access to our most powerful AI tools and advanced features. Supercharge your learning and wellness journey.
                </p>
                 <button
                    onClick={onGetStarted}
                    className="bg-gray-800 hover:bg-gray-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-full text-md transition-transform hover:scale-105"
                >
                    Explore Premium Features
                </button>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 p-8 rounded-lg shadow-xl border border-white/20">
                <ul className="space-y-4">
                   <PremiumBenefit>Unlimited AI-Powered Assistance</PremiumBenefit>
                   <PremiumBenefit>Advanced Wellness & Productivity Analytics</PremiumBenefit>
                   <PremiumBenefit>Exclusive Premium Content & Music</PremiumBenefit>
                   <PremiumBenefit>Unlimited Note Taking & History</PremiumBenefit>
                </ul>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-600 dark:text-gray-400 text-sm bg-gray-50 dark:bg-gray-900">
            <p>&copy; {new Date().getFullYear()} StudyWell. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;