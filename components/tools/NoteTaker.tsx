import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Note, UserData, SharedNote } from '../../types';
import { PlusIcon, TrashIcon, ChevronLeftIcon, SparklesIcon, ShareIcon, DocumentArrowUpIcon, DownloadIcon } from '../icons/Icons';
import { useSubscription } from '../../context/SubscriptionContext';
import * as db from '../../services/databaseService';
import * as geminiService from '../../services/geminiService';

const FREE_NOTE_LIMIT = 5;

// Helper to get a preview of the note content (strips HTML)
const getNotePreview = (content: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    return text.substring(0, 100) + (text.length > 100 ? '...' : '');
};


const NoteTaker: React.FC = () => {
    const [notes, setNotes] = useState<Note[]>(() => db.getNotes());
    const [sharedNotes, setSharedNotes] = useState<SharedNote[]>([]);
    const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
    const { isPaid } = useSubscription();
    const sessionEmail = JSON.parse(localStorage.getItem('userSession') || '{}').email;

    const atNoteLimit = !isPaid && notes.length >= FREE_NOTE_LIMIT;
    
    useEffect(() => {
        const allShared = db.getSharedNotes();
        setSharedNotes(allShared.filter(sn => sn.sharedToEmail === sessionEmail));
    }, [sessionEmail]);


    useEffect(() => {
        db.saveNotes(notes);
    }, [notes]);
    
    const handleNewNote = () => {
        if (atNoteLimit) return;

        const newNote: Note = {
            id: Date.now().toString(),
            title: 'New Note',
            content: '',
            lastModified: new Date(),
        };
        setNotes(prev => [newNote, ...prev]);
        setActiveNoteId(newNote.id);
    };
    
    const handleDeleteNote = (idToDelete: string) => {
        setNotes(notes.filter(note => note.id !== idToDelete));
        if (activeNoteId === idToDelete) {
            setActiveNoteId(null);
        }
    };

    const updateNote = useCallback((id: string, updatedFields: Partial<Omit<Note, 'id'>>) => {
        setNotes(prevNotes => 
            prevNotes.map(note => 
                note.id === id ? { ...note, ...updatedFields, lastModified: new Date() } : note
            ).sort((a,b) => b.lastModified.getTime() - a.lastModified.getTime())
        );
    }, []);
    
    const handleExport = () => {
        const dataStr = JSON.stringify(notes, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'studywell_notes_export.json';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedNotes = JSON.parse(e.target?.result as string);
                if (Array.isArray(importedNotes) && importedNotes.every(n => n.id && n.title && 'content' in n)) {
                    if (window.confirm('Are you sure you want to import these notes? This will overwrite your current notes.')) {
                        setNotes(importedNotes.map((n: any) => ({...n, lastModified: new Date(n.lastModified)})));
                    }
                } else {
                    alert('Invalid note file format.');
                }
            } catch (error) {
                alert('Failed to parse the notes file.');
            }
        };
        reader.readAsText(file);
    };

    const activeNote = notes.find(n => n.id === activeNoteId);

    if (activeNote) {
        return <NoteEditor 
            key={activeNote.id}
            note={activeNote} 
            onBack={() => setActiveNoteId(null)} 
            onUpdate={updateNote}
            onDelete={handleDeleteNote}
        />;
    }

    return (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">My Notes</h2>
                <div className="flex items-center gap-2">
                    <label className="cursor-pointer p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" title="Import Notes">
                        <DocumentArrowUpIcon className="w-5 h-5"/>
                        <input type="file" accept=".json" className="hidden" onChange={handleImport}/>
                    </label>
                    <button onClick={handleExport} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" title="Export Notes">
                        <DownloadIcon className="w-5 h-5"/>
                    </button>
                </div>
            </div>
            {atNoteLimit && (
                <div className="text-center p-3 mb-4 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 rounded-md border border-yellow-200 dark:border-yellow-800">
                    You've reached the {FREE_NOTE_LIMIT}-note limit. Upgrade for unlimited notes!
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                {notes.length > 0 ? notes.map(note => (
                    <div 
                        key={note.id} 
                        onClick={() => setActiveNoteId(note.id)}
                        className="bg-white dark:bg-gray-800 p-4 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                    >
                        <h3 className="font-bold truncate text-blue-700 dark:text-blue-400">{note.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{getNotePreview(note.content)}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{note.lastModified.toLocaleDateString()}</p>
                    </div>
                )) : (
                    <p className="text-center text-gray-600 dark:text-gray-400 md:col-span-2">You don't have any notes yet. Create one!</p>
                )}
            </div>
            
            {sharedNotes.length > 0 && (
                <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                     <h3 className="text-xl font-bold mb-4">Shared With Me</h3>
                     {sharedNotes.map(sn => (
                        <div key={sn.id} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
                           <h4 className="font-bold truncate text-purple-700 dark:text-purple-400">{sn.note.title}</h4>
                           <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{getNotePreview(sn.note.content)}</p>
                           <p className="text-xs text-gray-500 mt-2">Shared by {sn.sharedByEmail}</p>
                        </div>
                     ))}
                </div>
            )}

            <button 
                onClick={handleNewNote} 
                className={`fixed bottom-24 right-6 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 ${atNoteLimit ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}
                aria-label="Create new note"
                disabled={atNoteLimit}
            >
                <PlusIcon className="w-6 h-6" />
            </button>
        </div>
    );
};


interface NoteEditorProps {
    note: Note;
    onBack: () => void;
    onUpdate: (id: string, updatedFields: Partial<Omit<Note, 'id'>>) => void;
    onDelete: (id: string) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onBack, onUpdate, onDelete }) => {
    const [title, setTitle] = useState(note.title);
    const editorRef = useRef<HTMLDivElement>(null);
    const hasUnsavedChangesRef = useRef(false);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    // Autosave every 2 seconds if changes have been made
    useEffect(() => {
        const intervalId = setInterval(() => {
            if (hasUnsavedChangesRef.current && editorRef.current) {
                onUpdate(note.id, { title, content: editorRef.current.innerHTML });
                hasUnsavedChangesRef.current = false;
            }
        }, 2000);

        return () => clearInterval(intervalId);
    }, [note.id, title, onUpdate]);

    // Save any pending changes when the user navigates away (component unmounts)
    useEffect(() => {
        return () => {
            if (hasUnsavedChangesRef.current && editorRef.current) {
                onUpdate(note.id, { title, content: editorRef.current.innerHTML });
                hasUnsavedChangesRef.current = false;
            }
        };
    }, [note.id, title, onUpdate]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        hasUnsavedChangesRef.current = true;
    };
    
    const handleContentInput = () => {
        hasUnsavedChangesRef.current = true;
    };
    
    const handleCommand = (command: string) => {
        document.execCommand(command, false, undefined);
        editorRef.current?.focus();
        hasUnsavedChangesRef.current = true;
    };
    
    const handleAiAction = async (action: 'summarize' | 'actionItems' | 'improve') => {
        if (!editorRef.current || isAiLoading) return;
        const currentText = editorRef.current.innerText;
        if (currentText.trim().length < 20) {
            alert("Please add more content before using the AI assistant.");
            return;
        }

        setIsAiLoading(true);
        let result = '';
        if (action === 'summarize') {
            result = await geminiService.summarizeText(currentText);
            editorRef.current.innerHTML += `<br><hr><p><strong>AI Summary:</strong><br>${result}</p>`;
        } else if (action === 'actionItems') {
            result = await geminiService.findActionItems(currentText);
            editorRef.current.innerHTML += `<br><hr><p><strong>AI Action Items:</strong><br>${result.replace(/\n/g, '<br>')}</p>`;
        } else if (action === 'improve') {
            result = await geminiService.improveWriting(currentText);
            editorRef.current.innerText = result;
        }
        hasUnsavedChangesRef.current = true;
        setIsAiLoading(false);
    };

    return (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-lg shadow-lg flex flex-col h-full border border-gray-200 dark:border-gray-700">
            {isShareModalOpen && <ShareModal note={note} onClose={() => setIsShareModalOpen(false)} />}
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <button onClick={onBack} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors">
                    <ChevronLeftIcon className="w-5 h-5" />
                    Back to Notes
                </button>
                <div>
                     <button onClick={() => setIsShareModalOpen(true)} className="p-2 rounded-full hover:bg-blue-500/10 text-gray-500 hover:text-blue-500" aria-label="Share note"><ShareIcon className="w-5 h-5"/></button>
                    <button onClick={() => { if (window.confirm('Delete this note?')) { onDelete(note.id); } }} className="p-2 rounded-full hover:bg-red-500/10 text-gray-500 hover:text-red-500" aria-label="Delete note">
                        <TrashIcon className="w-5 h-5"/>
                    </button>
                </div>
            </div>

            <input type="text" value={title} onChange={handleTitleChange} placeholder="Note Title" className="w-full p-2 bg-transparent text-2xl font-bold focus:outline-none mb-2 text-gray-900 dark:text-gray-100"/>
            
            <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-t-md border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
                <EditorButton onClick={() => handleCommand('bold')} label="Bold">B</EditorButton>
                <EditorButton onClick={() => handleCommand('italic')} label="Italic"><i className="italic">I</i></EditorButton>
                <EditorButton onClick={() => handleCommand('insertUnorderedList')} label="Bullet points">●</EditorButton>
                <div className="ml-auto relative group">
                    <button disabled={isAiLoading} className="px-3 py-1 bg-purple-500 text-white rounded-md flex items-center gap-2 text-sm disabled:bg-purple-300">
                        <SparklesIcon className="w-4 h-4" /> AI Assistant
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 hidden group-hover:block">
                        <a onClick={() => handleAiAction('summarize')} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">Summarize</a>
                        <a onClick={() => handleAiAction('actionItems')} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">Find Action Items</a>
                        <a onClick={() => handleAiAction('improve')} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">Improve Writing</a>
                    </div>
                </div>
            </div>

            <div
                ref={editorRef}
                contentEditable
                onInput={handleContentInput}
                dangerouslySetInnerHTML={{ __html: note.content }}
                className="flex-grow p-4 bg-white dark:bg-gray-900 rounded-b-md focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-y-auto text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600"
                style={{minHeight: '40vh'}}
            />
        </div>
    );
};

const EditorButton: React.FC<{ onClick: () => void, children: React.ReactNode, label: string }> = ({ onClick, children, label }) => (
    <button onClick={onClick} onMouseDown={e => e.preventDefault()} className="px-3 py-1 font-bold text-lg w-10 text-center bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded text-gray-800 dark:text-gray-200" aria-label={label}>
        {children}
    </button>
);

const ShareModal: React.FC<{note: Note, onClose: () => void}> = ({ note, onClose }) => {
    const sessionEmail = JSON.parse(localStorage.getItem('userSession') || '{}').email;
    const [friends, setFriends] = useState<UserData[]>([]);

    useEffect(() => {
        const friendEmails = db.getFriends(sessionEmail);
        const allUsers = db.getAllUsers();
        setFriends(allUsers.filter(u => friendEmails.includes(u.email)));
    }, [sessionEmail]);

    const handleShare = (friendEmail: string) => {
        const sharedNote: SharedNote = {
            id: Date.now().toString(),
            originalNoteId: note.id,
            sharedByEmail: sessionEmail,
            sharedToEmail: friendEmail,
            sharedAt: new Date(),
            note: { ...note }, // Create a snapshot
        };
        db.shareNote(sharedNote);
        alert(`Note shared with ${friendEmail}`);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">Share Note</h3>
                {friends.length > 0 ? (
                    <ul className="space-y-2 max-h-60 overflow-y-auto">
                        {friends.map(friend => (
                            <li key={friend.email} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                                <span>{friend.username}</span>
                                <button onClick={() => handleShare(friend.email)} className="bg-blue-500 text-white px-3 py-1 text-sm rounded">Share</button>
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-gray-500">You have no friends to share with.</p>}
            </div>
        </div>
    );
};

export default NoteTaker;