import React, { useState } from 'react';
import { useSubscription } from '../../context/SubscriptionContext';
import { CheckCircleIcon, StarIcon } from '../icons/Icons';
import PayPalModal from '../modals/PayPalModal';
import { savePayment } from '../../services/databaseService';

interface SubscriptionPageProps {
  isModal?: boolean;
}

const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ isModal = false }) => {
    const { isPaid, upgradeToPremium } = useSubscription();
    const [showPayPal, setShowPayPal] = useState(false);

    const handleUpgrade = () => {
        setShowPayPal(true);
    };

    const handleSuccess = (capture?: any) => {
        if (capture) {
            savePayment({ capture, date: new Date().toISOString(), amount: 9.99, currency: 'GBP' });
        }
        upgradeToPremium();
        setShowPayPal(false);
    };

    return (
        <div className={`${!isModal ? 'bg-white/80 dark:bg-gray-800/80 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700' : ''}`}>
            {showPayPal && <PayPalModal onSuccess={(c: any) => handleSuccess(c)} onClose={() => setShowPayPal(false)} />}
            <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold mb-4 dark:bg-yellow-900/50 dark:text-yellow-300">
                    <StarIcon className="w-4 h-4" />
                    StudyWell Premium
                </div>
                <h3 className="text-2xl font-bold mb-4">{isPaid ? 'You are a Premium Member!' : 'Unlock Your Full Potential'}</h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-6">
                    {isPaid ? 'Thank you for supporting StudyWell. You have unlimited access to all our features.' : 'Upgrade to Premium to get unlimited access to all our powerful AI tools and advanced features.'}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left my-8">
                    <div className="bg-gray-100 dark:bg-gray-700/50 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                        <h4 className="font-bold text-lg mb-3">Free</h4>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2"><CheckCircleIcon className="w-5 h-5 text-green-500" /> Core Tools (Scheduler, Pomodoro)</li>
                            <li className="flex items-center gap-2"><CheckCircleIcon className="w-5 h-5 text-green-500" /> Basic Wellness Features</li>
                            <li className="flex items-center gap-2"><CheckCircleIcon className="w-5 h-5 text-green-500" /> Community Chat Access</li>
                            <li className="flex items-center gap-2"><CheckCircleIcon className="w-5 h-5 text-green-500" /> Up to 5 Notes</li>
                        </ul>
                    </div>
                     <div className="bg-blue-100 dark:bg-blue-900/50 p-6 rounded-lg border-2 border-blue-500">
                        <h4 className="font-bold text-lg mb-3 text-blue-700 dark:text-blue-400">Premium</h4>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2"><CheckCircleIcon className="w-5 h-5 text-blue-500" /> <strong>All Free features, plus:</strong></li>
                            <li className="flex items-center gap-2"><CheckCircleIcon className="w-5 h-5 text-blue-500" /> Unlimited AI Tool Usage</li>
                            <li className="flex items-center gap-2"><CheckCircleIcon className="w-5 h-5 text-blue-500" /> AI Document Q&A</li>
                            <li className="flex items-center gap-2"><CheckCircleIcon className="w-5 h-5 text-blue-500" /> Unlimited Notes & History Export</li>
                            <li className="flex items-center gap-2"><CheckCircleIcon className="w-5 h-5 text-blue-500" /> Advanced Wellness Analytics</li>
                        </ul>
                    </div>
                </div>

                {!isPaid && (
                     <button onClick={handleUpgrade} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform hover:scale-105">
                        Upgrade Now - £9.99/year
                    </button>
                )}
            </div>
        </div>
    );
};

export default SubscriptionPage;
