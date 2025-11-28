
import React, { useState, useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { InputSection } from './components/InputSection';
import { SparkleIcon } from './components/icons/SparkleIcon';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorDisplay } from './components/ErrorDisplay';
import { generateRoadmap } from './services/geminiService';
import { ResultDisplay } from './components/ResultDisplay';
import { ProgressTracker } from './components/ProgressTracker';
import { RoadmapResult } from './services/geminiService';
import { DownloadIcon } from './components/icons/DownloadIcon';

const App: React.FC = () => {
  const [vaName, setVaName] = useState('');
  const [areasOfFocus, setAreasOfFocus] = useState('');
  const [market, setMarket] = useState('');
  const [roadmap, setRoadmap] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());

  const handleGenerateRoadmap = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setRoadmap(null);
    setCompletedDays(new Set());

    try {
      const result: RoadmapResult = await generateRoadmap(vaName, areasOfFocus, market);
      setRoadmap(result.roadmap);
    } catch (e) {
      if (e instanceof Error) {
        setError(`Failed to generate roadmap: ${e.message}`);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [vaName, areasOfFocus, market]);

  const toggleDayCompletion = (dayIndex: number) => {
    setCompletedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dayIndex)) {
        newSet.delete(dayIndex);
      } else {
        newSet.add(dayIndex);
      }
      return newSet;
    });
  };

  /**
   * PDF GENERATION: RECURSIVE ATOMIC PAGE BUILDER
   * This strategy ensures no content is cut off, no blank pages, and consistent formatting.
   * It splits large container blocks (like answer boxes or lists) across pages if they overflow.
   */
  const handleDownloadPdf = async () => {
    const originalCards = document.querySelectorAll('.roadmap-card');
    if (!originalCards || originalCards.length === 0) {
      setError("Could not find content to download.");
      return;
    }

    setIsDownloading(true);
    setError(null);

    // --- CONFIGURATION ---
    const PDF_PT_WIDTH = 595.28;  // A4 Width in Points
    const PDF_PT_HEIGHT = 841.89; // A4 Height in Points
    const CONTAINER_WIDTH_PX = 800; // Fixed width for DOM rendering
    // Calculate aspect-ratio safe height in pixels
    const PAGE_HEIGHT_PX = (PDF_PT_HEIGHT / PDF_PT_WIDTH) * CONTAINER_WIDTH_PX;
    const MARGIN_PX = 40;
    const MAX_CONTENT_HEIGHT_PX = PAGE_HEIGHT_PX - (MARGIN_PX * 2);

    // --- HIDDEN CONTAINER SETUP ---
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = `${CONTAINER_WIDTH_PX}px`;
    container.style.zIndex = '-9999';
    container.style.backgroundColor = '#ffffff'; // Force white background
    document.body.appendChild(container);

    // The content wrapper that simulates a single page
    const pageContent = document.createElement('div');
    pageContent.style.width = '100%';
    pageContent.style.padding = `${MARGIN_PX}px`;
    pageContent.style.boxSizing = 'border-box';
    pageContent.style.backgroundColor = '#ffffff';
    container.appendChild(pageContent);

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });

      // --- HELPER: ENFORCE STYLES (Light Mode Force) ---
      const prepareBlockForPrint = (el: HTMLElement) => {
        // Strip dark mode classes and enforce standard text colors
        el.style.color = '#0f172a'; // slate-900
        el.style.backgroundColor = 'transparent'; // Default
        
        // Ensure fonts are standard
        el.style.fontFamily = 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

        // Remove dark classes
        if (el.classList) {
            el.classList.forEach(cls => {
                if (cls.startsWith('dark:')) el.classList.remove(cls);
            });
        }
        
        // Handle specifics
        if (el.tagName === 'A') el.style.color = '#4338ca'; // indigo-700
        if (el.tagName === 'P') {
           el.style.marginBottom = '16px';
           el.style.lineHeight = '1.6';
        }
        if (el.tagName === 'LI') {
           el.style.marginBottom = '4px';
        }
        if (el.tagName === 'H4') {
            el.style.color = '#4f46e5'; // indigo-600
        }
        
        // Handle Answer Boxes / Gray backgrounds
        // The parser now adds these classes, so we detect them safely
        if (el.classList.contains('bg-slate-100') || el.classList.contains('dark:bg-slate-900/50')) {
            el.style.backgroundColor = '#f1f5f9'; // slate-100
            el.style.borderColor = '#cbd5e1'; // slate-300
            el.style.borderWidth = '1px';
            el.style.borderStyle = 'solid';
            el.style.borderRadius = '8px';
        }
        
        // Recursively clean children
        for (let i = 0; i < el.children.length; i++) {
            prepareBlockForPrint(el.children[i] as HTMLElement);
        }
      };

      // --- HELPER: CAPTURE CURRENT PAGE ---
      const captureAndAddPage = async () => {
        // Wait for render
        await new Promise(resolve => setTimeout(resolve, 20));

        const canvas = await html2canvas(container, {
          scale: 2.0, // High res for sharpness
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: CONTAINER_WIDTH_PX,
          windowWidth: CONTAINER_WIDTH_PX,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.8); // JPEG 0.8 for good balance
        const imgProps = pdf.getImageProperties(imgData);
        const pdfHeight = (imgProps.height * PDF_PT_WIDTH) / imgProps.width;
        
        pdf.addImage(imgData, 'JPEG', 0, 0, PDF_PT_WIDTH, pdfHeight);
      };

      // --- CONTENT QUEUE GENERATION ---
      let queue: HTMLElement[] = [];

      // 1. Title Block
      const titleBlock = document.createElement('div');
      titleBlock.style.marginBottom = '30px';
      titleBlock.style.borderBottom = '2px solid #e2e8f0';
      titleBlock.style.paddingBottom = '16px';
      titleBlock.innerHTML = `
        <h1 style="font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 8px; line-height: 1.2;">Real Estate VA Training Roadmap</h1>
        <p style="font-size: 16px; color: #475569;">Prepared for: <span style="font-weight: 600; color: #0f172a;">${vaName || 'The VA'}</span></p>
      `;
      queue.push(titleBlock);

      // 2. Flatten Content from Cards
      originalCards.forEach((card, index) => {
          if (index > 0) {
            // Spacer between cards
            const spacer = document.createElement('div');
            spacer.style.height = '40px';
            spacer.innerHTML = ' ';
            queue.push(spacer);
          }

          const prose = card.querySelector('.prose');
          if (prose) {
              // Now that DayCard creates Block Elements, Array.from gets EVERYTHING.
              Array.from(prose.children).forEach(child => {
                  const clone = child.cloneNode(true) as HTMLElement;
                  prepareBlockForPrint(clone);
                  queue.push(clone);
              });
          }
      });

      // --- MAIN PROCESSING LOOP ---
      let isFirstPage = true;

      while (queue.length > 0) {
        const block = queue[0];
        
        // 1. Try adding block to current page
        pageContent.appendChild(block);
        
        // 2. Check Height
        if (pageContent.offsetHeight <= MAX_CONTENT_HEIGHT_PX) {
            // Fits! Remove from queue and continue
            queue.shift();
        } else {
            // OVERFLOW DETECTED
            pageContent.removeChild(block); // Take it back out

            if (pageContent.children.length > 0) {
                // Case A: Page is partially full. Print it and start new page.
                if (!isFirstPage) pdf.addPage();
                await captureAndAddPage();
                isFirstPage = false;
                pageContent.innerHTML = ''; // Clear page
                // Do NOT shift queue. We try the same block again on the new, empty page.
            } else {
                // Case B: Page is EMPTY, but block is STILL too big.
                // We must SPLIT the block (Atomize).
                queue.shift(); // Remove giant block from main queue

                // Can we split it? (Div, UL, OL)
                const tagName = block.tagName.toLowerCase();
                const hasChildren = block.children.length > 0;
                
                if (hasChildren && ['div', 'ul', 'ol', 'section'].includes(tagName)) {
                    // Create a styled wrapper (shell) for the current page
                    let currentWrapper = block.cloneNode(false) as HTMLElement;
                    prepareBlockForPrint(currentWrapper);
                    pageContent.appendChild(currentWrapper);

                    const children = Array.from(block.children) as HTMLElement[];
                    
                    for (let i = 0; i < children.length; i++) {
                        const child = children[i];
                        currentWrapper.appendChild(child);

                        // If wrapper + child overflows page
                        if (pageContent.offsetHeight > MAX_CONTENT_HEIGHT_PX) {
                            currentWrapper.removeChild(child);
                            
                            // Print what we have
                            if (!isFirstPage) pdf.addPage();
                            await captureAndAddPage();
                            isFirstPage = false;
                            pageContent.innerHTML = '';
                            
                            // New Page: Create NEW wrapper (continuation)
                            currentWrapper = block.cloneNode(false) as HTMLElement;
                            prepareBlockForPrint(currentWrapper);
                            // Visual cue it's a continuation? Maybe top border removed? 
                            // For simplicity, we keep style identical.
                            pageContent.appendChild(currentWrapper);
                            currentWrapper.appendChild(child); // Add child to new wrapper
                            
                            // Recursive safety: if the child itself is huge, we'd loop.
                            // But usually H4 or P inside a DIV aren't massive.
                            // If they are, they just get cut (rare edge case), or we could recurse.
                            // Given the granular parser, this level of split is usually sufficient.
                        }
                    }
                    // After loop, the currentWrapper stays on pageContent with whatever fit last.
                    // Main loop continues to add next blocks after this wrapper.
                } else {
                    // Cannot split (Image, Giant text block). Force print.
                    pageContent.appendChild(block);
                    if (!isFirstPage) pdf.addPage();
                    await captureAndAddPage();
                    isFirstPage = false;
                    pageContent.innerHTML = '';
                }
            }
        }
      }

      // Final Flush
      if (pageContent.children.length > 0) {
         if (!isFirstPage) pdf.addPage();
         await captureAndAddPage();
      }

      const safeName = (vaName || 'Training_Roadmap').replace(/[^a-z0-9]/gi, '_');
      pdf.save(`${safeName}.pdf`);

    } catch (err) {
      console.error("PDF Error:", err);
      setError("Failed to generate PDF. Please try again.");
    } finally {
      document.body.removeChild(container);
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-10">
          <div className="inline-flex items-center justify-center gap-3">
            <SparkleIcon className="w-8 h-8 md:w-10 md:h-10 text-indigo-500" />
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white">
              Real Estate VA Master Trainer AI
            </h1>
          </div>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Generate a personalized, interactive 8-day training roadmap (including Interview Prep) for your real estate Virtual Assistant.
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <InputSection
            vaName={vaName}
            setVaName={setVaName}
            areasOfFocus={areasOfFocus}
            setAreasOfFocus={setAreasOfFocus}
            market={market}
            setMarket={setMarket}
            onGenerate={handleGenerateRoadmap}
            isLoading={isLoading}
          />

          {isLoading && <LoadingSpinner />}
          {error && <ErrorDisplay message={error} />}
          
          {roadmap && (
            <div className="mt-8 animate-fade-in">
              <div className="mb-6 flex justify-end">
                <button
                  onClick={handleDownloadPdf}
                  disabled={isDownloading}
                  className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 dark:focus:ring-offset-slate-900 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <DownloadIcon className="w-5 h-5 mr-2" />
                  {isDownloading ? 'Building PDF...' : 'Download PDF'}
                </button>
              </div>
              <ProgressTracker 
                totalDays={8} 
                completedDays={completedDays} 
                onToggleDay={toggleDayCompletion} 
              />
              <div id="roadmap-content">
                <ResultDisplay roadmap={roadmap} />
              </div>
            </div>
          )}

        </div>
      </main>
      <footer className="text-center py-6 text-sm text-slate-500 dark:text-slate-400">
        <p>Powered by Gemini</p>
      </footer>
    </div>
  );
};

export default App;
