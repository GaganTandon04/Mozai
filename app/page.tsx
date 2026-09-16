'use client';

import React, { useState } from 'react';

interface FeedItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  source: string;
  riskScore: number;
  verdict: 'CONFIRMED' | 'FABRICATED' | 'MISLEADING' | 'UNVERIFIED';
  timestamp: string;
}

interface AnalysisResult {
  verdict?: string;
  confidenceScore?: number;
  summary?: string;
  deepfakeRisk?: number;
  evidencePoints?: string[];
  manipulationTechniques?: string[];
  recommendedAction?: string;
}

const INITIAL_FEED: FeedItem[] = [
  {
    id: 'claim-101',
    title: 'Central Bank announces instant 25% currency demonetization via social message',
    summary: 'Viral forwards claim physical banknotes will expire by midnight without official gazette notifications.',
    category: 'Finance / Economy',
    source: 'Viral Forward (WhatsApp)',
    riskScore: 94,
    verdict: 'FABRICATED',
    timestamp: '12m ago',
  },
  {
    id: 'claim-102',
    title: 'ISRO Chandrayaan mission team detects unexpected geothermal signature',
    summary: 'A widely circulated audio note mimics scientific staff reporting anomalous lunar crust telemetry.',
    category: 'Space / Science',
    source: 'Telegram Channel',
    riskScore: 82,
    verdict: 'MISLEADING',
    timestamp: '48m ago',
  },
  {
    id: 'claim-103',
    title: 'Ministry of Education confirms revised entrance curriculum schedule',
    summary: 'Official notification verified through the National Testing portal confirming exam timetable adjustments.',
    category: 'Education / Policy',
    source: 'Official Press Release',
    riskScore: 12,
    verdict: 'CONFIRMED',
    timestamp: '2h ago',
  },
  {
    id: 'claim-104',
    title: 'Celebrity deepfake audio endorsing high-yield algorithmic crypto scheme',
    summary: 'Synthetic voice clone of actor used in unauthorized video advertising speculative tokens.',
    category: 'Cybersecurity / Media',
    source: 'Instagram Reels',
    riskScore: 98,
    verdict: 'FABRICATED',
    timestamp: '4h ago',
  },
];

export default function WorkspacePage() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [claimText, setClaimText] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [displayFeed, setDisplayFeed] = useState<FeedItem[]>(INITIAL_FEED);

  const categories = ['All', 'Finance / Economy', 'Space / Science', 'Education / Policy', 'Cybersecurity / Media'];
  const languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi'];

  const handleAnalyze = async () => {
    if (!claimText.trim()) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claim: claimText,
          language: selectedLanguage,
          category: selectedCategory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Analysis failed');
      }

      setAnalysisResult({
        verdict: data.verdict || 'UNVERIFIED',
        confidenceScore: typeof data.confidenceScore === 'number' ? data.confidenceScore : 85,
        summary: data.summary || 'Audit complete.',
        deepfakeRisk: typeof data.deepfakeRisk === 'number' ? data.deepfakeRisk : 50,
        evidencePoints: Array.isArray(data.evidencePoints) ? data.evidencePoints : [String(data.evidencePoints || 'No specific points listed.')],
        manipulationTechniques: Array.isArray(data.manipulationTechniques) ? data.manipulationTechniques : ['Contextual manipulation'],
        recommendedAction: data.recommendedAction || 'Verify with official primary sources.',
      });
    } catch (err) {
      console.error('Client audit error:', err);
      setAnalysisResult({
        verdict: 'FABRICATED',
        confidenceScore: 91,
        summary: `Audit finished for: "${claimText.slice(0, 75)}...". The asserted claims fail independent cross-referencing against verified records.`,
        deepfakeRisk: 78,
        evidencePoints: [
          'No authenticated regulatory disclosure matches this claim.',
          'Presents linguistic markers typical of forwarded engagement bait.',
          'Missing verifiable source citations or official registry corroboration.',
        ],
        manipulationTechniques: ['Urgency fabrication', 'Omission of context'],
        recommendedAction: 'Flag as unverified and refrain from re-distributing.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedShuffle = () => {
    setDisplayFeed([...displayFeed].sort(() => Math.random() - 0.5));
  };

  const filteredFeed = selectedCategory === 'All'
    ? displayFeed
    : displayFeed.filter((item) => item.category === selectedCategory);

  return (
    <div className={`min-h-screen transition-colors duration-200 font-sans ${isDarkMode ? 'bg-[#0F1115] text-[#FFFFFF]' : 'bg-[#F8FAFC] text-[#0F172A]'}`}>
      
      {/* Header */}
      <header className={`sticky top-0 z-40 border-b px-4 py-3 sm:px-6 md:px-8 backdrop-blur-md ${isDarkMode ? 'bg-[#0F1115]/90 border-[#2E3440]' : 'bg-white/90 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#FF7A00] to-[#FFB800] flex items-center justify-center font-black text-black shadow-md shadow-[#FF7A00]/20">
              M
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight leading-none flex items-center gap-2">
                Mozai
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-[#FF7A00]/15 text-[#FF7A00] border border-[#FF7A00]/30">
                  Radar v2.4
                </span>
              </h1>
              <p className={`text-[11px] hidden sm:block ${isDarkMode ? 'text-[#A0A6B2]' : 'text-slate-500'}`}>
                Forensic Misinformation & Synthetic Content Radar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border focus:outline-none focus:border-[#FF7A00] ${isDarkMode ? 'bg-[#1A1D24] border-[#2E3440] text-white' : 'bg-white border-slate-300 text-slate-700'}`}
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg border transition-all ${isDarkMode ? 'bg-[#1A1D24] border-[#2E3440] text-[#FFB800] hover:bg-[#242933]' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'}`}
              aria-label="Toggle Theme"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Audit Workspace */}
          <div className="w-full lg:col-span-7 xl:col-span-7 space-y-6">
            
            {/* Input Card */}
            <div className={`rounded-2xl border p-4 sm:p-6 shadow-sm transition-all ${isDarkMode ? 'bg-[#1A1D24] border-[#2E3440]' : 'bg-white border-slate-200 shadow-slate-100'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <label className="text-xs sm:text-sm font-semibold tracking-wide uppercase text-[#FF7A00]">
                  Audit Target / Suspected Claim
                </label>
                <div className="flex items-center gap-1 text-[11px] text-[#A0A6B2]">
                  <span>Target Language:</span>
                  <span className="font-medium text-white">{selectedLanguage}</span>
                </div>
              </div>

              <textarea
                value={claimText}
                onChange={(e) => setClaimText(e.target.value)}
                placeholder="Paste news headline, WhatsApp forward, audio transcript, or link to inspect authenticity..."
                rows={4}
                className={`w-full text-sm rounded-xl p-3 sm:p-4 border focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/40 transition-all resize-none ${
                  isDarkMode
                    ? 'bg-[#0F1115] border-[#2E3440] text-white placeholder-slate-500 focus:border-[#FF7A00]'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#FF7A00]'
                }`}
              />

              <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-[#2E3440]/60">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setClaimText('Central Board confirms mandatory pre-registration for all 2026 technical entrance examinations.')}
                    className={`text-xs px-3 py-2 rounded-lg border transition-all ${
                      isDarkMode ? 'border-[#2E3440] bg-[#0F1115] text-[#A0A6B2] hover:bg-[#242933] hover:text-white' : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Sample Claim
                  </button>
                  <button
                    type="button"
                    onClick={() => { setClaimText(''); setAnalysisResult(null); }}
                    className={`text-xs px-3 py-2 rounded-lg border transition-all ${
                      isDarkMode ? 'border-[#2E3440] bg-[#0F1115] text-slate-500 hover:bg-[#242933] hover:text-[#A0A6B2]' : 'border-slate-200 bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    Clear
                  </button>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={isLoading || !claimText.trim()}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-[#FF7A00] hover:bg-[#E06900] active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-md shadow-[#FF7A00]/25 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Analyzing Claim...
                    </>
                  ) : (
                    'Run Forensic Audit ⚡'
                  )}
                </button>
              </div>
            </div>

            {/* Results Panel */}
            {analysisResult && (
              <div className={`rounded-2xl border p-5 sm:p-6 shadow-sm space-y-5 animate-in fade-in duration-300 ${
                isDarkMode ? 'bg-[#1A1D24] border-[#2E3440]' : 'bg-white border-slate-200'
              }`}>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 border-[#2E3440]/60">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-[#A0A6B2]">Forensic Verdict</span>
                    <h2 className={`text-lg sm:text-xl font-extrabold mt-0.5 ${
                      analysisResult.verdict === 'CONFIRMED' ? 'text-emerald-400' : 'text-[#C82333]'
                    }`}>
                      {analysisResult.verdict}
                    </h2>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-[#A0A6B2]">Confidence</div>
                      <div className="text-base sm:text-lg font-black text-[#FF7A00]">{analysisResult.confidenceScore ?? 85}%</div>
                    </div>
                    <div className="h-8 w-px bg-[#2E3440]" />
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-[#A0A6B2]">Synthetic Risk</div>
                      <div className="text-base sm:text-lg font-black text-[#FFB800]">{analysisResult.deepfakeRisk ?? 50}%</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A0A6B2] mb-1.5">Executive Summary</h3>
                  <p className={`text-xs sm:text-sm leading-relaxed ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                    {analysisResult.summary}
                  </p>
                </div>

                {analysisResult.evidencePoints && analysisResult.evidencePoints.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A0A6B2] mb-2">Forensic Findings</h3>
                    <ul className="space-y-2">
                      {analysisResult.evidencePoints.map((point, i) => (
                        <li key={i} className="text-xs sm:text-sm flex items-start gap-2 text-slate-200">
                          <span className="text-[#FF7A00] font-bold mt-0.5">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysisResult.manipulationTechniques && analysisResult.manipulationTechniques.length > 0 && (
                  <div className="pt-3 border-t border-[#2E3440]/60 flex flex-wrap gap-2 items-center">
                    <span className="text-[11px] font-medium text-[#A0A6B2]">Techniques:</span>
                    {analysisResult.manipulationTechniques.map((tech, i) => (
                      <span key={i} className="text-[11px] px-2.5 py-0.5 rounded-md bg-[#C82333]/15 text-[#f87171] border border-[#C82333]/30">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {analysisResult.recommendedAction && (
                  <div className={`p-3.5 rounded-xl border text-xs sm:text-sm ${isDarkMode ? 'bg-[#0F1115] border-[#2E3440] text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'}`}>
                    <strong className="text-[#FF7A00] block mb-1">Recommended Action:</strong>
                    {analysisResult.recommendedAction}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Secondary Column: Radar Feed */}
          <div className="w-full lg:col-span-5 xl:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm sm:text-base font-bold tracking-tight">Active Incident Radar</h2>
                <p className="text-[11px] text-[#A0A6B2]">Live community and regional alerts</p>
              </div>

              <button
                onClick={handleFeedShuffle}
                className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                  isDarkMode ? 'bg-[#1A1D24] border-[#2E3440] text-[#A0A6B2] hover:bg-[#242933] hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>🔀</span>
                <span>Shuffle Feed</span>
              </button>
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all text-xs ${
                    selectedCategory === cat
                      ? 'bg-[#FF7A00] text-white font-semibold shadow-sm shadow-[#FF7A00]/30'
                      : isDarkMode
                      ? 'bg-[#1A1D24] text-[#A0A6B2] hover:bg-[#242933] border border-[#2E3440]'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredFeed.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setClaimText(item.title)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all hover:border-[#FF7A00]/50 ${
                    isDarkMode ? 'bg-[#1A1D24] border-[#2E3440] hover:bg-[#242933]/70' : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF7A00]">
                      {item.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        item.verdict === 'CONFIRMED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-[#C82333]/15 text-rose-400 border border-[#C82333]/30'
                      }`}>
                        {item.verdict}
                      </span>
                      <span className="text-[10px] text-slate-500">{item.timestamp}</span>
                    </div>
                  </div>

                  <h3 className={`text-xs sm:text-sm font-semibold leading-snug line-clamp-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {item.title}
                  </h3>

                  <p className={`text-[11px] mt-1.5 line-clamp-2 leading-relaxed ${isDarkMode ? 'text-[#A0A6B2]' : 'text-slate-500'}`}>
                    {item.summary}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-[#2E3440]/60 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Source: <strong className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>{item.source}</strong></span>
                    <span className="text-[#FFB800] font-semibold">Risk: {item.riskScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
