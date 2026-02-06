import React, { useEffect, useState } from 'react';
import { ComicPanel, StripPanel } from '../types';
import { generateStripScript, generateComicPanelImage } from '../services/geminiService';
import Button from './Button';
import { ArrowLeft, Loader2, Share2, Printer, ExternalLink, FileText, Globe } from 'lucide-react';

interface ComicDetailPageProps {
  comic: ComicPanel;
  onBack: () => void;
  onUpdateComic: (updatedComic: ComicPanel) => void;
}

const ComicDetailPage: React.FC<ComicDetailPageProps> = ({ comic, onBack, onUpdateComic }) => {
  const [loadingStrip, setLoadingStrip] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we haven't generated the strip yet, do it now
    if (!comic.strip && !loadingStrip) {
      loadStrip();
    }
  }, [comic.id]);

  const loadStrip = async () => {
    setLoadingStrip(true);
    setError(null);

    try {
      // 1. Generate the script for the panels
      const panelsData = await generateStripScript(comic.title, comic.article);
      
      // Initialize strip state with placeholders
      const initialStrip: StripPanel[] = panelsData.map((p, index) => ({
        id: `${comic.id}-panel-${index}`,
        caption: p.caption,
        imagePrompt: p.imagePrompt,
        isLoading: true
      }));

      // Update parent state immediately to show placeholders
      onUpdateComic({ ...comic, strip: initialStrip });

      // 2. Generate images in parallel
      const imagePromises = initialStrip.map(async (panel) => {
        const url = await generateComicPanelImage(panel.imagePrompt);
        return { id: panel.id, url };
      });

      const results = await Promise.all(imagePromises);

      // Update with final images
      const finalStrip = initialStrip.map(panel => {
        const res = results.find(r => r.id === panel.id);
        return {
          ...panel,
          imageUrl: res?.url || undefined,
          isLoading: false
        };
      });

      onUpdateComic({ ...comic, strip: finalStrip });

    } catch (err) {
      console.error("Failed to load strip:", err);
      setError("The printing press jammed while making the full strip.");
    } finally {
      setLoadingStrip(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Nav Actions */}
      <div className="mb-6 flex justify-between items-center">
        <Button onClick={onBack} variant="secondary" className="flex items-center gap-2 text-sm">
          <ArrowLeft size={16} /> Back to Front Page
        </Button>
        <div className="flex gap-2">
            <button className="p-2 border-2 border-black bg-white hover:bg-gray-100 rounded" title="Share">
                <Share2 size={20} />
            </button>
            <button className="p-2 border-2 border-black bg-white hover:bg-gray-100 rounded" title="Print">
                <Printer size={20} />
            </button>
        </div>
      </div>

      {/* Article Header */}
      <div className="bg-white border-4 border-black p-6 md:p-10 mb-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Main Cover Image */}
            <div className="w-full md:w-1/3 aspect-square border-4 border-black bg-gray-100 relative shadow-md">
                {comic.imageUrl && (
                    <img src={comic.imageUrl} alt={comic.title} className="w-full h-full object-cover" />
                )}
            </div>
            
            {/* Text Content */}
            <div className="flex-1">
                <span className="inline-block bg-yellow-400 border-2 border-black px-3 py-1 font-bold text-sm mb-4 transform -rotate-1">
                    {comic.category}
                </span>
                <h1 className="text-4xl md:text-6xl font-bangers mb-6 leading-none">{comic.title}</h1>
                <div className="prose prose-lg font-comic text-gray-800 border-l-4 border-gray-300 pl-4 mb-6">
                    <p>{comic.article}</p>
                    <p className="text-sm text-gray-500 mt-4 italic">
                        Reporting from the Daily Panel HQ • {comic.date}
                    </p>
                </div>

                {/* Resources Section */}
                {comic.resources && comic.resources.length > 0 && (
                  <div className="bg-slate-100 border-2 border-black p-4 mt-8 relative">
                    <div className="absolute -top-3 left-4 bg-black text-white px-2 py-0.5 text-xs font-bold uppercase tracking-widest">
                       Related Intelligence
                    </div>
                    <div className="grid grid-cols-1 gap-3 mt-2">
                      {comic.resources.map((resource, idx) => (
                        <a 
                          key={idx} 
                          href={resource.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-start gap-3 p-3 bg-white border-2 border-gray-300 hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all group"
                        >
                           <div className="mt-1">
                              <Globe size={18} className="text-gray-400 group-hover:text-black" />
                           </div>
                           <div>
                              <h4 className="font-bold font-sans text-sm flex items-center gap-2">
                                {resource.name} 
                                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                              </h4>
                              <p className="text-xs text-gray-600 font-comic mt-1 leading-snug">
                                {resource.description}
                              </p>
                           </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
            </div>
        </div>
      </div>

      {/* The Strip */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bangers text-center mb-8 bg-black text-white inline-block px-6 py-2 transform -skew-x-12 mx-auto block w-fit">
            THE FULL STORY
        </h2>

        {error && (
             <div className="text-center p-8 bg-red-100 border-2 border-red-500 rounded text-red-700 mb-8">
                 {error}
                 <br/>
                 <button onClick={loadStrip} className="underline font-bold mt-2">Try Reprinting</button>
             </div>
        )}

        <div className="space-y-8">
            {comic.strip?.map((panel, index) => (
                <div key={panel.id} className="flex flex-col md:flex-row gap-4 items-center md:items-stretch bg-white border-4 border-black p-4 shadow-md">
                    <div className="w-12 h-12 flex-shrink-0 bg-black text-white font-bangers text-2xl flex items-center justify-center rounded-full border-2 border-white shadow-lg z-10 md:-ml-10">
                        {index + 1}
                    </div>
                    
                    <div className="w-full md:w-1/2 aspect-square border-2 border-black bg-gray-100 relative overflow-hidden">
                        {panel.isLoading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                <Loader2 className="animate-spin mb-2" size={32} />
                                <span className="font-comic">Drawing Panel...</span>
                            </div>
                        ) : panel.imageUrl ? (
                            <img src={panel.imageUrl} alt={`Panel ${index + 1}`} className="w-full h-full object-cover" />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">Missing Image</div>
                        )}
                    </div>

                    <div className="flex-1 flex items-center bg-yellow-50 border-2 border-black border-dashed p-6">
                        <p className="font-comic text-xl text-center w-full">
                            "{panel.caption}"
                        </p>
                    </div>
                </div>
            ))}

            {(!comic.strip && loadingStrip) && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Loader2 size={48} className="animate-spin mb-4 text-black" />
                    <p className="font-bangers text-2xl text-black">Developing Story...</p>
                </div>
            )}
        </div>
        
        {/* Bottom Nav */}
        <div className="mt-12 text-center">
             <Button onClick={onBack} size="lg">Read Another Story</Button>
        </div>
      </div>
    </div>
  );
};

export default ComicDetailPage;