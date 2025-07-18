

import { useCallback, useMemo } from 'react';
import { User, UsageData } from '../types';

const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
};

export const useUsageTracker = (
    user: User, 
    featureKey: string, 
    dailyLimit: number, 
    isSandboxMode: boolean
) => {
    const today = getTodayDateString();

    const getUsage = useCallback(() => {
        if (!user || isSandboxMode) return 0;
        return user.usage?.[today]?.[featureKey] || 0;
    }, [user, today, featureKey, isSandboxMode]);

    const isLimitReached = useMemo(() => {
        if (isSandboxMode || !user) return false;
        return getUsage() >= dailyLimit;
    }, [getUsage, dailyLimit, isSandboxMode, user]);
    
    const incrementUsage = useCallback(async () => {
        if (isSandboxMode || !user) return;
        
        try {
            await fetch('/api/usage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, feature: featureKey }),
            });
            // The parent component should handle refetching the user object to update the UI
        } catch (error) {
            console.error("Failed to increment usage on server:", error);
        }
    }, [user, featureKey, isSandboxMode]);

    return {
        usage: getUsage(),
        isLimitReached,
        incrementUsage,
    };
};
