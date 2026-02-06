import React, { useState } from 'react';
import Button from './Button';
import { Mail, ShieldCheck, BookOpen, ExternalLink, FileText } from 'lucide-react';

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        
        {/* Header Strip */}
        <div className="bg-black text-white p-4 border-b-4 border-black flex justify-between items-center flex-wrap gap-4">
            <h2 className="text-3xl md:text-5xl font-bangers tracking-wider text-yellow-400">
                OFFICIAL SUBSCRIPTION DEPT.
            </h2>
            <div className="flex items-center gap-2 font-mono text-xs md:text-sm uppercase tracking-widest text-gray-400">
                <span>Est. 2024</span>
                <span>•</span>
                <span>Truth First, Jokes Second</span>
            </div>
        </div>

        <div className="flex flex-col lg:flex-row">
            
            {/* Left Column: The Pitch */}
            <div className="lg:w-1/2 p-8 md:p-12 border-b-4 lg:border-b-0 lg:border-r-4 border-black bg-yellow-400 relative">
                 <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Mail size={200} />
                 </div>
                 
                 <div className="relative z-10">
                    <h3 className="font-bangers text-4xl mb-6 leading-none">
                        GET THE WEEKLY BRIEFING
                    </h3>
                    <p className="font-comic text-lg font-bold mb-6 leading-relaxed">
                        We digest the week's chaos so you don't get an ulcer. One email, every Sunday. 
                        No spam, no tracking pixels, just raw news converted into ink.
                    </p>

                    <ul className="space-y-4 mb-8 font-sans font-bold text-sm">
                        <li className="flex items-center gap-3">
                            <div className="bg-black text-white p-1"><ShieldCheck size={16} /></div>
                            <span>Fact-checked sources (we don't make up the news, just the punchlines).</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="bg-black text-white p-1"><FileText size={16} /></div>
                            <span>Deep dive analysis on the one story that actually mattered.</span>
                        </li>
                         <li className="flex items-center gap-3">
                            <div className="bg-black text-white p-1"><BookOpen size={16} /></div>
                            <span>Exclusive panels not published on the site.</span>
                        </li>
                    </ul>

                    {!subscribed ? (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="relative">
                                <label className="block text-xs font-bold uppercase mb-1 bg-black text-white inline-block px-2">Email Address</label>
                                <input 
                                    type="email" 
                                    required
                                    placeholder="CITIZEN@EXAMPLE.COM" 
                                    className="w-full p-4 text-lg font-comic border-4 border-black bg-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none transition-all placeholder-gray-400"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="w-full text-xl py-4">
                                SIGN ME UP
                            </Button>
                            <p className="text-xs font-mono text-center opacity-60 mt-2">
                                By clicking this, you agree that reality is absurd.
                            </p>
                        </form>
                    ) : (
                         <div className="bg-white border-4 border-black p-6 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in">
                            <h4 className="font-bangers text-3xl mb-2">WELCOME TO THE FOLD.</h4>
                            <p className="font-comic">Your briefing will arrive at dawn on Sunday.</p>
                            <button onClick={() => setSubscribed(false)} className="text-xs underline mt-4 text-gray-500">Reset</button>
                        </div>
                    )}
                 </div>
            </div>

            {/* Right Column: Editorial Standards & Resources */}
            <div className="lg:w-1/2 p-8 md:p-12 bg-gray-50 flex flex-col justify-between">
                <div>
                    <h3 className="font-bangers text-3xl mb-6 border-b-4 border-black inline-block">
                        EDITORIAL STANDARDS
                    </h3>
                    <div className="prose font-comic text-gray-800 mb-8">
                        <p className="mb-4">
                            <strong>1. THE TRUTH IS MANDATORY.</strong> We are a comic strip, not a fiction factory. Every panel is derived from verified reports. We verify before we ink.
                        </p>
                        <p className="mb-4">
                            <strong>2. NO SACRED COWS.</strong> If a politician trips, we draw it. If a CEO tweets something stupid, we frame it. Neutrality means everyone gets roasted equally.
                        </p>
                        <p>
                            <strong>3. CLARITY OVER CLICKBAIT.</strong> We summarize the event first. The joke comes second. You should leave smarter, not just amused.
                        </p>
                    </div>
                </div>

                <div>
                    <h3 className="font-bangers text-2xl mb-4 text-gray-400">
                        RAW INTELLIGENCE RESOURCES
                    </h3>
                    <p className="text-xs font-sans text-gray-500 mb-4">
                        We cross-reference our comics against these primary wires. Verify our work:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { name: "Associated Press", url: "https://apnews.com" },
                            { name: "Reuters Wire", url: "https://www.reuters.com" },
                            { name: "BBC World", url: "https://www.bbc.com/news" },
                            { name: "C-SPAN", url: "https://www.c-span.org" }
                        ].map((resource) => (
                            <a 
                                key={resource.name}
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-3 border-2 border-gray-300 hover:border-black hover:bg-white transition-all group"
                            >
                                <span className="font-bold font-sans text-sm">{resource.name}</span>
                                <ExternalLink size={14} className="text-gray-400 group-hover:text-black" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>

        </div>
      </div>
    </section>
  );
};

export default Newsletter;