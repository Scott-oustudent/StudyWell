import { useState, useCallback, useEffect } from 'react';

type UseLocalStorageOptions = {
    sandboxMode?: boolean;
};

function useLocalStorage<T>(key: string, initialValue: T, options: UseLocalStorageOptions = {}): [T, (value: T | ((val: T) => T)) => void] {
    const { sandboxMode = false } = options;

    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }

        if (sandboxMode) {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key “${key}”:`, error);
            return initialValue;
        }
    });
    
    // In sandbox mode, if the mode is toggled, we need to reset to initialValue.
    // This effect handles that case.
    useEffect(() => {
        if(sandboxMode) {
            setStoredValue(initialValue);
        }
    }, [sandboxMode, initialValue]);

    const setValue = useCallback((value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof window !== 'undefined' && !sandboxMode) {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.error(`Error setting localStorage key “${key}”:`, error);
        }
    }, [key, storedValue, sandboxMode]);

    return [storedValue, setValue];
}

export default useLocalStorage;
