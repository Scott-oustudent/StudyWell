import React, { useState, useRef, useEffect, useCallback } from 'react';
import Button from './Button';
import Icon from './Icon';

interface ExportMenuProps {
  elementId: string;
  textContent: string;
  filename: string;
  disabled?: boolean;
}

const ExportMenu: React.FC<ExportMenuProps> = ({ elementId, textContent, filename, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const { jsPDF } = (window as any).jspdf || {};
  const html2canvas = (window as any).html2canvas;
  const TurndownService = (window as any).TurndownService;
  const htmlToDocx = (window as any).htmlToDocx;

  const toggleMenu = () => !disabled && setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if(window.speechSynthesis?.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleDownloadPDF = useCallback(async () => {
    const element = document.getElementById(elementId);
    if (!element || !jsPDF || !html2canvas) {
        console.error("PDF generation library or element not found.");
        return;
    }
    setIsOpen(false);
    
    const canvas = await html2canvas(element, { scale: 2 });
    const data = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(data, 'PNG', 10, 10, pdfWidth - 20, pdfHeight - 20);
    pdf.save(`${filename}.pdf`);
  }, [elementId, filename, jsPDF, html2canvas]);

  const handleDownloadMD = useCallback(() => {
    if (!textContent || !TurndownService) {
        console.error("Markdown generation library or content not found.");
        return;
    }
    setIsOpen(false);

    const turndownService = new TurndownService();
    const markdown = turndownService.turndown(textContent);
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [textContent, filename, TurndownService]);

  const handleDownloadDOCX = useCallback(async () => {
    const element = document.getElementById(elementId);
    if (!element || !htmlToDocx) {
        console.error("DOCX generation library or element not found.");
        return;
    }
    setIsOpen(false);
    
    const fileBuffer = await htmlToDocx(element.outerHTML, null, {
        table: { row: { cantSplit: true } },
    });

    const blob = new Blob([fileBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [elementId, filename, htmlToDocx]);
  
  const handleReadAloud = useCallback(() => {
    if (!textContent || !('speechSynthesis' in window)) return;
    setIsOpen(false);
    
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
    }
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = textContent;
    const plainText = tempDiv.textContent || tempDiv.innerText || "";

    if (!plainText.trim()) return;

    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [textContent]);
  
  useEffect(() => {
    return () => {
        if (window.speechSynthesis?.speaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };
  }, [disabled]);


  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <div>
        <Button
          onClick={toggleMenu}
          disabled={disabled}
          variant="secondary"
          className="flex items-center gap-2"
        >
          <Icon>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </Icon>
          Export
        </Button>
      </div>

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1" role="none">
            <button onClick={handleDownloadPDF} className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 disabled:text-gray-400" role="menuitem" disabled={!jsPDF || !html2canvas}>Download as PDF</button>
            <button onClick={handleDownloadMD} className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 disabled:text-gray-400" role="menuitem" disabled={!TurndownService}>Download as Markdown</button>
            <button onClick={handleDownloadDOCX} className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 disabled:text-gray-400" role="menuitem" disabled={!htmlToDocx}>Download as Word</button>
            <div className="border-t border-gray-100 my-1"></div>
            <button onClick={handleReadAloud} className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100" role="menuitem">{isSpeaking ? 'Stop Reading' : 'Read Aloud'}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportMenu;
