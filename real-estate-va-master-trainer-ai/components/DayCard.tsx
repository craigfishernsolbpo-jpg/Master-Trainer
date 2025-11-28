
import React from 'react';
import { LinkIconString } from './icons/LinkIcon';

interface DayCardProps {
  content: string;
}

// Helper to handle inline markdown (bold, links, line breaks)
const formatInline = (text: string): string => {
  // Bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Links
  text = text.replace(/(https?:\/\/[^\s<>()]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:underline break-all">$1</a>');
  // Newlines within a block (if any remain) -> br
  text = text.replace(/\n/g, '<br/>');
  return text;
};

const processContentToHtml = (content: string): string => {
  // 1. Split into distinct blocks based on double newlines.
  // This ensures we treat every paragraph/section as a discrete unit.
  const blocks = content.split(/\n\s*\n/).filter(b => b.trim());
  
  return blocks.map(block => {
      block = block.trim();

      // H2: DAY HEADERS
      if (/^\*\*DAY \d+ —/.test(block)) {
          const text = block.replace(/\*\*(.*?)\*\*/g, '$1');
          return `<h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-6 pb-4 border-b border-slate-200 dark:border-slate-700 break-after-avoid">${text}</h2>`;
      }
      
      // H3: SECTION HEADERS
      // Captures all the standard structural markers from the prompt
      if (/^\*\*(LESSON:|EXERCISE:|CLIENT COMMUNICATION DRILL:|PROMPT ENGINEERING:|MINI QUIZ \(5 QUESTIONS\):|HANDS-ON TASK:|LINKS & RESOURCES:|PROJECT:|MODULE \d+:|Welcome to U.S. Real Estate:)/.test(block)) {
          let innerHtml = block.replace(/\*\*(.*?)\*\*/g, '$1');
          // Icon for Links section
          if (innerHtml.includes("LINKS & RESOURCES")) {
             innerHtml = `<span class="flex items-center gap-2">${LinkIconString({className: "w-5 h-5"})} ${innerHtml}</span>`;
          }
          return `<h3 class="text-xl font-semibold text-slate-800 dark:text-slate-100 mt-8 mb-4 break-after-avoid">${innerHtml}</h3>`;
      }

      // ANSWER / SPECIAL BOXES
      // Detects the key headers that signify "Solution" content and wraps them in a styled box.
      const answerMatch = block.match(/^(\*\*(DETAILED LESSON REVIEW:|EXERCISE SOLUTION:|DRILL RESPONSE EXAMPLE:|MINI QUIZ ANSWERS:|TASK WALKTHROUGH:)\*\*)\s*([\s\S]*)$/);
      if (answerMatch) {
          const title = answerMatch[1].replace(/\*\*/g, '');
          let body = answerMatch[3].trim();
          
          if (!body) return ''; // Skip empty boxes

          // Recursive format for body content (it might look like a list or text)
          // For simplicity in the box, we just inline format it.
          // If the body contains a list format, we render it as such.
          let bodyHtml = '';
          if (body.startsWith('* ') || body.startsWith('- ') || /^\d+\./.test(body)) {
             const items = body.split('\n');
             const isOrdered = /^\d+\./.test(body);
             const tag = isOrdered ? 'ol' : 'ul';
             const listItems = items.map(item => {
                const cleanItem = item.replace(/^(\* |- |\d+\.\s*)/, '');
                return `<li class="mb-1">${formatInline(cleanItem)}</li>`;
             }).join('');
             bodyHtml = `<${tag} class="list-outside ml-6 ${isOrdered ? 'list-decimal' : 'list-disc'} space-y-1">${listItems}</${tag}>`;
          } else {
             bodyHtml = formatInline(body);
          }
          
          return `
            <div class="mt-4 p-4 rounded-lg bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 break-inside-avoid">
                <h4 class="font-semibold text-indigo-600 dark:text-indigo-400 mb-2">${title}</h4>
                <div class="text-slate-700 dark:text-slate-300 space-y-2 leading-relaxed">${bodyHtml}</div>
            </div>`;
      }

      // LISTS (Unordered or Ordered)
      if (block.startsWith('* ') || block.startsWith('- ') || /^\d+\./.test(block)) {
          const items = block.split('\n');
          const isOrdered = /^\d+\./.test(block);
          const tag = isOrdered ? 'ol' : 'ul';
          const listItems = items.map(item => {
              const cleanItem = item.replace(/^(\* |- |\d+\.\s*)/, '');
              return `<li class="mb-1 pl-1 marker:text-slate-500">${formatInline(cleanItem)}</li>`;
          }).join('');
          return `<${tag} class="list-outside ml-6 ${isOrdered ? 'list-decimal' : 'list-disc'} space-y-1 text-slate-700 dark:text-slate-300 leading-relaxed my-4">${listItems}</${tag}>`;
      }

      // DEFAULT PARAGRAPH
      // If it doesn't match any special structure, it's a paragraph.
      // We wrap it in <p> to ensure it's captured as an element.
      return `<p class="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed">${formatInline(block)}</p>`;
  }).join('');
};

export const DayCard: React.FC<DayCardProps> = ({ content }) => {
  const formattedContent = processContentToHtml(content);

  return (
    <div className="roadmap-card bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 md:p-8 animate-fade-in">
       <div 
        className="prose prose-slate dark:prose-invert max-w-none prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl"
        dangerouslySetInnerHTML={{ __html: formattedContent }} 
      />
    </div>
  );
};
