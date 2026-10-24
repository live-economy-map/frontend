// src/components/map/CellChatAssistant.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useCellChat } from '@/hooks/useMap';
import type { ChatMessage } from '@/types';
import { formatApiError } from '@/lib/axios';
import {
  Sparkles,
  Send,
  RotateCcw,
  Bot,
  User,
  Loader2,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  TrendingUp,
  Building2,
  ShieldAlert,
  Compass,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CellChatAssistantProps {
  cellId: string;
  areaLabel?: string | null;
  aiSummary?: string | null;
  compositeScore?: number;
  trend?: 'up' | 'down' | 'flat';
  className?: string;
}

interface QuickPrompt {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const QUICK_PROMPTS: QuickPrompt[] = [
  { id: '1', label: 'Explain nightlight trajectory', icon: TrendingUp },
  { id: '2', label: 'Correlate with population density', icon: Building2 },
  { id: '3', label: 'Commercial viability & growth prospects', icon: Compass },
  { id: '4', label: 'What are the primary anomaly risks?', icon: ShieldAlert },
];

function formatTime(date: Date = new Date()): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const CellChatAssistant: React.FC<CellChatAssistantProps> = ({
  cellId,
  areaLabel,
  aiSummary,
  compositeScore,
  trend,
  className,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const initialAssistantText = aiSummary
      ? `### Spatial Intelligence Overview\n**Cell:** ${areaLabel || cellId.slice(0, 10)}\n\n${aiSummary}\n\n*Ask questions below about nightlight radiance, settlement density, or investment indicators.*`
      : `### Spatial Assistant Initialized\nHello! I am your **Spatial AI Assistant** for cell **${areaLabel || cellId.slice(0, 10)}**.\n\nYou can ask about nighttime lights, demographic growth trends, or risk assessment.`;

    return [
      {
        role: 'assistant',
        content: initialAssistantText,
        timestamp: formatTime(),
      },
    ];
  });

  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const cellChatMutation = useCellChat(cellId);

  // Sync initial message when cellId or aiSummary changes
  useEffect(() => {
    const initialAssistantText = aiSummary
      ? `### Spatial Intelligence Overview\n**Cell:** ${areaLabel || cellId.slice(0, 10)}\n\n${aiSummary}\n\n*Ask questions below about nightlight radiance, settlement density, or investment indicators.*`
      : `### Spatial Assistant Initialized\nHello! I am your **Spatial AI Assistant** for cell **${areaLabel || cellId.slice(0, 10)}**.\n\nYou can ask about nighttime lights, demographic growth trends, or risk assessment.`;

    setMessages([
      {
        role: 'assistant',
        content: initialAssistantText,
        timestamp: formatTime(),
      },
    ]);
  }, [cellId, areaLabel, aiSummary]);

  // Auto-scroll to bottom of messages container
  useEffect(() => {
    if (isExpanded && typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isExpanded, isFullscreen, cellChatMutation.isPending]);

  const handleSendMessage = async (textToSend?: string) => {
    const question = (textToSend || input).trim();
    if (!question || cellChatMutation.isPending) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: question,
      timestamp: formatTime(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');

    // Format history for backend
    const history = newMessages.slice(0, -1).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await cellChatMutation.mutateAsync({
        message: question,
        history,
      });

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.reply,
        timestamp: formatTime(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMsg = formatApiError(err);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `⚠️ **Error retrieving spatial analysis**: ${errorMsg}. Please try rephrasing or asking again.`,
        timestamp: formatTime(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    const initialText = aiSummary
      ? `Conversation cleared.\n\n### Spatial Intelligence Overview\n**Cell:** ${areaLabel || cellId.slice(0, 10)}\n\n${aiSummary}`
      : `Conversation cleared. I am ready to analyze cell **${areaLabel || cellId.slice(0, 10)}**.`;

    setMessages([
      {
        role: 'assistant',
        content: initialText,
        timestamp: formatTime(),
      },
    ]);
  };

  const handleCopyMessage = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // ignore
    }
  };

  // Helper to render markdown-like formatting
  const renderFormattedContent = (content: string) => {
    const sections = content.split('\n\n');

    return (
      <div className="space-y-2.5 text-xs leading-relaxed font-sans">
        {sections.map((section, sIdx) => {
          const lines = section.split('\n');

          return (
            <div key={sIdx} className="space-y-1.5">
              {lines.map((line, lIdx) => {
                const trimmed = line.trim();

                // H3 or Header
                if (trimmed.startsWith('### ')) {
                  return (
                    <div
                      key={lIdx}
                      className="font-bold text-gray-900 dark:text-gray-100 text-[13px] tracking-tight border-b border-border-base/50 pb-1 flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>{trimmed.slice(4)}</span>
                    </div>
                  );
                }

                // Bullets
                const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');
                const text = isBullet ? trimmed.slice(2) : trimmed;

                // Simple bold and italics parser
                const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);

                const renderedText = parts.map((part, partIdx) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return (
                      <strong key={partIdx} className="font-semibold text-gray-900 dark:text-white">
                        {part.slice(2, -2)}
                      </strong>
                    );
                  }
                  if (part.startsWith('*') && part.endsWith('*')) {
                    return (
                      <em key={partIdx} className="text-gray-500 dark:text-gray-400">
                        {part.slice(1, -1)}
                      </em>
                    );
                  }
                  return part;
                });

                if (isBullet) {
                  return (
                    <div
                      key={lIdx}
                      className="flex items-start gap-2 pl-1 text-gray-800 dark:text-gray-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 mt-1.5 shrink-0" />
                      <span className="flex-1">{renderedText}</span>
                    </div>
                  );
                }

                return (
                  <p key={lIdx} className="text-gray-800 dark:text-gray-200">
                    {renderedText}
                  </p>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  const chatContainerBody = (
    <div className="flex flex-col h-full">
      {/* Messages Thread */}
      <div
        className={cn(
          'p-3.5 overflow-y-auto space-y-4 bg-gradient-to-b from-gray-50/70 via-white/50 to-gray-50/70 dark:from-gray-950/40 dark:via-gray-900/40 dark:to-gray-950/40',
          isFullscreen ? 'flex-1 max-h-none' : 'max-h-80 min-h-56'
        )}
      >
        {messages.map((message, idx) => {
          const isAssistant = message.role === 'assistant';

          return (
            <div
              key={idx}
              className={cn(
                'flex gap-2.5 text-xs group transition-all duration-150',
                isAssistant ? 'items-start' : 'items-end justify-end'
              )}
            >
              {isAssistant && (
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs shadow-blue-500/20 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={cn(
                  'relative max-w-[88%] rounded-2xl p-3.5 transition-all duration-150',
                  isAssistant
                    ? 'bg-white/95 dark:bg-gray-850/95 text-gray-800 dark:text-gray-200 border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-tl-xs backdrop-blur-md'
                    : 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-white rounded-tr-xs shadow-sm shadow-blue-500/20'
                )}
              >
                {/* Assistant header banner inside bubble */}
                {isAssistant && (
                  <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-gray-150 dark:border-gray-800/80 text-[10px] text-text-muted">
                    <span className="font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Spatial Intelligence
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyMessage(message.content, idx)}
                      title="Copy message"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                )}

                {/* Content */}
                {isAssistant ? (
                  renderFormattedContent(message.content)
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed font-sans">{message.content}</p>
                )}

                {/* Timestamp */}
                {message.timestamp && (
                  <div
                    className={cn(
                      'text-[9px] mt-2 font-mono flex items-center justify-end gap-1',
                      isAssistant ? 'text-text-muted' : 'text-blue-200/80'
                    )}
                  >
                    <span>{message.timestamp}</span>
                  </div>
                )}
              </div>

              {!isAssistant && (
                <div className="w-6 h-6 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center shrink-0 mb-0.5 shadow-2xs">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {/* Processing Indicator */}
        {cellChatMutation.isPending && (
          <div className="flex gap-2.5 items-start text-xs animate-in fade-in duration-200">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs shadow-blue-500/20 mt-0.5">
              <Bot className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="bg-white/95 dark:bg-gray-850/95 border border-slate-200/80 dark:border-slate-800 rounded-2xl rounded-tl-xs p-3.5 shadow-sm flex items-center gap-2.5">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" />
              </div>
              <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300">
                Correlating VIIRS, GHSL & RWI layers…
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel */}
      <div className="px-3.5 py-2.5 border-t border-border-base/80 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xs flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-blue-500" />
          Quick:
        </span>
        {QUICK_PROMPTS.map((prompt) => {
          const Icon = prompt.icon;
          return (
            <button
              key={prompt.id}
              type="button"
              onClick={() => handleSendMessage(prompt.label)}
              disabled={cellChatMutation.isPending}
              className="shrink-0 flex items-center gap-1.5 text-[11px] py-1.5 px-3 rounded-full bg-gray-100/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/80 dark:hover:text-blue-300 transition-all border border-gray-200/70 dark:border-gray-700/60 font-medium cursor-pointer disabled:opacity-50 active:scale-95 shadow-2xs hover:shadow-xs hover:border-blue-300 dark:hover:border-blue-700"
            >
              <Icon className="w-3 h-3 text-blue-500 dark:text-blue-400 shrink-0" />
              <span>{prompt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Composer */}
      <div className="p-3 border-t border-border-base bg-white dark:bg-gray-850">
        <div className="relative flex items-center rounded-xl bg-gray-50/90 dark:bg-gray-900/90 border border-slate-200/90 dark:border-slate-800 focus-within:border-blue-500/80 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-inner">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Ask about growth, nightlights, risk…"
            disabled={cellChatMutation.isPending}
            className="w-full resize-none text-xs rounded-xl pl-3.5 pr-12 py-2.5 bg-transparent border-0 focus:outline-hidden text-gray-900 dark:text-white placeholder:text-gray-400 max-h-28 leading-normal"
          />
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || cellChatMutation.isPending}
            className={cn(
              'absolute right-1.5 p-2 rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center',
              input.trim() && !cellChatMutation.isPending
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-105 active:scale-95'
                : 'text-gray-400 bg-transparent cursor-not-allowed opacity-50'
            )}
            title="Send message (Enter)"
          >
            {cellChatMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Footer Meta */}
        <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-text-muted">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>Spatial Model Ready</span>
          </div>

          <div className="flex items-center gap-2 font-mono">
            <span>Shift + ↵ for line</span>
            {trend && (
              <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[9px] font-semibold">
                TREND:{' '}
                <strong className="uppercase text-blue-600 dark:text-blue-400">{trend}</strong>
                {compositeScore !== undefined && ` (${(compositeScore * 100).toFixed(0)}%)`}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div
        className={cn(
          'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-gray-850 shadow-md shadow-slate-900/5 overflow-hidden transition-all duration-200',
          className
        )}
      >
        {/* Header Bar */}
        <div className="px-4 py-3 bg-gradient-to-r from-blue-600/10 via-indigo-600/5 to-transparent dark:from-blue-500/15 dark:via-indigo-500/10 dark:to-transparent border-b border-border-base flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs shadow-blue-500/30">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-900" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-gray-900 dark:text-white tracking-tight">
                  Spatial AI Assistant
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100/80 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                  Llama-3 Spatial
                </span>
              </div>
              <p className="text-[10px] text-text-muted font-medium">
                Real-time reasoning for {areaLabel || cellId.slice(0, 10)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-gray-400">
            <button
              type="button"
              onClick={handleClearHistory}
              title="Reset Conversation"
              className="p-1.5 rounded-lg hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              title="Expand to Fullscreen Dialog"
              className="p-1.5 rounded-lg hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Collapse AI Chat' : 'Expand AI Chat'}
              className="p-1.5 rounded-lg hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Body */}
        {isExpanded && chatContainerBody}
      </div>

      {/* Expanded Fullscreen Dialog Mode */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl h-[85vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-blue-600/10 via-indigo-600/5 to-transparent dark:from-blue-500/15 dark:via-indigo-500/10 dark:to-transparent border-b border-border-base flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm shadow-blue-500/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Spatial AI Assistant & Deep Intelligence
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                      Cell: {areaLabel || cellId.slice(0, 10)}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted">
                    Full analysis stream and multi-turn conversational reasoning
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearHistory}
                  title="Reset Conversation"
                  className="p-1.5 rounded-lg text-text-muted hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  title="Exit Fullscreen"
                  className="p-1.5 rounded-lg text-text-muted hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Chat Body */}
            {chatContainerBody}
          </div>
        </div>
      )}
    </>
  );
};

export default CellChatAssistant;
