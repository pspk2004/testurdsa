import React, { useState, useEffect } from 'react';
import { ClockIcon } from './icons/Icons';

interface TimerProps {
  totalSeconds: number;
  onTimeUp: () => void;
}

const Timer: React.FC<TimerProps> = ({ totalSeconds, onTimeUp }) => {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onTimeUp();
      return;
    }

    const intervalId = setInterval(() => {
      setSecondsLeft(secondsLeft - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [secondsLeft, onTimeUp]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  
  const isLowTime = secondsLeft <= 300; // 5 minutes

  return (
    <div className={`flex items-center gap-2 font-mono font-bold text-lg p-2 rounded-md ${isLowTime ? 'text-red-400 bg-red-900/50' : 'text-zinc-300 bg-zinc-700/50'}`}>
      <ClockIcon className="w-5 h-5" />
      <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
    </div>
  );
};

export default Timer;
