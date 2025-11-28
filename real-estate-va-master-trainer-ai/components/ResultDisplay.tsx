
import React from 'react';
import { DayCard } from './DayCard';

interface ResultDisplayProps {
  roadmap: string;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ roadmap }) => {
  // Split the roadmap into days. The regex looks for "DAY " followed by digits and "—" at the beginning of a line.
  // The `(?=...)` is a positive lookahead to split without consuming the delimiter.
  const days = roadmap.split(/(?=^DAY \d+ —)/m).filter(day => day.trim() !== '');

  return (
    <div className="space-y-8">
      {days.map((dayContent, index) => (
        <DayCard key={index} content={dayContent} />
      ))}
    </div>
  );
};
