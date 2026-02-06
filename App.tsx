import React, { useState, useEffect, useRef } from 'react';
import Hero from './components/Hero';
import ComicCard from './components/ComicCard';
import ComicDetailPage from './components/ComicDetailPage';
import ChatBot from './components/ChatBot';
import Newsletter from './components/Newsletter';
import Button from './components/Button';
import { Category, ComicPanel } from './types';
import { INITIAL_CATEGORIES } from './constants';
import { generateComicScript, generateComicPanelImage } from './services/geminiService';
import { Sparkles, Newspaper, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [comics, setComics] = useState<ComicPanel[]>([]);
  const [selectedComicId, setSelectedComicId] = useState<string | null>(null);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [apiKeyReady, setApiKeyReady] = useState(false);
  const hasInitialized = useRef(false);

  // Initialize API Key state and auto-generate
  useEffect(() => {
    const init = async () => {
      let ready = false;
      
      // Check environment variable first
      if (process.env.API_KEY) {
        ready = true;
      } 
      // Fallback to AI Studio check
      else if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
        ready = true;
      }

      setApiKeyReady(ready);

      if (ready && !hasInitialized.current) {
        hasInitialized.current = true;
        handleGenerateWeeklyIssue();
      }
    };
    init();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      if (await window.aistudio.hasSelectedApiKey()) {
        setApiKeyReady(true);
        // If we just selected a key and haven't generated yet, do it now
        if (!hasInitialized.current) {
          hasInitialized.current = true;
          handleGenerateWeeklyIssue();
        }
      }
    }
  };

  // Helper to create a unique ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const generateSingleComic = async (category: Category) => {
    const newId = generateId();
    
    // Placeholder structure
    const placeholderComic: ComicPanel = {
      id: newId,
      title: "Breaking News...",
      category: category,
      article: "Our robots are currently scouring the globe for this story...",
      imagePrompt: "", 
      date: new Date().toLocaleDateString(),
      isLoading: true
    };
    
    setComics(prev => [...prev, placeholderComic]);

    try {
      const script = await generateComicScript(category);
      
      setComics(prev => prev.map(c => c.id === newId ? { 
        ...c, 
        title: script.title, 
        article: script.article,
        imagePrompt: script.imagePrompt,
        resources: script.resources
      } : c));

      const imageUrl = await generateComicPanelImage(script.imagePrompt);

      setComics(prev => prev.map(c => c.id === newId ? { 
        ...c, 
        imageUrl: imageUrl || undefined, 
        isLoading: false 
      } : c));

    } catch (error: any) {
      console.error("Failed to generate comic", error);
      setComics(prev => prev.map(c => c.id === newId ? { 
        ...c, 
        title: "Printing Error", 
        article: "The press jammed. Please try refreshing.", 
        isLoading: false 
      } : c));
    }
  };

  const handleGenerateWeeklyIssue = async () => {
    setIsGeneratingAll(true);
    setComics([]); // Clear old issue to show fresh "loading" state for new issue
    setSelectedComicId(null); // Reset view
    
    // Generate one for each category
    const promises = INITIAL_CATEGORIES.map(cat => generateSingleComic(cat as Category));
    
    await Promise.allSettled(promises);
    setIsGeneratingAll(false);
  };

  const updateComicInState = (updatedComic: ComicPanel) => {
    setComics(prev => prev.map(c => c.id === updatedComic.id ? updatedComic : c));
  };

  const selectedComic = comics.find(c => c.id === selectedComicId);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      
      {/* Navbar */}
      <nav className="bg-yellow-400 border-b-4 border-black sticky top-0 z-40 shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={() => setSelectedComicId(null)}
          >
            <Newspaper size={28} className="text-black group-hover:rotate-12 transition-transform" />
            <span className="text-2xl font-bold tracking-tighter">THE AMERICAN CHRONICLE</span>
          </div>
          <div className="flex gap-4">
             {!apiKeyReady && (
               <Button onClick={handleSelectKey} variant="danger" className="text-xs sm:text-sm">
                 Sign In / Set Key
               </Button>
             )}
             {apiKeyReady && !selectedComicId && (
               <button 
                onClick={handleGenerateWeeklyIssue}
                disabled={isGeneratingAll}
                className="p-2 hover:bg-yellow-500 rounded-full transition-colors hover:rotate-180 duration-500"
                title="Refresh Issue"
               >
                 <RefreshCw size={24} className={isGeneratingAll ? "animate-spin" : ""} />
               </button>
             )}
          </div>
        </div>
      </nav>

      {/* Main View Switcher */}
      {selectedComic ? (
         <main className="flex-1 container mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <ComicDetailPage 
              comic={selectedComic} 
              onBack={() => setSelectedComicId(null)}
              onUpdateComic={updateComicInState}
           />
         </main>
      ) : (
        <>
          {/* Hero Section */}
          <Hero apiKeyReady={apiKeyReady} />

          {/* Grid Content */}
          <main className="flex-1 container mx-auto px-4 py-12">
            
            {/* Section Header */}
            <div className="flex items-end justify-between mb-8 border-b-4 border-black pb-4">
              <div>
                <h2 className="text-5xl font-bold font-bangers tracking-wide animate-slide-up">TODAY'S HEADLINES</h2>
                <p className="text-gray-600 font-comic mt-2 text-lg animate-slide-up" style={{ animationDelay: '0.1s' }}>
                  {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="hidden md:block text-right">
                <p className="font-bold text-sm uppercase">Volume 42</p>
                <p className="text-xs text-gray-500">Price: Free (Ad-Supported by Robots)</p>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
              {!apiKeyReady && comics.length === 0 ? (
                <div className="col-span-full py-20 text-center border-4 border-dashed border-gray-300 rounded-lg bg-white/50">
                  <Sparkles size={48} className="mx-auto text-gray-400 mb-4 animate-pulse" />
                  <p className="text-2xl text-gray-500 font-bold mb-4">Newsroom Closed.</p>
                  <p className="text-gray-400 mb-6">We need an API Key to run the printing press.</p>
                  <Button onClick={handleSelectKey} className="animate-bounce">Open Newsroom</Button>
                </div>
              ) : (
                <>
                  {comics.map((comic, idx) => (
                    <div key={comic.id} className="h-full animate-slide-up" style={{ animationDelay: `${0.1 * idx}s` }}>
                      <ComicCard 
                        comic={comic} 
                        onClick={(c) => setSelectedComicId(c.id)}
                      />
                    </div>
                  ))}
                  
                  {isGeneratingAll && comics.length === 0 && (
                    INITIAL_CATEGORIES.map((cat, idx) => (
                      <div key={idx} className="h-[500px] bg-gray-200 animate-pulse border-4 border-gray-300"></div>
                    ))
                  )}
                </>
              )}
            </div>
          </main>
        </>
      )}

      {/* Newsletter Section */}
      <Newsletter />

      {/* Footer */}
      <footer className="bg-black text-white py-12 border-t-8 border-yellow-400">
        <div className="container mx-auto px-4 flex flex-col items-center">
          <h3 className="font-bangers text-4xl mb-4 text-yellow-400 tracking-wider">THE AMERICAN CHRONICLE</h3>
          <p className="text-gray-600 text-xs text-center">
            © {new Date().getFullYear()} AI Satire Corp. All rights reserved. <br/>
            No humans were harmed in the making of these comics.
          </p>
        </div>
      </footer>

      <ChatBot apiKeyReady={apiKeyReady} />
    </div>
  );
};

export default App;