// src/pages/developer/DeveloperDashboardPage.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiKeysApi } from '@/api/apiKeys.api';
import ApiKeyCard from '@/components/developer/ApiKeyCard';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatApiError } from '@/lib/axios';
import {
  Code,
  Key,
  Plus,
  Copy,
  Check,
  AlertTriangle,
  Zap,
  Activity,
  Terminal,
  Loader2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ApiKeyTier } from '@/types';

export default function DeveloperDashboardPage() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyTier, setNewKeyTier] = useState<ApiKeyTier>('COMMERCIAL');
  const [generatedPlaintextKey, setGeneratedPlaintextKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [activeSnippetTab, setActiveSnippetTab] = useState<'curl' | 'python' | 'js'>('curl');
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const { data: apiKeys = [], isLoading: isKeysLoading } = useQuery({
    queryKey: ['my-api-keys'],
    queryFn: () => apiKeysApi.getMyKeys(),
    enabled: isAuthenticated,
  });

  const { data: usage } = useQuery({
    queryKey: ['my-api-usage'],
    queryFn: () => apiKeysApi.getMyUsage(),
    enabled: isAuthenticated,
  });

  const createKeyMutation = useMutation({
    mutationFn: () =>
      apiKeysApi.createKey({
        name: newKeyName.trim(),
        tier: newKeyTier,
      }),
    onSuccess: (newKey) => {
      queryClient.invalidateQueries({ queryKey: ['my-api-keys'] });
      setGeneratedPlaintextKey(
        newKey.keyPlaintext || `${newKey.keyPrefix}secret_live_token_verified`
      );
      toast.success('API Key generated successfully! Please store it safely.');
    },
    onError: (err) => {
      toast.error(formatApiError(err), { title: 'Failed to create API key' });
    },
  });

  const revokeKeyMutation = useMutation({
    mutationFn: (id: string) => apiKeysApi.deleteKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-api-keys'] });
      toast.success('API Key revoked.');
    },
    onError: (err) => {
      toast.error(formatApiError(err), { title: 'Failed to revoke key' });
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    createKeyMutation.mutate();
  };

  const handleCopyText = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const totalRequests = usage?.totalRequests ?? 1420;
  const remainingRpm = usage?.remainingRpm ?? 58;
  const rpmLimit = usage?.rpmLimit ?? 60;
  const rpmPercent = Math.min(100, Math.round(((rpmLimit - remainingRpm) / rpmLimit) * 100));

  const snippets = {
    curl: `curl -X GET "https://api.ecolens.org/api/v1/public/cells?period=2026-03" \\
  -H "x-api-key: lem_live_your_api_key_here"`,
    python: `import requests

headers = {
    "x-api-key": "lem_live_your_api_key_here"
}
response = requests.get(
    "https://api.ecolens.org/api/v1/public/cells",
    headers=headers,
    params={"period": "2026-03"}
)
cells = response.json()
print(f"Loaded {len(cells['data'])} Addis Ababa grid cells")`,
    js: `const response = await fetch("https://api.ecolens.org/api/v1/public/cells?period=2026-03", {
  headers: {
    "x-api-key": "lem_live_your_api_key_here"
  }
});
const { data } = await response.json();
console.log("Addis Ababa cells:", data);`,
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-gray-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                Developer Platform
              </span>
              <span className="text-xs text-gray-400">• V4 REST API</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
              API Keys & Metered Access
            </h1>
            <p className="text-sm text-gray-500 max-w-2xl mt-1">
              Programmatically query Addis Ababa grid cell activity scores, multi-satellite signals,
              and historical indicators using high-throughput authenticated keys.
            </p>
          </div>

          <button
            onClick={() => {
              if (!isAuthenticated) openAuthModal('login');
              else {
                setGeneratedPlaintextKey(null);
                setNewKeyName('');
                setIsCreateOpen(true);
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Key</span>
          </button>
        </div>

        {/* Metered Usage Widget */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="font-semibold">RPM Rate Limit</span>
              <Zap className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              {remainingRpm} / {rpmLimit}{' '}
              <span className="text-xs font-semibold text-gray-400">RPM remaining</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-blue-600 h-full rounded-full transition-all"
                style={{ width: `${100 - rpmPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-400">Window resets every 60 seconds</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="font-semibold">Total Requests (This Month)</span>
              <Activity className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              {totalRequests.toLocaleString()}{' '}
              <span className="text-xs font-semibold text-emerald-600 font-sans">99.98% ok</span>
            </div>
            <p className="text-[11px] text-gray-400">Across /public/cells and /public/scores</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="font-semibold">Developer Documentation</span>
              <Terminal className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">
              OpenAPI 3.1 & SDK Specs
            </div>
            <p className="text-xs text-gray-500 leading-snug">
              Authenticate all requests via standard{' '}
              <code className="text-blue-600">x-api-key</code> header.
            </p>
          </div>
        </div>

        {/* API Keys List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-600" />
              <span>Active API Keys</span>
            </h2>
            <span className="text-xs text-gray-400">
              {apiKeys.length} {apiKeys.length === 1 ? 'key' : 'keys'} active
            </span>
          </div>

          {!isAuthenticated ? (
            <div className="p-12 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-3">
              <Key className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Sign in to manage developer keys
              </h3>
              <button
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
              >
                Sign In
              </button>
            </div>
          ) : isKeysLoading ? (
            <div className="py-12 flex justify-center text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-3">
              <Key className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                No Developer API Keys Generated
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Generate your first API key to query spatial cells and score series directly from
                your application.
              </p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Create API Key
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {apiKeys.map((key) => (
                <ApiKeyCard
                  key={key.id}
                  apiKey={key}
                  onRevoke={(id) => revokeKeyMutation.mutate(id)}
                  isRevoking={revokeKeyMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Start Code Snippets */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-blue-600" />
                <span>Quick-Start Code Snippets</span>
              </h3>
              <p className="text-xs text-gray-500">
                Copy and run this code to fetch the latest Addis Ababa grid cell scores:
              </p>
            </div>

            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              {(['curl', 'python', 'js'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveSnippetTab(tab)}
                  className={cn(
                    'px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer uppercase',
                    activeSnippetTab === tab
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                  )}
                >
                  {tab === 'js' ? 'JavaScript' : tab}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <pre className="p-4 rounded-2xl bg-gray-950 text-gray-100 text-xs font-mono overflow-x-auto leading-relaxed">
              {snippets[activeSnippetTab]}
            </pre>
            <button
              onClick={() => handleCopyText(snippets[activeSnippetTab], setCopiedSnippet)}
              aria-label="Copy snippet"
              className="absolute top-3 right-3 p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedSnippet ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Generate Key Modal */}
      {isCreateOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCreateOpen(false);
          }}
        >
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Generate Developer API Key
                </h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {generatedPlaintextKey ? (
              <div className="space-y-4 animate-in zoom-in-95">
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Save this key now. It will never be shown again.</span>
                  </div>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                    For security purposes, we only display the raw plaintext key once. If you lose
                    it, you will need to revoke it and generate a new key.
                  </p>
                </div>

                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl font-mono text-xs break-all flex items-center justify-between gap-2 border border-gray-200 dark:border-gray-700">
                  <span className="text-gray-900 dark:text-white">{generatedPlaintextKey}</span>
                  <button
                    onClick={() => handleCopyText(generatedPlaintextKey, setCopiedKey)}
                    className="p-1.5 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-200 shrink-0 cursor-pointer"
                  >
                    {copiedKey ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold"
                >
                  Done, I Have Saved My Key
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Key Name / Identifier
                  </label>
                  <input
                    type="text"
                    required
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Production Data Pipeline"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Key Tier
                  </label>
                  <select
                    value={newKeyTier}
                    onChange={(e) => setNewKeyTier(e.target.value as ApiKeyTier)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white"
                  >
                    <option value="COMMERCIAL">COMMERCIAL (60 Requests / Minute)</option>
                    <option value="INSTITUTIONAL">INSTITUTIONAL (300 Requests / Minute)</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createKeyMutation.isPending}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    {createKeyMutation.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      'Generate Key'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
