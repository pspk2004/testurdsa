import React from 'react';
import useProctoring from '../hooks/useProctoring';
import type { ProctoringLog } from '../types';
import { EyeIcon } from './icons/Icons';

interface ProctoringViewProps {
  addLog: (log: ProctoringLog) => void;
  logs: ProctoringLog[];
  enabled: boolean;
}

const ProctoringView: React.FC<ProctoringViewProps> = ({ addLog, logs, enabled }) => {
  const { videoRef, status, error } = useProctoring(addLog, enabled);

  return (
    <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-700 flex flex-col min-h-[250px]">
      <div className="flex items-center gap-2 mb-3">
        <EyeIcon className="w-6 h-6 text-amber-400" />
        <h3 className="text-lg font-semibold text-white">Proctoring</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
        <div className="relative w-full bg-black rounded-md overflow-hidden aspect-video">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          {error && <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-red-400 p-4 text-center">{error}</div>}
          {!error && <div className="absolute top-2 left-2 flex items-center gap-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
             <span className={`w-2 h-2 rounded-full ${status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
             {status}
          </div>}
        </div>
        <div className="bg-black/50 rounded-md p-3 text-sm text-zinc-300 h-full max-h-48 md:max-h-full overflow-y-auto">
          <h4 className="font-semibold mb-2 text-zinc-100">Event Log</h4>
           {logs.length > 0 ? (
                <ul className="space-y-1">
                    {logs.map((log) => (
                        <li key={log.timestamp} className="text-xs text-amber-400 flex items-start gap-2">
                            <span className="font-mono text-zinc-500 flex-shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                            <span>{log.event}</span>
                        </li>
                    )).reverse()}
                </ul>
            ) : (
                <p className="text-xs text-zinc-400">No events detected yet.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default ProctoringView;
