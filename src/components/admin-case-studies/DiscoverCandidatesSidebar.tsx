// src/components/admin-case-studies/DiscoverCandidatesSidebar.tsx
import { useState } from 'react';
import {
  Sparkles,
  Search,
  Plus,
  ExternalLink,
  Calendar,
  AlertCircle,
  Shield,
  FileText,
  Building2,
  Newspaper,
  Compass,
} from 'lucide-react';

import { useDiscoverCandidates } from '@/hooks/useCaseStudies';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { DiscoveryCandidate, EvidenceTier } from '@/types';
import { getApiErrorMessage } from '@/utils/errorHandler';

interface DiscoverCandidatesSidebarProps {
  onUseCandidate: (candidate: DiscoveryCandidate) => void;
}

const QUICK_SEARCH_SUGGESTIONS = [
  'Mercato commercial district',
  'Bole Rwanda corridor',
  'Akaki Industrial Zone',
  'Gotera interchange construction',
  'Sarbet expansion',
];

export default function DiscoverCandidatesSidebar({
  onUseCandidate,
}: DiscoverCandidatesSidebarProps) {
  const [areaFocus, setAreaFocus] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const discoverMutation = useDiscoverCandidates();

  const handleSearch = (queryToRun?: string) => {
    const query = (queryToRun ?? areaFocus).trim();
    if (!query) return;
    setErrorMessage(null);
    discoverMutation.mutate(query, {
      onError: (err) => {
        setErrorMessage(getApiErrorMessage(err, 'Failed to extract AI news candidates'));
      },
    });
  };

  const handleSelectQuickSuggestion = (suggestion: string) => {
    setAreaFocus(suggestion);
    handleSearch(suggestion);
  };

  const renderTierBadge = (tier: EvidenceTier | string) => {
    switch (tier) {
      case 'OFFICIAL':
        return (
          <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] py-0">
            <Shield className="w-2.5 h-2.5 mr-1" />
            Official
          </Badge>
        );
      case 'MARKET_REPORT':
        return (
          <Badge className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] py-0">
            <FileText className="w-2.5 h-2.5 mr-1" />
            Market Report
          </Badge>
        );
      case 'INFRASTRUCTURE':
        return (
          <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] py-0">
            <Building2 className="w-2.5 h-2.5 mr-1" />
            Infrastructure
          </Badge>
        );
      case 'LOCAL_NEWS':
      default:
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] py-0">
            <Newspaper className="w-2.5 h-2.5 mr-1" />
            {tier || 'News Lead'}
          </Badge>
        );
    }
  };

  const candidates = discoverMutation.data?.candidates || [];

  return (
    <Card className="border border-border-base bg-white shadow-xs rounded-2xl overflow-hidden flex flex-col h-full">
      <CardHeader className="bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-surface-container-low p-4 border-b border-border-base">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-gray-900">
              AI Candidate Discovery
            </CardTitle>
            <p className="text-[11px] text-muted-foreground">
              Extract news leads & ground evidence using AI
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4 flex-1 flex flex-col">
        {/* ── Search Input Box ── */}
        <div className="space-y-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search area, project, or district..."
              value={areaFocus}
              onChange={(e) => setAreaFocus(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              className="w-full h-9 pl-3 pr-20 text-xs bg-gray-50/70 border border-border-base rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
            <Button
              type="button"
              size="sm"
              onClick={() => handleSearch()}
              disabled={discoverMutation.isPending || !areaFocus.trim()}
              className="absolute right-1 top-1 h-7 px-2.5 text-[11px] bg-primary hover:bg-primary/90 text-white rounded-lg shadow-xs"
            >
              {discoverMutation.isPending ? (
                <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span className="flex items-center gap-1">
                  <Search className="w-3 h-3" />
                  Find
                </span>
              )}
            </Button>
          </div>

          {/* Quick Suggestions */}
          <div className="flex flex-wrap gap-1 pt-0.5">
            {QUICK_SEARCH_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSelectQuickSuggestion(suggestion)}
                className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer border border-border-base/60"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* ── Error Notification ── */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <p className="leading-snug">{errorMessage}</p>
          </div>
        )}

        {/* ── Results List ── */}
        <div className="space-y-3 flex-1 overflow-y-auto max-h-[520px] pr-0.5">
          {discoverMutation.isPending ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-2">
              <div className="w-7 h-7 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              <p className="text-xs font-semibold text-gray-800">Analyzing local news & data...</p>
              <p className="text-[11px] text-muted-foreground max-w-[200px]">
                Scanning regional sources and infrastructure announcements
              </p>
            </div>
          ) : candidates.length > 0 ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-semibold px-1">
                <span>Discovered Leads ({candidates.length})</span>
                <span className="text-primary font-mono text-[10px]">AI-Generated</span>
              </div>

              {candidates.map((candidate, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-border-base bg-white hover:border-primary/40 hover:shadow-xs transition-all space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    {renderTierBadge(candidate.suggestedEvidenceTier)}
                    {candidate.mentionedDate && (
                      <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        {new Date(candidate.mentionedDate).toISOString().split('T')[0]}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-800 leading-snug font-medium line-clamp-3">
                    {candidate.summary}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-border-base/50">
                    {candidate.sourceUrl ? (
                      <a
                        href={candidate.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-primary hover:underline flex items-center gap-1 truncate max-w-[130px]"
                      >
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        Source Link
                      </a>
                    ) : (
                      <span className="text-[10px] text-gray-400">Local Report</span>
                    )}

                    <Button
                      type="button"
                      size="xs"
                      onClick={() => onUseCandidate(candidate)}
                      className="text-[10px] h-6 px-2 bg-blue-50 text-blue-700 hover:bg-primary hover:text-white border border-blue-200 transition-all font-semibold rounded-lg"
                    >
                      <Plus className="w-3 h-3 mr-0.5" />
                      Use Lead
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 flex flex-col items-center justify-center text-center p-4 bg-surface-container-low/50 rounded-2xl border border-dashed border-border-base text-muted-foreground">
              <Compass className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-xs font-semibold text-gray-700">Explore AI Leads</p>
              <p className="text-[11px] text-muted-foreground mt-1 max-w-[220px]">
                Search an urban center or commercial district to automatically identify ground-truth
                validation candidates.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
