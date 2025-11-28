import React from 'react';

interface InputSectionProps {
  vaName: string;
  setVaName: (value: string) => void;
  areasOfFocus: string;
  setAreasOfFocus: (value: string) => void;
  market: string;
  setMarket: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({
  vaName,
  setVaName,
  areasOfFocus,
  setAreasOfFocus,
  market,
  setMarket,
  onGenerate,
  isLoading,
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 mb-8">
      <h2 className="text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-100">Customize Your Training Plan</h2>
      <div className="space-y-6">
        <div>
          <label htmlFor="vaName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            VA Name (Optional)
          </label>
          <input
            type="text"
            id="vaName"
            value={vaName}
            onChange={(e) => setVaName(e.target.value)}
            placeholder="e.g., Jane Doe"
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>
        <div>
          <label htmlFor="areasOfFocus" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Areas of Focus (Optional)
          </label>
          <textarea
            id="areasOfFocus"
            rows={3}
            value={areasOfFocus}
            onChange={(e) => setAreasOfFocus(e.target.value)}
            placeholder="e.g., Cold Calling, Property Management, Interview Prep & Scenarios"
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>
        <div>
          <label htmlFor="market" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            U.S. Market (Optional)
          </label>
          <input
            type="text"
            id="market"
            value={market}
            onChange={(e) => setMarket(e.target.value)}
            placeholder="e.g., California, Austin TX, etc."
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>
      </div>
      <div className="mt-8 text-center">
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="w-full md:w-auto inline-flex items-center justify-center px-8 py-3 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? 'Generating...' : 'Generate Training Roadmap'}
        </button>
      </div>
    </div>
  );
};