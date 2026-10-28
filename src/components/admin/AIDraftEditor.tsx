// src/components/admin/AIDraftEditor.tsx
import { useState, useEffect, useCallback } from 'react';
import { adminDraftsApi } from '@/api/admin/drafts.api';
import { useToast } from '@/context/ToastContext';
import { formatApiError } from '@/lib/axios';
import { Sparkles, Loader2, CheckCircle2, Save, X, Eye, Code } from 'lucide-react';
import type { ReportDraft } from '@/types';

interface AIDraftEditorProps {
  requestId: string;
  requestTitle: string;
  targetCells: string[];
  questionPrompt?: string;
  onClose: () => void;
  onDelivered: () => void;
}

export default function AIDraftEditor({
  requestId,
  requestTitle,
  targetCells,
  onClose,
  onDelivered,
}: AIDraftEditorProps) {
  const { toast } = useToast();

  const [draft, setDraft] = useState<ReportDraft | null>(null);
  const [content, setContent] = useState<string>('');
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDelivering, setIsDelivering] = useState(false);
  const [activeMobileView, setActiveMobileView] = useState<'edit' | 'preview'>('edit');

  const handleGenerateOrFetch = useCallback(async () => {
    setIsGenerating(true);
    try {
      const generated = await adminDraftsApi.generateDraft(requestId);
      setDraft(generated);
      setContent(generated.draftContent || '');
      setReviewNotes(generated.reviewNotes || '');
    } catch (err) {
      toast.error(formatApiError(err), { title: 'Could not generate draft' });
    } finally {
      setIsGenerating(false);
    }
  }, [requestId, toast]);

  useEffect(() => {
    handleGenerateOrFetch();
  }, [handleGenerateOrFetch]);

  const handleSaveDraft = async () => {
    if (!draft) return;
    setIsSaving(true);
    try {
      const updated = await adminDraftsApi.updateDraft(draft.id, {
        draftContent: content,
        reviewNotes: reviewNotes.trim() || undefined,
      });
      setDraft(updated);
      toast.success('Draft saved successfully.');
    } catch (err) {
      toast.error(formatApiError(err), { title: 'Failed to save draft' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleApproveAndDeliver = async () => {
    if (!draft) return;
    setIsDelivering(true);
    try {
      // First save latest edits
      await adminDraftsApi.updateDraft(draft.id, {
        draftContent: content,
        reviewNotes: reviewNotes.trim() || undefined,
      });

      const fileName = `${requestTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_Final_Analysis.pdf`;
      await adminDraftsApi.deliverDraft(draft.id, { fileName });

      toast.success('Report approved and deliverable dispatched to user!', {
        title: 'Report Delivered',
      });
      onDelivered();
    } catch (err) {
      toast.error(formatApiError(err), { title: 'Failed to approve and deliver' });
    } finally {
      setIsDelivering(false);
    }
  };

  // Simple resilient markdown-to-html converter
  const renderMarkdown = (md: string) => {
    if (!md) return '';
    let html = md.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Headings
    html = html.replace(
      /^### (.*$)/gim,
      '<h3 class="text-base font-bold text-gray-900 dark:text-white mt-4 mb-2">$1</h3>'
    );
    html = html.replace(
      /^## (.*$)/gim,
      '<h2 class="text-lg font-bold text-gray-900 dark:text-white mt-6 mb-3 pb-1 border-b border-gray-200 dark:border-gray-800">$1</h2>'
    );
    html = html.replace(
      /^# (.*$)/gim,
      '<h1 class="text-2xl font-extrabold text-gray-900 dark:text-white mt-4 mb-4 pb-2 border-b border-gray-300 dark:border-gray-700">$1</h1>'
    );

    // Bold & italic
    html = html.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>'
    );
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    // Blockquote
    html = html.replace(
      /^> (.*$)/gim,
      '<blockquote class="border-l-4 border-blue-500 pl-4 py-1 italic text-gray-700 dark:text-gray-300 bg-blue-50/50 dark:bg-blue-950/20 my-3 rounded-r-lg">$1</blockquote>'
    );

    // Bullet lists
    html = html.replace(
      /^- (.*$)/gim,
      '<li class="ml-4 list-disc text-xs text-gray-700 dark:text-gray-300 leading-relaxed">$1</li>'
    );

    // Paragraphs
    html = html.replace(
      /\n\n+/g,
      '</p><p class="text-xs text-gray-700 dark:text-gray-300 leading-relaxed my-2">'
    );

    return `<div class="prose max-w-none text-xs"><p class="text-xs text-gray-700 dark:text-gray-300 leading-relaxed my-2">${html}</p></div>`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-6xl h-[90vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/60 dark:bg-gray-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  AI Report Draft Review & Synthesis
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
                  Human-In-The-Loop
                </span>
              </div>
              <p className="text-[11px] text-gray-500 truncate max-w-md">
                {requestTitle} • Target Cells: {targetCells.join(', ')}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateOrFetch}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {isGenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              )}
              <span>Regenerate Draft</span>
            </button>

            <button
              onClick={handleSaveDraft}
              disabled={isSaving || isGenerating || !draft}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>Save Changes</span>
            </button>

            <button
              onClick={handleApproveAndDeliver}
              disabled={isDelivering || isGenerating || !draft}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              {isDelivering ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>Approve & Deliver</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile View Switcher */}
        <div className="flex md:hidden border-b border-gray-100 bg-gray-50 p-1">
          <button
            onClick={() => setActiveMobileView('edit')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg ${
              activeMobileView === 'edit' ? 'bg-white shadow-xs text-blue-600' : 'text-gray-600'
            }`}
          >
            Markdown Editor
          </button>
          <button
            onClick={() => setActiveMobileView('preview')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg ${
              activeMobileView === 'preview' ? 'bg-white shadow-xs text-blue-600' : 'text-gray-600'
            }`}
          >
            Formatted Preview
          </button>
        </div>

        {/* Editor Body: Split Pane */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Pane: Markdown Textarea */}
          <div
            className={`w-full md:w-1/2 flex flex-col border-r border-gray-100 dark:border-gray-800 ${
              activeMobileView === 'edit' ? 'flex' : 'hidden md:flex'
            }`}
          >
            <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-950/20 flex items-center justify-between text-[11px] text-gray-500 font-semibold">
              <span className="flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5" /> Raw Markdown Source
              </span>
              <span>{content.length} characters</span>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="AI synthesized report draft will appear here…"
              disabled={isGenerating}
              className="flex-1 p-5 font-mono text-xs text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 resize-none focus:outline-none leading-relaxed"
            />

            {/* Review Notes Footer */}
            <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/40">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Internal Analyst Review Notes
              </label>
              <input
                type="text"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Notes on methodology validation, baseline cross-check, or customer caveats…"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Right Pane: Live HTML Preview */}
          <div
            className={`w-full md:w-1/2 flex flex-col bg-slate-50/50 dark:bg-gray-950/50 ${
              activeMobileView === 'preview' ? 'flex' : 'hidden md:flex'
            }`}
          >
            <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-950/20 flex items-center justify-between text-[11px] text-gray-500 font-semibold">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> Live Rendered Deliverable Preview
              </span>
              <span className="text-emerald-600 font-bold">Client Format</span>
            </div>

            <div className="flex-1 p-8 overflow-y-auto bg-white dark:bg-gray-900 mx-4 my-4 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800">
              {isGenerating ? (
                <div className="py-24 flex flex-col items-center justify-center gap-3 text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <p className="text-xs font-semibold text-gray-600">
                    Synthesizing indicators with AI…
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Analyzing nightlights (VIIRS), settlement density (GHSL), and wealth (RWI)
                  </p>
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
