import React from 'react';
import { ComicPanel } from '../types';
import { Loader2, ArrowRight } from 'lucide-react';

interface ComicCardProps {
  comic: ComicPanel;
  onClick: (comic: ComicPanel) => void;
}

const ComicCard: React.FC<ComicCardProps> = ({ comic, onClick }) => {
  return (
    <div 
      onClick={() => !comic.isLoading && onClick(comic)}
      className={`bg-white border-4 border-black p-4 flex flex-col h-full transition-all duration-300 relative group
        ${comic.isLoading ? 'cursor-wait' : 'cursor-pointer hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'}
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3 border-b-2 border-black pb-2">
        <div>
           <span className="inline-block bg-black text-white px-2 py-0.5 text-xs font-bold uppercase tracking-widest mb-1">
            {comic.category}
          </span>
          <h3 className="text-2xl leading-none">{comic.title}</h3>
        </div>
        <span className="text-xs font-sans text-gray-500 font-bold">{comic.date}</span>
      </div>

      {/* Image Area */}
      <div className="aspect-square bg-gray-100 border-2 border-black mb-3 relative overflow-hidden">
        {comic.isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
             <Loader2 className="animate-spin mb-2" size={32} />
             <span className="font-comic text-sm">Sketching...</span>
          </div>
        ) : comic.imageUrl ? (
          <>
            <img 
              src={comic.imageUrl} 
              alt={comic.title} 
              className="w-full h-full object-cover transition-all duration-500"
            />
            {/* Hover overlay hint */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
               <span className="bg-yellow-400 border-2 border-black px-3 py-1 font-bold text-sm transform rotate-[-5deg] shadow-lg">
                 READ STORY
               </span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <span className="font-bold text-gray-400">Image Missing</span>
          </div>
        )}
      </div>

      {/* Article Snippet */}
      <div className="mt-auto bg-gray-50 p-3 border-2 border-black border-dashed relative">
        <p className="font-sans text-sm text-gray-800 leading-relaxed line-clamp-3">
          {comic.article}
        </p>
        <div className="mt-2 flex justify-end">
           <span className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:underline">
             Read Full Strip <ArrowRight size={12} />
           </span>
        </div>
      </div>
    </div>
  );
};

export default ComicCard;
