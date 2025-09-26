import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserSession } from '../types';
import * as db from '../services/databaseService';

interface SubscriptionContextType {
    isPaid: boolean;
    upgradeToPremium: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
    isPaid: false,
    upgradeToPremium: () => {},
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider: React.FC<{ children: ReactNode; session: UserSession }> = ({ children, session }) => {
    const [isPaid, setIsPaid] = useState(() => {
        const user = db.getUser(session.email);
        return user?.subscription?.tier === 'Premium';
    });

    const upgradeToPremium = () => {
        const user = db.getUser(session.email);
        if (user) {
            const updatedUser = {
                ...user,
                subscription: {
                    tier: 'Premium' as const,
                    startDate: new Date(),
                    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                }
            };
            db.saveUser(updatedUser);
            setIsPaid(true);
        }
    };

    return (
        <SubscriptionContext.Provider value={{ isPaid, upgradeToPremium }}>
            {children}
        </SubscriptionContext.Provider>
    );
};
