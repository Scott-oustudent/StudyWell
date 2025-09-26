import React, { useState, useMemo } from 'react';
import { XCircleIcon } from './icons/Icons';
import * as db from '../services/databaseService';
import { Note, ScheduleEvent } from '../types';

interface GlobalSearchProps {
    onClose: () => void;
}

const getNotePreview = (content: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    return text.substring(0, 100) + (text.length > 100 ? '...' : '');
};


const GlobalSearch: React.FC<GlobalSearchProps> = ({ onClose }) => {
    const [query, setQuery] = useState('');
    
    const searchResults = useMemo(() => {
        if (query.trim().length < 2) {
            return { notes: [], events: [] };
        }
        return db.searchAll(query);
    }, [query]);

    return (
        <div className="fixed inset-0 bg-black/70 z-40 flex flex-col items-center p-4" onClick={onClose}>
            <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col mt-12" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search notes and events..."
                        className="w-full bg-transparent text-lg focus:outline-none text-gray-900 dark:text-gray-100"
                        autoFocus
                    />
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <XCircleIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>
                
                <div className="p-4 overflow-y-auto max-h-[70vh]">
                    {query.trim().length < 2 ? (
                         <p className="text-center text-gray-500">Enter at least 2 characters to search.</p>
                    ) : (
                        <div className="space-y-6">
                            {searchResults.notes.length > 0 && (
                                <div>
                                    <h3 className="font-bold text-blue-600 dark:text-blue-400 mb-2">Notes ({searchResults.notes.length})</h3>
                                    <ul className="space-y-2">
                                        {searchResults.notes.map(note => (
                                            <li key={note.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                                <p className="font-semibold truncate">{note.title}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{getNotePreview(note.content)}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                             {searchResults.events.length > 0 && (
                                <div>
                                    <h3 className="font-bold text-orange-500 dark:text-orange-400 mb-2">Schedule Events ({searchResults.events.length})</h3>
                                     <ul className="space-y-2">
                                        {searchResults.events.map(event => (
                                            <li key={event.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                                <p className="font-semibold truncate">{event.title}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(event.date).toLocaleDateString()}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {searchResults.notes.length === 0 && searchResults.events.length === 0 && (
                                <p className="text-center text-gray-500">No results found for "{query}".</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GlobalSearch;