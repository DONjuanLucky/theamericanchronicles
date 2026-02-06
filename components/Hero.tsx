import React, { useState, useEffect, useRef } from 'react';
import { generateHeroImage } from '../services/geminiService';
import Button from './Button';
import { RefreshCw, Image as ImageIcon, Loader2 } from 'lucide-react';
import { loadFromCache, saveToCache, CACHE_KEY_HERO } from '../utils/storage';

interface HeroProps {
  apiKeyReady: boolean;
}

const Hero: React.FC<HeroProps> = ({ apiKeyReady }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoaded = useRef(false);

  const handleGenerate = async () => {
    if (!apiKeyReady) return;
    
    setLoading(true);
    setError(null);
    try {
      const url = await generateHeroImage();
      setImageUrl(url);
      if (url) {
        saveToCache(CACHE_KEY_HERO, url);
      }
      hasLoaded.current = true;
    } catch (err: any) {
      console.error(err);
      setError("Failed to generate cover art.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Attempt load from cache
    const cachedHero = loadFromCache<string>(CACHE_KEY_HERO);
    if (cachedHero) {
        setImageUrl(cachedHero);
        hasLoaded.current = true;
    } else if (apiKeyReady && !hasLoaded.current) {
        handleGenerate();
    }
  }, [apiKeyReady]);

  return (
    <section className="relative w-full min-h-[500px] bg-slate-900 overflow-hidden border-b-4 border-black group">
      {/* Background/Image Container */}
      <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Hero Comic Art" 
            className="w-full h-full object-cover animate-in fade-in duration-1000 scale-105 hover:scale-100 transition-transform duration-[20s]"
          />
        ) : (
          <div className="text-white text-opacity-20 flex flex-col items-center">
            {loading ? (
                <Loader2 size={64} className="mb-4 animate-spin text-yellow-400" />
            ) : (
                <ImageIcon size={64} className="mb-4 animate-bounce" />
            )}
            <p className="text-xl font-bold uppercase tracking-widest animate-pulse">
                {loading ? "Printing Cover..." : "Daily Cover"}
            </p>
          </div>
        )}
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full min-h-[500px] flex flex-col justify-center items-start text-white">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <span className="inline-block px-3 py-1 bg-yellow-400 text-black font-bold transform -rotate-2 comic-border comic-shadow text-sm md:text-base hover:rotate-0 transition-transform cursor-default">
                OFFICIAL ISSUE #{Math.floor(Math.random() * 100) + 400}
              </span>
              <span className="text-gray-400 font-mono text-sm uppercase tracking-widest">
                  {new Date().toLocaleDateString()}
              </span>
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl mb-6 font-bangers tracking-wide leading-none drop-shadow-[4px_4px_0_rgba(0,0,0,1)] text-white animate-slide-up" 
              style={{ textShadow: '4px 4px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000', animationDelay: '0.2s' }}>
            THE AMERICAN <span className="text-yellow-400 inline-block animate-float">CHRONICLE</span>
          </h1>
          
          <p className="text-xl md:text-3xl mb-10 font-comic text-gray-200 leading-relaxed max-w-2xl drop-shadow-md animate-slide-up" style={{ animationDelay: '0.3s' }}>
            "We report the news so you don't have to read it."
          </p>
          
          <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
            {apiKeyReady && !loading && (
               <button 
                  onClick={handleGenerate}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1 rounded border border-white/30 backdrop-blur-md flex items-center gap-2"
               >
                  <RefreshCw size={12} /> Redraw Cover
               </button>
            )}
          </div>
          
          {error && <p className="mt-4 text-red-400 bg-black/80 p-2 rounded text-sm animate-pulse">{error}</p>}
        </div>
      </div>
    </section>
  );
};

export default Hero;