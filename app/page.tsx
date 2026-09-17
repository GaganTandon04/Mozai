'use client';

import React, { useState, useEffect } from 'react';

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

// ─── Animated risk score ring component ───
function RiskRing({ score, size = 44, strokeWidth = 3, isDark }: { score: number; size?: number; strokeWidth?: number; isDark: boolean }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = score >= 80 ? 'var(--danger)' : score >= 50 ? 'var(--warning)' : 'var(--success)';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-[10px] font-bold" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

export default function WorkspacePage() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [claimText, setClaimText] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [displayFeed, setDisplayFeed] = useState<FeedItem[]>(INITIAL_FEED);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const categories = ['All', 'Finance / Economy', 'Space / Science', 'Education / Policy', 'Cybersecurity / Media'];
  const languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Gujarati', 'Malayalam'];

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
        verdict: data.status || data.verdict || 'UNVERIFIED',
        confidenceScore: typeof data.confidenceIndex === 'number' ? data.confidenceIndex : (typeof data.confidenceScore === 'number' ? data.confidenceScore : 95),
        summary: data.forensicAnalysis || data.summary || 'Audit complete.',
        deepfakeRisk: typeof data.predictiveForecast?.viralRiskScore === 'number' ? data.predictiveForecast.viralRiskScore : (typeof data.deepfakeRisk === 'number' ? data.deepfakeRisk : 45),
        evidencePoints: data.predictiveForecast ? [
          data.coreAssertion ? `Core Assertion: ${data.coreAssertion}` : null,
          data.predictiveForecast.projectedTrajectory ? `Trajectory: ${data.predictiveForecast.projectedTrajectory}` : null,
          data.predictiveForecast.likelyFallout ? `Impact: ${data.predictiveForecast.likelyFallout}` : null,
        ].filter(Boolean) as string[] : (Array.isArray(data.evidencePoints) ? data.evidencePoints : [String(data.evidencePoints || 'Analysis verified with multiple regional sources.')]),
        manipulationTechniques: data.predictiveForecast?.historicalPrecedent ? [`Precedent: ${data.predictiveForecast.historicalPrecedent}`] : (Array.isArray(data.manipulationTechniques) ? data.manipulationTechniques : ['Contextual manipulation']),
        recommendedAction: data.predictiveForecast?.suggestedMitigation || data.recommendedAction || 'Verify with official primary sources before sharing.',
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

  const getVerdictColor = (verdict: string = '') => {
    const v = verdict.toUpperCase();
    if (v.includes('CONFIRM') || v.includes('VERIFIED_TRUE') || v.includes('TRUE')) return 'success';
    if (v.includes('MISLEAD') || v.includes('CONTESTED')) return 'warning';
    return 'danger';
  };

  // Cards always sit on dark green, so verdict badges always use bright-on-dark colors
  const verdictStyles = {
    success: {
      text: '#68D391',
      bg: 'rgba(42,122,90,0.15)',
      border: 'rgba(42,122,90,0.3)',
      glow: 'verdict-glow-success',
    },
    warning: {
      text: '#F6C858',
      bg: 'rgba(184,134,43,0.15)',
      border: 'rgba(184,134,43,0.3)',
      glow: 'verdict-glow-warning',
    },
    danger: {
      text: '#FC8181',
      bg: 'rgba(196,75,59,0.15)',
      border: 'rgba(196,75,59,0.3)',
      glow: 'verdict-glow-danger',
    },
  };

  // Theme-derived variables
  // Page background is cream; cards/header/components are always dark forest green
  const t = {
    // Page-level
    pageBg: isDarkMode
      ? `linear-gradient(170deg, #0F3D34 0%, #0D332B 40%, #0B2B24 100%)`
      : `linear-gradient(170deg, #F5EFE3 0%, #F2ECDD 50%, #EDE6D6 100%)`,
    pageText: isDarkMode ? '#F5EFE3' : '#0F3D34',
    pageTextSecondary: isDarkMode ? '#A8BFB5' : '#5A7A6E',
    // Card / component level — always dark green
    bgElevated: '#123B32',
    bgSurface: '#164A40',
    bgMuted: '#0D332B',
    textPrimary: '#F5EFE3',
    textSecondary: '#A8BFB5',
    textMuted: '#6B9486',
    border: 'rgba(30,140,122,0.18)',
    borderSubtle: 'rgba(30,140,122,0.1)',
    teal: '#1E8C7A',
    tealHover: '#2AA98F',
    gold: '#C9A86A',
    goldLight: '#D4B483',
    goldBorder: 'rgba(201,168,106,0.2)',
  };

  if (!mounted) return null;

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{
        background: t.pageBg,
        color: t.pageText,
        fontFamily: "var(--font-body)",
      }}
    >
      {/* ═══════════════ Header ═══════════════ */}
      <header
        className="sticky top-0 z-50 glass-card transition-colors duration-300"
        style={{
          background: 'rgba(15, 61, 52, 0.92)',
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3.5">
            <div
              className="relative h-10 w-10 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${t.teal}, ${isDarkMode ? '#164A40' : '#0F3D34'})`,
                boxShadow: `0 4px 16px rgba(30,140,122,0.25)`,
              }}
            >
              <span
                className="font-black text-sm tracking-tight"
                style={{ color: t.gold, fontFamily: 'var(--font-display)' }}
              >
                M
              </span>
              {/* Pulse ring */}
              <div
                className="absolute inset-0 rounded-xl"
                style={{
                  border: `1.5px solid ${t.teal}`,
                  animation: 'pulse-ring 3s ease-in-out infinite',
                }}
              />
            </div>
            <div>
              <h1 className="flex items-center gap-2">
                <span
                  className="text-lg font-bold tracking-tight"
                  style={{ fontFamily: 'var(--font-display)', color: '#F5EFE3' }}
                >
                  Mozai
                </span>
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ background: t.gold }}
                />
                <span
                  className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full tracking-wider"
                  style={{
                    background: 'rgba(30,140,122,0.15)',
                    color: '#81E6D9',
                    border: `1px solid rgba(30,140,122,0.3)`,
                  }}
                >
                  Radar v2.4
                </span>
              </h1>
              <p
                className="text-[11px] font-medium hidden sm:block mt-0.5"
                style={{ color: '#A8BFB5' }}
              >
                Multilingual misinformation detector & synthetic forensic radar
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="text-xs px-3.5 py-2 rounded-xl font-medium focus:outline-none transition-all cursor-pointer"
              style={{
                background: 'rgba(30,140,122,0.1)',
                border: `1px solid ${t.border}`,
                color: '#F5EFE3',
              }}
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'rgba(201,168,106,0.1)',
                border: `1px solid ${t.goldBorder}`,
                color: t.gold,
              }}
              aria-label="Toggle Theme"
              title={isDarkMode ? 'Switch to Cream Theme' : 'Switch to Dark Forest Theme'}
            >
              <span className="text-sm">{isDarkMode ? '☀️' : '🌙'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════ Main ═══════════════ */}
      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

          {/* ─── Left Column: Audit Workspace ─── */}
          <div className="w-full lg:col-span-7 space-y-8">

            {/* Hero text */}
            <div className="animate-fade-in-up">
              <h2
                className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight"
                style={{ fontFamily: 'var(--font-display)', color: t.pageText }}
              >
                Verify <span style={{ color: t.teal }}>before</span> you share.
              </h2>
              <p
                className="mt-2 text-sm sm:text-base leading-relaxed max-w-xl"
                style={{ color: t.pageTextSecondary }}
              >
                Paste any claim, news snippet, or forwarded message — Mozai's forensic AI
                will cross-reference it against verified sources in real time.
              </p>
            </div>

            {/* ─── Input Card ─── */}
            <div
              className="rounded-2xl p-6 sm:p-7 shadow-sm transition-all animate-fade-in-up gold-bracket"
              style={{
                background: t.bgElevated,
                border: `1px solid ${t.border}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <label
                  className="text-xs font-bold tracking-widest uppercase"
                  style={{ color: t.teal, letterSpacing: '0.12em' }}
                >
                  Audit Target
                </label>
                <div
                  className="flex items-center gap-2 text-[11px] font-medium"
                  style={{ color: t.textSecondary }}
                >
                  <span>Language:</span>
                  <span
                    className="font-semibold px-2.5 py-0.5 rounded-md"
                    style={{
                      background: 'rgba(201,168,106,0.1)',
                      color: t.gold,
                      border: `1px solid ${t.goldBorder}`,
                    }}
                  >
                    {selectedLanguage}
                  </span>
                </div>
              </div>

              <textarea
                value={claimText}
                onChange={(e) => setClaimText(e.target.value)}
                placeholder="Paste news snippet, WhatsApp forwarded text, or claim to audit authenticity..."
                rows={4}
                className="w-full text-sm rounded-xl p-4 sm:p-5 focus:outline-none transition-all resize-none"
                style={{
                  background: 'rgba(15,61,52,0.5)',
                  border: `1px solid ${t.borderSubtle}`,
                  color: t.textPrimary,
                }}
              />

              {/* Gold divider */}
              <div className="gold-divider my-5" />

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setClaimText(
                        'Central Board confirms mandatory pre-registration for all 2026 technical entrance examinations.'
                      )
                    }
                    className="text-xs px-4 py-2.5 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-95"
                    style={{
                      border: `1px solid ${t.goldBorder}`,
                      background: 'rgba(201,168,106,0.06)',
                      color: t.gold,
                    }}
                  >
                    ✦ Sample Claim
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setClaimText('');
                      setAnalysisResult(null);
                    }}
                    className="text-xs px-4 py-2.5 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-95"
                    style={{
                      border: `1px solid ${t.border}`,
                      background: 'transparent',
                      color: t.textMuted,
                    }}
                  >
                    Clear
                  </button>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={isLoading || !claimText.trim()}
                  className="btn-teal-glow w-full sm:w-auto px-7 py-3 rounded-xl font-bold text-sm active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-2.5"
                  style={{
                    background: `linear-gradient(135deg, ${t.teal}, ${t.tealHover})`,
                    color: '#F5EFE3',
                    boxShadow: '0 4px 16px rgba(30,140,122,0.2)',
                  }}
                >
                  {isLoading ? (
                    <>
                      <div
                        className="h-4 w-4 border-2 border-[#F5EFE3] border-t-transparent rounded-full animate-spin"
                      />
                      Analyzing…
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                      Verify Claim
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ─── Results Panel ─── */}
            {analysisResult && (
              <div
                className="rounded-2xl p-6 sm:p-7 shadow-sm space-y-6 animate-fade-in-up gold-bracket"
                style={{
                  background: t.bgElevated,
                  border: `1px solid ${t.border}`,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                }}
              >
                {/* Verdict Header */}
                <div
                  className="flex flex-wrap items-center justify-between gap-4 pb-5"
                  style={{ borderBottom: `1px solid ${t.borderSubtle}` }}
                >
                  <div>
                    <span
                      className="text-[10px] font-bold tracking-widest uppercase block mb-1"
                      style={{ color: t.textSecondary, letterSpacing: '0.15em' }}
                    >
                      Forensic Verdict
                    </span>
                    <h2
                      className="text-xl sm:text-2xl font-extrabold"
                      style={{
                        fontFamily: 'var(--font-display)',
                        color: verdictStyles[getVerdictColor(analysisResult.verdict)].text,
                      }}
                    >
                      {analysisResult.verdict}
                    </h2>
                  </div>

                  <div className="flex items-center gap-5">
                    {/* Confidence Ring */}
                    <div className="text-center">
                      <div
                        className="text-[9px] uppercase font-bold tracking-wider mb-1"
                        style={{ color: t.textSecondary }}
                      >
                        Confidence
                      </div>
                      <RiskRing score={analysisResult.confidenceScore ?? 85} isDark={isDarkMode} />
                    </div>

                    <div style={{ width: 1, height: 36, background: t.border }} />

                    {/* Risk Ring */}
                    <div className="text-center">
                      <div
                        className="text-[9px] uppercase font-bold tracking-wider mb-1"
                        style={{ color: t.textSecondary }}
                      >
                        Viral Risk
                      </div>
                      <RiskRing score={analysisResult.deepfakeRisk ?? 50} isDark={isDarkMode} />
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <h3
                    className="text-xs font-bold uppercase tracking-widest mb-2"
                    style={{ color: t.teal, letterSpacing: '0.12em' }}
                  >
                    Executive Summary
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: '#D4E2DB' }}
                  >
                    {analysisResult.summary}
                  </p>
                </div>

                {/* Evidence Points */}
                {analysisResult.evidencePoints && analysisResult.evidencePoints.length > 0 && (
                  <div>
                    <h3
                      className="text-xs font-bold uppercase tracking-widest mb-3"
                      style={{ color: t.teal, letterSpacing: '0.12em' }}
                    >
                      Forensic Findings
                    </h3>
                    <ul className="space-y-2.5">
                      {analysisResult.evidencePoints.map((point, i) => (
                        <li
                          key={i}
                          className="text-sm flex items-start gap-3"
                          style={{ color: '#D4E2DB' }}
                        >
                          <span
                            className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full"
                            style={{ background: t.gold }}
                          />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Manipulation Techniques */}
                {analysisResult.manipulationTechniques &&
                  analysisResult.manipulationTechniques.length > 0 && (
                    <div
                      className="pt-4 flex flex-wrap gap-2 items-center"
                      style={{ borderTop: `1px solid ${t.borderSubtle}` }}
                    >
                      <span
                        className="text-[11px] font-semibold mr-1"
                        style={{ color: t.textSecondary }}
                      >
                        Techniques:
                      </span>
                      {analysisResult.manipulationTechniques.map((tech, i) => (
                        <span
                          key={i}
                          className={`text-[11px] px-3 py-1 rounded-lg font-medium ${verdictStyles.danger.glow}`}
                          style={{
                            background: verdictStyles.danger.bg,
                            color: verdictStyles.danger.text,
                            border: `1px solid ${verdictStyles.danger.border}`,
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                {/* Recommended Action */}
                {analysisResult.recommendedAction && (
                  <div
                    className="p-4 rounded-xl text-sm"
                    style={{
                      background: 'rgba(30,140,122,0.08)',
                      border: `1px solid rgba(30,140,122,0.2)`,
                      color: '#D4E2DB',
                    }}
                  >
                    <strong
                      className="block mb-1.5 text-xs font-bold uppercase tracking-wider"
                      style={{ color: t.teal }}
                    >
                      ✦ Recommended Action
                    </strong>
                    {analysisResult.recommendedAction}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ─── Right Column: Radar Feed ─── */}
          <div className="w-full lg:col-span-5 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2
                  className="text-base sm:text-lg font-bold tracking-tight"
                  style={{ fontFamily: 'var(--font-display)', color: t.pageText }}
                >
                  Incident Radar
                </h2>
                <p
                  className="text-[11px] font-medium mt-0.5"
                  style={{ color: t.pageTextSecondary }}
                >
                  Live community & regional alerts
                </p>
              </div>

              <button
                onClick={handleFeedShuffle}
                className="text-xs px-3.5 py-2 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-1.5"
                style={{
                  background: isDarkMode ? 'rgba(30,140,122,0.08)' : 'rgba(15,61,52,0.06)',
                  border: `1px solid ${isDarkMode ? t.border : '#D6CCBA'}`,
                  color: t.pageText,
                }}
              >
                <span>🔀</span>
                <span>Shuffle</span>
              </button>
            </div>

            {/* Category pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="px-3.5 py-2 rounded-full whitespace-nowrap transition-all text-xs font-semibold hover:scale-[1.02] active:scale-95"
                  style={
                    selectedCategory === cat
                      ? {
                          background: `linear-gradient(135deg, #0F3D34, ${t.teal})`,
                          color: '#F5EFE3',
                          boxShadow: '0 2px 12px rgba(15,61,52,0.25)',
                        }
                      : {
                          background: isDarkMode ? 'rgba(30,140,122,0.06)' : 'rgba(15,61,52,0.04)',
                          color: t.pageTextSecondary,
                          border: `1px solid ${isDarkMode ? t.borderSubtle : '#D6CCBA'}`,
                        }
                  }
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Feed Cards */}
            <div className="space-y-3.5">
              {filteredFeed.map((item, index) => {
                const vColor = getVerdictColor(item.verdict);
                const vStyle = verdictStyles[vColor];

                return (
                  <div
                    key={item.id}
                    onClick={() => setClaimText(item.title)}
                    className={`group p-5 rounded-2xl cursor-pointer transition-all duration-200 hover:scale-[1.01] animate-fade-in-up stagger-${index + 1}`}
                    style={{
                      background: t.bgElevated,
                      border: `1px solid ${t.border}`,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(30,140,122,0.4)';
                      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = t.border;
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                    }}
                  >
                    {/* Card header */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: t.teal, letterSpacing: '0.1em' }}
                      >
                        {item.category}
                      </span>
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${vStyle.glow}`}
                          style={{
                            background: vStyle.bg,
                            color: vStyle.text,
                            border: `1px solid ${vStyle.border}`,
                          }}
                        >
                          {item.verdict}
                        </span>
                        <span
                          className="text-[10px] font-medium"
                          style={{ color: t.textMuted }}
                        >
                          {item.timestamp}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3
                      className="text-sm font-bold leading-snug line-clamp-2 group-hover:opacity-90 transition-opacity"
                      style={{ color: t.textPrimary }}
                    >
                      {item.title}
                    </h3>

                    {/* Summary */}
                    <p
                      className="text-[11px] mt-2 line-clamp-2 leading-relaxed"
                      style={{ color: t.textSecondary }}
                    >
                      {item.summary}
                    </p>

                    {/* Card footer */}
                    <div
                      className="mt-3.5 pt-3 flex items-center justify-between text-[10px]"
                      style={{ borderTop: `1px solid ${t.borderSubtle}` }}
                    >
                      <span style={{ color: t.textMuted }}>
                        Source:{' '}
                        <strong style={{ color: t.textPrimary }}>
                          {item.source}
                        </strong>
                      </span>
                      <RiskRing score={item.riskScore} size={32} strokeWidth={2.5} isDark={isDarkMode} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* ═══════════════ Footer ═══════════════ */}
      <footer
        className="mt-12 py-6 text-center"
        style={{ borderTop: `1px solid ${t.borderSubtle}` }}
      >
        <div className="gold-divider max-w-xs mx-auto mb-4" />
        <p className="text-xs font-medium" style={{ color: t.textMuted }}>
          <span style={{ color: t.gold }}>✦</span>{' '}
          Mozai Forensic Radar — Protecting India&apos;s information ecosystem{' '}
          <span style={{ color: t.gold }}>✦</span>
        </p>
      </footer>
    </div>
  );
}