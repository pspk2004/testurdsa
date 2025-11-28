import React from 'react';
import { Language } from '../types';

interface CodeEditorProps {
    code: string;
    onCodeChange: (newCode: string) => void;
    language: Language;
    onLanguageChange: (lang: Language) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onCodeChange, language, onLanguageChange }) => {
  return (
    <div className="flex flex-col h-full bg-zinc-900">
        <div className="p-2 bg-black/50 border-b border-zinc-700">
            <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value as Language)}
                className="bg-zinc-700 text-zinc-100 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
                <option value={Language.JavaScript}>JavaScript</option>
                <option value={Language.Python}>Python</option>
                <option value={Language.CPP}>C++</option>
            </select>
        </div>
        <div className="relative flex-grow">
            <textarea
                value={code}
                onChange={(e) => onCodeChange(e.target.value)}
                className="absolute inset-0 w-full h-full p-4 bg-zinc-900 text-zinc-100 font-mono text-sm resize-none border-0 focus:outline-none leading-relaxed"
                spellCheck="false"
                wrap="off"
            />
        </div>
    </div>
  );
};

export default CodeEditor;
