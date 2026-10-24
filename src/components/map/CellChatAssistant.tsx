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

const QUICK_PROMPTS = [
  'Explain nightlight trajectory',
  'Correlate with population density',
  'Commercial viability & growth prospects',
  'What are the primary anomaly risks?',
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
      ? `Analysis for ${areaLabel || cellId.slice(0, 10)}:\n\n${aiSummary}\n\nAsk me anything about this cell's historical trends, density, or economic outlook.`
      : `Hello! I am your Spatial AI Assistant for cell ${areaLabel || cellId.slice(0, 10)}. You can ask me about nighttime lights, human settlement patterns, or investment viability.`;

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const cellChatMutation = useCellChat(cellId);

  // Reset or refresh initial message if cellId changes
  useEffect(() => {
    const initialAssistantText = aiSummary
      ? `Analysis for ${areaLabel || cellId.slice(0, 10)}:\n\n${aiSummary}\n\nAsk me anything about this cell's historical trends, density, or economic outlook.`
      : `Hello! I am your Spatial AI Assistant for cell ${areaLabel || cellId.slice(0, 10)}. You can ask me about nighttime lights, human settlement patterns, or investment viability.`;

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
  }, [messages, isExpanded, cellChatMutation.isPending]);

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
        content: `⚠️ Failed to get AI response: ${errorMsg}. Please try asking again.`,
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
      ? `Analysis for ${areaLabel || cellId.slice(0, 10)}:\n\n${aiSummary}\n\nAsk me anything about this cell's historical trends, density, or economic outlook.`
      : `Conversation cleared. I am ready to analyze cell ${areaLabel || cellId.slice(0, 10)}.`;

    setMessages([
      {
        role: 'assistant',
        content: initialText,
        timestamp: formatTime(),
      },
    ]);
  };

  // Helper to render basic markdown-like formatting (paragraphs, bold, list items)
  const renderFormattedContent = (content: string) => {
    const paragraphs = content.split('\n\n');
    return (
      <div className="space-y-2 text-xs leading-relaxed">
        {paragraphs.map((para, pIdx) => {
          const lines = para.split('\n');
          return (
            <div key={pIdx} className="space-y-1">
              {lines.map((line, lIdx) => {
                const trimmed = line.trim();
                const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');
                const text = isBullet ? trimmed.slice(2) : trimmed;

                // Simple bold replacement: **bold**
                const parts = text.split(/(\*\*.*?\*\*)/g);

                const renderedText = parts.map((part, partIdx) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return (
                      <strong key={partIdx} className="font-semibold text-gray-900 dark:text-white">
                        {part.slice(2, -2)}
                      </strong>
                    );
                  }
                  return part;
                });

                if (isBullet) {
                  return (
                    <div key={lIdx} className="flex items-start gap-1.5 pl-1.5">
                      <span className="text-blue-500 font-bold leading-tight">•</span>
                      <span className="flex-1">{renderedText}</span>
                    </div>
                  );
                }

                return <p key={lIdx}>{renderedText}</p>;
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={cn(
        'rounded-2xl border border-border-base bg-white dark:bg-gray-850 shadow-xs overflow-hidden transition-all duration-200',
        className
      )}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-50/60 via-indigo-50/40 to-transparent dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-transparent border-b border-border-base flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white tracking-tight">
                Spatial AI Assistant
              </h3>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                Llama-3 Spatial
              </span>
            </div>
            <p className="text-[10px] text-text-muted">
              Interactive analysis for {areaLabel || cellId.slice(0, 10)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleClearHistory}
            title="Reset Conversation"
            className="p-1 rounded-md text-text-muted hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse AI Chat' : 'Expand AI Chat'}
            className="p-1 rounded-md text-text-muted hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="flex flex-col">
          {/* Messages Container */}
          <div className="p-3 max-h-72 min-h-48 overflow-y-auto space-y-3.5 bg-gray-50/50 dark:bg-gray-900/50">
            {messages.map((message, idx) => {
              const isAssistant = message.role === 'assistant';
              return (
                <div
                  key={idx}
                  className={cn(
                    'flex gap-2 text-xs',
                    isAssistant ? 'items-start' : 'items-end justify-end'
                  )}
                >
                  {isAssistant && (
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3 h-3" />
                    </div>
                  )}

                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl p-2.5 shadow-2xs',
                      isAssistant
                        ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-border-base rounded-tl-xs'
                        : 'bg-blue-600 text-white rounded-tr-xs'
                    )}
                  >
                    {isAssistant ? (
                      renderFormattedContent(message.content)
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    )}

                    {message.timestamp && (
                      <div
                        className={cn(
                          'text-[9px] mt-1 text-right',
                          isAssistant ? 'text-text-muted' : 'text-blue-100'
                        )}
                      >
                        {message.timestamp}
                      </div>
                    )}
                  </div>

                  {!isAssistant && (
                    <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center shrink-0 mb-0.5">
                      <User className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading Indicator */}
            {cellChatMutation.isPending && (
              <div className="flex gap-2 items-start text-xs">
                <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
                  <Bot className="w-3 h-3" />
                </div>
                <div className="bg-white dark:bg-gray-800 border border-border-base rounded-2xl rounded-tl-xs p-3 flex items-center gap-2 shadow-2xs text-text-muted">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span className="text-[11px] font-medium">
                    Synthesizing spatial intelligence…
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 border-t border-border-base bg-white dark:bg-gray-850 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider shrink-0 mr-0.5">
              Quick:
            </span>
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                disabled={cellChatMutation.isPending}
                className="shrink-0 text-[11px] py-1 px-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-300 transition-colors border border-border-base font-medium cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-2.5 border-t border-border-base bg-white dark:bg-gray-850">
            <div className="relative flex items-center">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask about growth, nightlights, risk…"
                disabled={cellChatMutation.isPending}
                className="w-full resize-none text-xs rounded-xl pl-3 pr-10 py-2 bg-gray-50 dark:bg-gray-900 border border-border-base focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white placeholder:text-gray-400 max-h-24 leading-normal"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || cellChatMutation.isPending}
                className={cn(
                  'absolute right-1.5 p-1.5 rounded-lg transition-all cursor-pointer',
                  input.trim() && !cellChatMutation.isPending
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                    : 'text-gray-400 bg-transparent cursor-not-allowed'
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
            <div className="flex items-center justify-between mt-1 px-1">
              <span className="text-[10px] text-text-muted">Shift + Enter for new line</span>
              {trend && (
                <span className="text-[10px] text-text-muted font-mono">
                  Trend: <strong className="uppercase">{trend}</strong>
                  {compositeScore !== undefined && ` (${(compositeScore * 100).toFixed(0)}%)`}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CellChatAssistant;
