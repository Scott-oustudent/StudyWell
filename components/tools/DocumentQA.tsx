import React, { useState } from 'react';
import { answerFromDocument } from '../../services/geminiService';
import { DocumentArrowUpIcon, XCircleIcon } from '../icons/Icons';
import { getAvatarComponent } from '../../data/avatars';

declare var pdfjsLib: any;
declare var mammoth: any;

type ChatTurn = {
    sender: 'user' | 'ai';
    text: string;
};

const DocumentQA: React.FC = () => {
    const [documentText, setDocumentText] = useState<string | null>(null);
    const [fileName, setFileName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [question, setQuestion] = useState('');
    const [chatHistory, setChatHistory] = useState<ChatTurn[]>([]);

    const UserAvatar = getAvatarComponent(); // Default user avatar
    const AiAvatar = getAvatarComponent('avatar6'); // Use one of the system avatars for the AI

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setFileName(file.name);
        setDocumentText(null);
        setChatHistory([]);
        setError('');

        try {
            let textContent = '';
            if (file.type === 'application/pdf') {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
                        const pdf = await pdfjsLib.getDocument(typedArray).promise;
                        for (let i = 1; i <= pdf.numPages; i++) {
                            const page = await pdf.getPage(i);
                            const textData = await page.getTextContent();
                            textContent += textData.items.map((item: any) => item.str).join(' ') + '\n';
                        }
                        setDocumentText(textContent);
                    } catch (err) {
                        setError('Failed to parse PDF file.');
                    } finally {
                        setIsLoading(false);
                    }
                };
                reader.readAsArrayBuffer(file);
            } else if (file.name.endsWith('.docx')) {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const arrayBuffer = e.target?.result as ArrayBuffer;
                        const result = await mammoth.extractRawText({ arrayBuffer });
                        setDocumentText(result.value);
                    } catch (err) {
                        setError('Failed to parse DOCX file.');
                    } finally {
                        setIsLoading(false);
                    }
                };
                reader.readAsArrayBuffer(file);
            } else {
                setError('Unsupported file type. Please upload a .pdf or .docx file.');
                setIsLoading(false);
            }
        } catch (err) {
            setError('An error occurred while reading the file.');
            setIsLoading(false);
        }
    };
    
    const handleAskQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim() || !documentText) return;

        const userTurn: ChatTurn = { sender: 'user', text: question };
        setChatHistory(prev => [...prev, userTurn]);
        setQuestion('');
        setIsLoading(true);

        const aiResponse = await answerFromDocument(documentText, question);
        const aiTurn: ChatTurn = { sender: 'ai', text: aiResponse };
        setChatHistory(prev => [...prev, userTurn, aiTurn]);
        setIsLoading(false);
    };

    const resetState = () => {
        setDocumentText(null);
        setFileName('');
        setChatHistory([]);
        setError('');
    };

    return (
        <div className="bg-white/80 dark:bg-gray-800/80 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            {!documentText && !isLoading && (
                <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Upload a Document</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Upload a PDF or DOCX file to start asking questions about its content.</p>
                    <label className="cursor-pointer flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <DocumentArrowUpIcon className="w-12 h-12 text-gray-400" />
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">Click to upload</span>
                        <span className="text-xs text-gray-500">PDF or DOCX</span>
                        <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx" />
                    </label>
                </div>
            )}

            {(isLoading && !documentText) && (
                 <div className="text-center text-gray-600 dark:text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2">Analyzing document: {fileName}...</p>
                 </div>
            )}

            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
            
            {documentText && (
                 <div className="flex flex-col h-full" style={{minHeight: '60vh'}}>
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div>
                            <p className="font-semibold">Document Loaded:</p>
                            <p className="text-sm text-green-600">{fileName}</p>
                        </div>
                        <button onClick={resetState} className="flex items-center gap-1 text-sm text-red-500 hover:underline">
                            <XCircleIcon className="w-4 h-4" />
                            Remove
                        </button>
                    </div>

                    <div className="flex-grow overflow-y-auto space-y-4 p-2">
                        {chatHistory.map((turn, index) => (
                           <div key={index} className={`flex gap-3 ${turn.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                {turn.sender === 'ai' ? <AiAvatar className="w-8 h-8"/> : <UserAvatar className="w-8 h-8"/>}
                                <div className={`rounded-lg p-3 max-w-md ${turn.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>
                                    <p className="whitespace-pre-wrap">{turn.text}</p>
                                </div>
                           </div>
                        ))}
                         {isLoading && chatHistory.length > 0 && (
                            <div className="flex gap-3">
                                <AiAvatar className="w-8 h-8"/>
                                <div className="rounded-lg p-3 bg-gray-200 dark:bg-gray-600 animate-pulse">
                                    Thinking...
                                </div>
                            </div>
                         )}
                    </div>
                    
                    <form onSubmit={handleAskQuestion} className="mt-4 flex gap-2">
                         <input
                            type="text"
                            value={question}
                            onChange={e => setQuestion(e.target.value)}
                            placeholder="Ask a question about the document..."
                            className="w-full p-2 bg-white dark:bg-gray-700 border rounded-md"
                            disabled={isLoading}
                        />
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:bg-blue-400" disabled={isLoading || !question.trim()}>
                            Ask
                        </button>
                    </form>
                 </div>
            )}
        </div>
    );
};

export default DocumentQA;
