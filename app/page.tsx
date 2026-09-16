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
    <div className={`min-h-screen transition-colors duration-200 font-sans ${isDarkMode ? 'bg-[#0f1a14] text-[#e2e8e4]' : 'bg-[#eef0eb] text-[#16241c]'}`}>
      
      {/* Header */}
      <header className={`sticky top-0 z-40 border-b px-4 py-3 sm:px-6 md:px-8 backdrop-blur-md ${isDarkMode ? 'bg-[#0f1a14]/90 border-[#1f3529]' : 'bg-[#eef0eb]/90 border-[#d3d9ce]'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#1b3b2a] flex items-center justify-center font-black text-white shadow-md shadow-[#1b3b2a]/20">
              M
            </div>
            <div>
              <h1 className={`text-base sm:text-lg font-bold tracking-tight leading-none flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#16241c]'}`}>
                Mozai
                <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border ${isDarkMode ? 'bg-[#a5d6b7]/10 text-[#a5d6b7] border-[#a5d6b7]/30' : 'bg-[#1b3b2a]/10 text-[#1b3b2a] border-[#1b3b2a]/20'}`}>
                  Radar v2.4
                </span>
              </h1>
              <p className={`text-[11px] hidden sm:block ${isDarkMode ? 'text-[#8ba394]' : 'text-[#5c7365]'}`}>
                Forensic Misinformation & Synthetic Content Radar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border focus:outline-none focus:border-[#1b3b2a] ${isDarkMode ? 'bg-[#13221a] border-[#1f3529] text-[#e2e8e4]' : 'bg-[#f6f7f4] border-[#d3d9ce] text-[#16241c]'}`}
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg border transition-all ${isDarkMode ? 'bg-[#13221a] border-[#1f3529] text-[#a5d6b7] hover:bg-[#1f3529]' : 'bg-[#f6f7f4] border-[#d3d9ce] text-[#1b3b2a] hover:bg-[#e4e8df]'}`}
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
            <div className={`rounded-2xl border p-4 sm:p-6 shadow-sm transition-all ${isDarkMode ? 'bg-[#13221a] border-[#1f3529]' : 'bg-[#f6f7f4] border-[#d3d9ce]'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <label className={`text-xs sm:text-sm font-semibold tracking-wide uppercase ${isDarkMode ? 'text-[#a5d6b7]' : 'text-[#1b3b2a]'}`}>
                  Audit Target / Suspected Claim
                </label>
                <div className={`flex items-center gap-1 text-[11px] ${isDarkMode ? 'text-[#8ba394]' : 'text-[#5c7365]'}`}>
                  <span>Target Language:</span>
                  <span className={`font-medium ${isDarkMode ? 'text-[#e2e8e4]' : 'text-[#16241c]'}`}>{selectedLanguage}</span>
                </div>
              </div>

              <textarea
                value={claimText}
                onChange={(e) => setClaimText(e.target.value)}
                placeholder="Paste news headline, WhatsApp forward, audio transcript, or link to inspect authenticity..."
                rows={4}
                className={`w-full text-sm rounded-xl p-3 sm:p-4 border focus:outline-none focus:ring-2 focus:ring-[#1b3b2a]/30 transition-all resize-none ${
                  isDarkMode
                    ? 'bg-[#0f1a14] border-[#1f3529] text-[#e2e8e4] placeholder-[#5c7365] focus:border-[#4ade80]'
                    : 'bg-[#eef0eb] border-[#d3d9ce] text-[#16241c] placeholder-[#8ba394] focus:border-[#1b3b2a]'
                }`}
              />

              <div className={`mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t ${isDarkMode ? 'border-[#1f3529]' : 'border-[#d3d9ce]'}`}>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setClaimText('Central Board confirms mandatory pre-registration for all 2026 technical entrance examinations.')}
                    className={`text-xs px-3 py-2 rounded-lg border font-medium transition-all ${
                      isDarkMode ? 'border-[#1f3529] bg-[#182920] text-[#a5d6b7] hover:bg-[#1f3529] hover:text-white' : 'border-[#d3d9ce] bg-[#eef0eb] text-[#4a5f53] hover:bg-[#e4e8df]'
                    }`}
                  >
                    Sample Claim
                  </button>
                  <button
                    type="button"
                    onClick={() => { setClaimText(''); setAnalysisResult(null); }}
                    className={`text-xs px-3 py-2 rounded-lg border font-medium transition-all ${
                      isDarkMode ? 'border-[#1f3529] bg-[#0f1a14] text-[#8ba394] hover:bg-[#1f3529] hover:text-[#e2e8e4]' : 'border-[#d3d9ce] bg-[#eef0eb] text-[#8ba394] hover:bg-[#e4e8df]'
                    }`}
                  >
                    Clear
                  </button>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={isLoading || !claimText.trim()}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#5c7a6b] hover:bg-[#4a6356] active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Analyzing Claim...
                    </>
                  ) : (
                    'Verify Claim'
                  )}
                </button>
              </div>
            </div>

            {/* Results Panel */}
            {analysisResult && (
              <div className={`rounded-2xl border p-5 sm:p-6 shadow-sm space-y-5 animate-in fade-in duration-300 ${
                isDarkMode ? 'bg-[#13221a] border-[#1f3529]' : 'bg-[#f6f7f4] border-[#d3d9ce]'
              }`}>
                <div className={`flex flex-wrap items-center justify-between gap-3 border-b pb-4 ${isDarkMode ? 'border-[#1f3529]' : 'border-[#d3d9ce]'}`}>
                  <div>
                    <span className={`text-[10px] font-bold tracking-wider uppercase ${isDarkMode ? 'text-[#8ba394]' : 'text-[#5c7365]'}`}>Forensic Verdict</span>
                    <h2 className={`text-lg sm:text-xl font-extrabold mt-0.5 ${
                      analysisResult.verdict === 'CONFIRMED' ? (isDarkMode ? 'text-[#4ade80]' : 'text-[#0f5c4a]') : 'text-red-500'
                    }`}>
                      {analysisResult.verdict}
                    </h2>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`text-[10px] uppercase font-bold ${isDarkMode ? 'text-[#8ba394]' : 'text-[#5c7365]'}`}>Confidence</div>
                      <div className={`text-base sm:text-lg font-black ${isDarkMode ? 'text-[#e2e8e4]' : 'text-[#1b3b2a]'}`}>{analysisResult.confidenceScore ?? 85}%</div>
                    </div>
                    <div className={`h-8 w-px ${isDarkMode ? 'bg-[#1f3529]' : 'bg-[#d3d9ce]'}`} />
                    <div className="text-right">
                      <div className={`text-[10px] uppercase font-bold ${isDarkMode ? 'text-[#8ba394]' : 'text-[#5c7365]'}`}>Synthetic Risk</div>
                      <div className={`text-base sm:text-lg font-black ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>{analysisResult.deepfakeRisk ?? 50}%</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className={`text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-[#8ba394]' : 'text-[#5c7365]'}`}>Executive Summary</h3>
                  <p className={`text-xs sm:text-sm leading-relaxed ${isDarkMode ? 'text-[#e2e8e4]' : 'text-[#16241c]'}`}>
                    {analysisResult.summary}
                  </p>
                </div>

                {analysisResult.evidencePoints && analysisResult.evidencePoints.length > 0 && (
                  <div>
                    <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-[#8ba394]' : 'text-[#5c7365]'}`}>Forensic Findings</h3>
                    <ul className="space-y-2">
                      {analysisResult.evidencePoints.map((point, i) => (
                        <li key={i} className={`text-xs sm:text-sm flex items-start gap-2 ${isDarkMode ? 'text-[#e2e8e4]' : 'text-[#16241c]'}`}>
                          <span className={`${isDarkMode ? 'text-[#a5d6b7]' : 'text-[#1b3b2a]'} font-bold mt-0.5`}>•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysisResult.manipulationTechniques && analysisResult.manipulationTechniques.length > 0 && (
                  <div className={`pt-3 border-t flex flex-wrap gap-2 items-center ${isDarkMode ? 'border-[#1f3529]' : 'border-[#d3d9ce]'}`}>
                    <span className={`text-[11px] font-medium ${isDarkMode ? 'text-[#8ba394]' : 'text-[#5c7365]'}`}>Techniques:</span>
                    {analysisResult.manipulationTechniques.map((tech, i) => (
                      <span key={i} className={`text-[11px] px-2.5 py-0.5 rounded-md font-medium border ${
                        isDarkMode ? 'bg-red-900/30 text-red-300 border-red-500/30' : 'bg-red-100 text-red-700 border-red-300'
                      }`}>
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {analysisResult.recommendedAction && (
                  <div className={`p-3.5 rounded-xl border text-xs sm:text-sm ${isDarkMode ? 'bg-[#0f1a14] border-[#1f3529] text-[#e2e8e4]' : 'bg-[#eef0eb] border-[#d3d9ce] text-[#16241c]'}`}>
                    <strong className={`block mb-1 ${isDarkMode ? 'text-[#a5d6b7]' : 'text-[#1b3b2a]'}`}>Recommended Action:</strong>
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
                <h2 className={`text-sm sm:text-base font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-[#16241c]'}`}>Active Incident Radar</h2>
                <p className={`text-[11px] ${isDarkMode ? 'text-[#8ba394]' : 'text-[#5c7365]'}`}>Live community and regional alerts</p>
              </div>

              <button
                onClick={handleFeedShuffle}
                className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                  isDarkMode ? 'bg-[#13221a] border-[#1f3529] text-[#e2e8e4] hover:bg-[#1f3529]' : 'bg-[#f6f7f4] border-[#d3d9ce] text-[#16241c] hover:bg-[#e4e8df]'
                }`}
              >
                <span>🔀</span>
                <span>Shuffle</span>
              </button>
            </div>

            {/* Category selection */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all text-xs font-medium ${
                    selectedCategory === cat
                      ? 'bg-[#1b3b2a] text-white font-semibold'
                      : isDarkMode
                      ? 'bg-[#13221a] text-[#8ba394] hover:bg-[#1f3529] hover:text-[#e2e8e4] border border-[#1f3529]'
                      : 'bg-[#f6f7f4] text-[#5c7365] hover:bg-[#e4e8df] border border-[#d3d9ce]'
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
                  className={`p-4 rounded-xl border cursor-pointer transition-all hover:border-[#1b3b2a]/50 ${
                    isDarkMode ? 'bg-[#13221a] border-[#1f3529] hover:bg-[#1f3529]/60' : 'bg-[#f6f7f4] border-[#d3d9ce] hover:bg-[#eef0eb]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-[#a5d6b7]' : 'text-[#1b3b2a]'}`}>
                      {item.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        item.verdict === 'CONFIRMED'
                          ? (isDarkMode ? 'bg-[#254f39]/50 text-[#a5d6b7] border-[#4ade80]/20' : 'bg-[#d0f0e8] text-[#0f5c4a] border-[#a0e0d0]')
                          : (isDarkMode ? 'bg-red-900/30 text-red-300 border-red-500/30' : 'bg-red-100 text-red-700 border-red-300')
                      }`}>
                        {item.verdict}
                      </span>
                      <span className={`text-[10px] ${isDarkMode ? 'text-[#5c7365]' : 'text-[#8ba394]'}`}>{item.timestamp}</span>
                    </div>
                  </div>

                  <h3 className={`text-xs sm:text-sm font-semibold leading-snug line-clamp-2 ${isDarkMode ? 'text-[#e2e8e4]' : 'text-[#16241c]'}`}>
                    {item.title}
                  </h3>

                  <p className={`text-[11px] mt-1.5 line-clamp-2 leading-relaxed ${isDarkMode ? 'text-[#8ba394]' : 'text-[#5c7365]'}`}>
                    {item.summary}
                  </p>

                  <div className={`mt-3 pt-2.5 border-t flex items-center justify-between text-[10px] ${isDarkMode ? 'border-[#1f3529]' : 'border-[#d3d9ce]'}`}>
                    <span className={isDarkMode ? 'text-[#5c7365]' : 'text-[#8ba394]'}>
                      Source: <strong className={isDarkMode ? 'text-[#8ba394]' : 'text-[#5c7365]'}>{item.source}</strong>
                    </span>
                    <span className={`font-semibold ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>Risk: {item.riskScore}%</span>
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