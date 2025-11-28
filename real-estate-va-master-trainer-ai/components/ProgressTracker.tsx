
import React from 'react';

interface ProgressTrackerProps {
  totalDays: number;
  completedDays: Set<number>;
  onToggleDay: (dayIndex: number) => void;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ totalDays, completedDays, onToggleDay }) => {
  const progressPercentage = (completedDays.size / totalDays) * 100;
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 mb-8">
      <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Training Progress</h2>
      
      <div className="flex items-center gap-4 mb-4">
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4">
          <div
            className="bg-indigo-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <span className="font-semibold text-slate-700 dark:text-slate-300">{Math.round(progressPercentage)}%</span>
      </div>

      <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
        {daysArray.map(day => (
          <label key={day} className="flex flex-col items-center justify-center p-2 rounded-md border-2 border-slate-200 dark:border-slate-700 cursor-pointer has-[:checked]:bg-indigo-100 has-[:checked]:border-indigo-500 dark:has-[:checked]:bg-indigo-900/50 dark:has-[:checked]:border-indigo-600 transition-colors">
            <span className="text-xs text-slate-500 dark:text-slate-400">Day</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{day}</span>
            <input
              type="checkbox"
              checked={completedDays.has(day - 1)}
              onChange={() => onToggleDay(day - 1)}
              className="mt-2 w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
            />
          </label>
        ))}
      </div>
    </div>
  );
};
