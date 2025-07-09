
import { useState, useCallback, useMemo } from 'react';
import useLocalStorage from './useLocalStorage';
import { UsageData } from '../types';

const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
};

export const useUsageTracker = (featureKey: string, dailyLimit: number) => {
    const [usageData, setUsageData] = useLocalStorage<UsageData>('usageData', {});
    const today = getTodayDateString();

    const getUsage = useCallback(() => {
        return usageData[today]?.[featureKey] || 0;
    }, [usageData, today, featureKey]);

    const isLimitReached = useMemo(() => {
        return getUsage() >= dailyLimit;
    }, [getUsage, dailyLimit]);
    
    const incrementUsage = useCallback(() => {
        setUsageData(prevData => {
            const currentCount = prevData[today]?.[featureKey] || 0;
            const newDailyUsage = {
                ...(prevData[today] || {}),
                [featureKey]: currentCount + 1,
            };
            return {
                ...prevData,
                [today]: newDailyUsage,
            };
        });
    }, [setUsageData, today, featureKey]);

    return {
        usage: getUsage(),
        isLimitReached,
        incrementUsage,
    };
};
