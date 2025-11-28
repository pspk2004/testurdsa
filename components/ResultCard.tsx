import React from 'react';

interface ResultCardProps {
  title: string;
  value: string | number;
  description: string;
  isWarning?: boolean;
}

const ResultCard: React.FC<ResultCardProps> = ({ title, value, description, isWarning = false }) => {
  return (
    <div className={`p-6 rounded-lg ${isWarning ? 'bg-amber-900/50 border-amber-700' : 'bg-zinc-800/50 border-zinc-700'} border`}>
      <p className="text-sm text-zinc-300">{title}</p>
      <p className={`text-4xl font-bold my-1 ${isWarning ? 'text-amber-400' : 'text-white'}`}>{value}</p>
      <p className="text-sm text-zinc-400">{description}</p>
    </div>
  );
};

export default ResultCard;
