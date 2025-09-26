import React, { useState } from 'react';
import FAQPage from './info/FAQPage';
import GuidesPage from './info/GuidesPage';
import TermsOfUsePage from './info/TermsOfUsePage';
import PrivacyPolicyPage from './info/PrivacyPolicyPage';
import StudentCharterPage from './info/StudentCharterPage';
import { ChevronLeftIcon } from '../icons/Icons';

type InfoPage = 'faq' | 'guides' | 'terms' | 'privacy' | 'charter';

const HelpPage: React.FC = () => {
    const [activePage, setActivePage] = useState<InfoPage | null>(null);

    const pages = [
        { id: 'faq', title: 'Frequently Asked Questions', component: FAQPage },
        { id: 'guides', title: 'Feature Guides', component: GuidesPage },
        { id: 'charter', title: 'Student Charter', component: StudentCharterPage },
        { id: 'terms', title: 'Terms of Use', component: TermsOfUsePage },
        { id: 'privacy', title: 'Privacy Policy', component: PrivacyPolicyPage },
    ];

    if (activePage) {
        const page = pages.find(p => p.id === activePage);
        const Component = page?.component;
        if (!Component) return null;

        return (
            <div>
                <button onClick={() => setActivePage(null)} className="flex items-center gap-2 mb-4 text-blue-600 dark:text-blue-400">
                    <ChevronLeftIcon className="w-5 h-5" />
                    Back to Help Center
                </button>
                <h3 className="text-xl font-bold mb-4">{page.title}</h3>
                <div className="prose dark:prose-invert max-w-none">
                    <Component />
                </div>
            </div>
        );
    }
    
    return (
        <div>
            <h3 className="text-xl font-bold mb-4 text-center">Help Center</h3>
            <div className="space-y-3">
                {pages.map(page => (
                    <button 
                        key={page.id} 
                        onClick={() => setActivePage(page.id as InfoPage)}
                        className="w-full text-left p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        {page.title}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default HelpPage;
