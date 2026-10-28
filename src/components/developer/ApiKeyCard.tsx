import { useState } from 'react';
import { Key, Trash2, Copy, Check, Clock, Zap } from 'lucide-react';

import type { ApiKey } from '@/types';
import { cn } from '@/lib/utils';

interface ApiKeyCardProps {
  apiKey: ApiKey;
  onRevoke: (id: string) => void;
  isRevoking?: boolean;
}

export default function ApiKeyCard({ apiKey, onRevoke, isRevoking }: ApiKeyCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isInstitutional = apiKey.tier === 'INSTITUTIONAL';
  const rpm = apiKey.rpmLimit || (isInstitutional ? 300 : 60);

  return (
    <div
      data-testid={`api-key-card-${apiKey.id}`}
      className="p-5 rounded-2xl border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs hover:border-blue-200 dark:hover:border-blue-900 transition-all space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
              isInstitutional
                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                : 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
            )}
          >
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">{apiKey.name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-xs text-gray-500">{apiKey.keyPrefix}••••••••</span>
              {apiKey.keyPlaintext && (
                <button
                  onClick={() => handleCopy(apiKey.keyPlaintext!)}
                  aria-label="Copy API Key"
                  className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded cursor-pointer"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Rate Limit Badge */}
          <span
            className={cn(
              'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border',
              isInstitutional
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300'
                : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300'
            )}
          >
            <Zap className="w-3 h-3" />
            <span>{rpm} RPM Limit</span>
          </span>

          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
            {apiKey.tier}
          </span>

          <button
            onClick={() => onRevoke(apiKey.id)}
            disabled={isRevoking}
            aria-label="Revoke key"
            className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>Created on {new Date(apiKey.createdAt).toLocaleDateString()}</span>
        </span>

        {apiKey.lastUsedAt ? (
          <span>Last used {new Date(apiKey.lastUsedAt).toLocaleDateString()}</span>
        ) : (
          <span>Never used yet</span>
        )}
      </div>
    </div>
  );
}
