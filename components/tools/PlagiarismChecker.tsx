import React, { useState, useMemo } from 'react';
import { checkPlagiarism } from '../../services/geminiService';
import { PlagiarismResult, PlagiarismFinding } from '../../types';
import { XCircleIcon, DocumentArrowUpIcon } from '../icons/Icons';

declare var pdfjsLib: any;
declare var mammoth: any;

const ScoreRing: React.FC<{ score: number }> = ({ score }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const scoreColor = score > 50 ? 'stroke-red-500' : score > 20 ? 'stroke-yellow-500' : 'stroke-green-500';

    return (
        <div className="relative flex flex-col items-center justify-center w-40 h-40">
            <svg className="absolute w-full h-full" viewBox="0 0 120 120">
                <circle
                    className="stroke-current text-gray-200 dark:text-gray-700"
                    strokeWidth="10"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                />
                <circle
                    className={`stroke-current ${scoreColor} transition-all duration-1000 ease-out`}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                    transform="rotate(-90 60 60)"
                />
            </svg>
            <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">{score}%</span>
            <span className="text-sm text-gray-600 dark:text-gray-400 mt-1">Plagiarism Risk</span>
        </div>
    );
};

// Sub-component to render the analysis result
const PlagiarismResultView: React.FC<{ text: string; result: PlagiarismResult }> = ({ text, result }) => {
    const [activeFinding, setActiveFinding] = useState<PlagiarismFinding | null>(null);

    const confidenceColors: Record<PlagiarismFinding['confidence'], string> = {
        'High': 'bg-red-500/30 hover:bg-red-500/40 border-red-500/40',
        'Medium': 'bg-yellow-500/30 hover:bg-yellow-500/40 border-yellow-500/40',
        'Low': 'bg-blue-500/30 hover:bg-blue-500/40 border-blue-500/40',
    };
    
    const statusColors: Record<PlagiarismFinding['status'], string> = {
        'Plagiarized': '', // This will default to using the confidence color
        'Referenced': 'bg-green-500/30 hover:bg-green-500/40 border-green-500/40',
    };

    const highlightedText = useMemo(() => {
        if (!result.findings || result.findings.length === 0) {
            return <p className="whitespace-pre-wrap font-sans">{text}</p>;
        }

        const findingsMap = new Map<string, PlagiarismFinding>();
        result.findings.forEach((f) => {
            const trimmedText = f.plagiarizedText.trim();
            if (trimmedText && !findingsMap.has(trimmedText)) {
                findingsMap.set(trimmedText, f);
            }
        });
        
        if (findingsMap.size === 0) {
             return <p className="whitespace-pre-wrap font-sans">{text}</p>;
        }

        const regex = new RegExp(`(${[...findingsMap.keys()].map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
        const parts = text.split(regex).filter(part => part);

        return (
            <p className="whitespace-pre-wrap font-sans leading-relaxed">
                {parts.map((part, index) => {
                    const finding = findingsMap.get(part.trim());
                    if (finding) {
                        const colorClass = finding.status === 'Referenced' ? statusColors.Referenced : confidenceColors[finding.confidence];
                        return (
                            <mark
                                key={index}
                                onClick={() => setActiveFinding(finding)}
                                className={`px-1 rounded cursor-pointer transition-colors ${colorClass}`}
                            >
                                {part}
                            </mark>
                        );
                    }
                    return <span key={index}>{part}</span>;
                })}
            </p>
        );
    }, [text, result.findings]);

    return (
        <div className="mt-6 space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-around gap-6 p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-md">
                <ScoreRing score={result.plagiarismScore} />
                <div className="flex-1">
                    <h4 className="font-bold text-lg mb-2 text-blue-700 dark:text-blue-400">AI Summary:</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{result.summary}</p>
                </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-md">
                <h4 className="font-bold text-lg mb-2 text-blue-700 dark:text-blue-400">Document Analysis:</h4>
                <div className="max-h-96 overflow-y-auto pr-2">{highlightedText}</div>
            </div>

            {result.findings.length > 0 && (
                 <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-md">
                    <h4 className="font-bold text-lg mb-3 text-blue-700 dark:text-blue-400">Sources Found ({result.findings.length}):</h4>
                    <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {result.findings.map((finding, index) => {
                           const borderColor = finding.status === 'Referenced' ? 'border-green-500' : 'border-red-500';
                           return (
                            <li key={index} className={`border-l-4 p-3 bg-white dark:bg-gray-800 ${borderColor}`}>
                                <p className={`font-semibold text-xs mb-1 ${finding.status === 'Referenced' ? 'text-green-600' : 'text-red-600'}`}>{finding.status}</p>
                                <p className="font-semibold text-sm truncate text-gray-800 dark:text-gray-200 italic">"{finding.plagiarizedText}"</p>
                                <a href={finding.source} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline break-all">{finding.source}</a>
                            </li>
                           )
                        })}
                    </ul>
                 </div>
            )}
            
            {activeFinding && (
                <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center p-4" onClick={() => setActiveFinding(null)}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                             <h3 className="text-xl font-bold text-blue-700 dark:text-blue-400">Source Details</h3>
                             <button onClick={() => setActiveFinding(null)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                <XCircleIcon className="w-6 h-6 text-gray-500 dark:text-gray-400"/>
                             </button>
                        </div>
                        <div className='space-y-4'>
                            <div>
                                <p className="font-semibold text-gray-600 dark:text-gray-400 mb-1">Status:</p>
                                <p className={`font-bold inline-block px-2 py-1 rounded-md text-sm ${activeFinding.status === 'Referenced' ? statusColors.Referenced : confidenceColors[activeFinding.confidence]}`}>{activeFinding.status}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-600 dark:text-gray-400 mb-1">Matched Text:</p>
                                <p className="italic bg-gray-100 dark:bg-gray-700 p-2 rounded text-gray-800 dark:text-gray-200">"{activeFinding.plagiarizedText}"</p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-600 dark:text-gray-400 mb-1">Potential Source:</p>
                                <a href={activeFinding.source} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline break-all block">{activeFinding.source}</a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const PlagiarismChecker: React.FC = () => {
    const [text, setText] = useState('');
    const [result, setResult] = useState<PlagiarismResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [fileName, setFileName] = useState('');
    const [error, setError] = useState('');

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsParsing(true);
        setFileName(file.name);
        setText('');
        setResult(null);
        setError('');

        try {
            if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
                const textContent = await file.text();
                setText(textContent);
            } else if (file.name.endsWith('.pdf')) {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
                        const pdf = await pdfjsLib.getDocument(typedArray).promise;
                        let textContent = '';
                        for (let i = 1; i <= pdf.numPages; i++) {
                            const page = await pdf.getPage(i);
                            const textData = await page.getTextContent();
                            textContent += textData.items.map((item: any) => item.str).join(' ') + '\n';
                        }
                        setText(textContent);
                    } catch (err) {
                        setError('Failed to parse PDF file. It might be encrypted or corrupted.');
                    } finally {
                        setIsParsing(false);
                    }
                };
                reader.readAsArrayBuffer(file);
            } else if (file.name.endsWith('.docx')) {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const arrayBuffer = e.target?.result as ArrayBuffer;
                        const result = await mammoth.extractRawText({ arrayBuffer });
                        setText(result.value);
                    } catch (err) {
                        setError('Failed to parse DOCX file.');
                    } finally {
                        setIsParsing(false);
                    }
                };
                reader.readAsArrayBuffer(file);
            } else {
                setError('Unsupported file type. Please use .txt, .pdf, or .docx');
                setIsParsing(false);
            }
        } catch (err) {
            console.error("Error parsing file:", err);
            setError('Failed to read the document. It may be corrupted or in an unsupported format.');
            setIsParsing(false);
        }
        event.target.value = ''; // Allow re-uploading the same file
    };


    const handleCheck = async () => {
        const textToCheck = text.trim();
        if (!textToCheck) {
            setError('Please enter some text or upload a document to check.');
            return;
        }
        if (textToCheck.length < 50) {
            setError('Please provide at least 50 characters for an effective plagiarism check.');
            return;
        }

        setIsLoading(true);
        setResult(null);
        setError('');

        const response = await checkPlagiarism(text);

        if (response.summary.includes('error')) {
            setError(response.summary);
        } else {
            setResult(response);
        }
        setIsLoading(false);
    };

    const isCheckDisabled = isLoading || isParsing || !text.trim();

    return (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <div className='flex flex-col sm:flex-row gap-4 mb-4'>
                <label className="flex-1 w-full sm:w-auto cursor-pointer flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-md transition-colors duration-200 border border-gray-300 dark:border-gray-600">
                    <DocumentArrowUpIcon className="w-5 h-5" />
                    <span>Upload Document</span>
                    <input type="file" className="hidden" onChange={handleFileChange} accept=".txt,.pdf,.docx" disabled={isLoading || isParsing}/>
                </label>
                <button
                    onClick={handleCheck}
                    disabled={isCheckDisabled}
                    className="flex-1 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Checking...' : 'Check Text'}
                </button>
            </div>
             <textarea
                className="w-full h-48 p-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Or paste your text here... (Accepted files: .txt, .pdf, .docx)"
                value={text}
                onChange={(e) => {
                    setText(e.target.value);
                    setFileName('');
                }}
                disabled={isLoading || isParsing}
            />
            {fileName && !isParsing && <p className="text-sm text-green-600 mt-2">Loaded content from: {fileName}</p>}
            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
            
            {(isLoading || isParsing) && (
                 <div className="mt-6 text-center text-gray-600 dark:text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2">{isParsing ? `Reading ${fileName}...` : 'Analyzing document... this may take a moment.'}</p>
                 </div>
            )}

            {result && <PlagiarismResultView text={text} result={result} />}
        </div>
    );
};

export default PlagiarismChecker;