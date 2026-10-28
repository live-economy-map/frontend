// src/components/saved-areas/SavedAreasDrawer.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { savedAreasApi } from '@/api/savedAreas.api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatApiError } from '@/lib/axios';
import { X, Bookmark, Trash2, Edit2, Check, MapPin, ExternalLink, Loader2 } from 'lucide-react';

import type { SavedArea } from '@/types';
import { ROUTES } from '@/constants';

interface SavedAreasDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCell?: (cellId: string) => void;
}

export default function SavedAreasDrawer({ isOpen, onClose, onSelectCell }: SavedAreasDrawerProps) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');

  const {
    data: savedAreas = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['saved-areas'],
    queryFn: () => savedAreasApi.getSavedAreas(),
    enabled: isOpen && isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => savedAreasApi.deleteSavedArea(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-areas'] });
      toast.success('Saved area removed from bookmarks.');
    },
    onError: (err) => {
      toast.error(formatApiError(err), { title: 'Failed to delete' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, customName, notes }: { id: string; customName?: string; notes?: string }) =>
      savedAreasApi.updateSavedArea(id, { customName, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-areas'] });
      setEditingId(null);
      toast.success('Saved area updated.');
    },
    onError: (err) => {
      toast.error(formatApiError(err), { title: 'Failed to update' });
    },
  });

  if (!isOpen) return null;

  const handleStartEdit = (area: SavedArea) => {
    setEditingId(area.id);
    setEditName(area.customName || '');
    setEditNotes(area.notes || '');
  };

  const handleSaveEdit = (id: string) => {
    updateMutation.mutate({
      id,
      customName: editName.trim() || undefined,
      notes: editNotes.trim() || undefined,
    });
  };

  const handleCellClick = (cellId: string) => {
    onClose();
    if (onSelectCell) {
      onSelectCell(cellId);
    }
    if (location.pathname !== ROUTES.MAP) {
      navigate(`${ROUTES.MAP}?cellId=${cellId}`);
    } else {
      const url = new URL(window.location.href);
      url.searchParams.set('cellId', cellId);
      window.history.pushState({}, '', url);
      // Trigger popstate so listeners update
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="saved-areas-drawer-title"
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col border-l border-gray-100 dark:border-gray-800 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Bookmark className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2
                id="saved-areas-drawer-title"
                className="text-base font-bold text-gray-900 dark:text-white"
              >
                Saved Areas & Bookmarks
              </h2>
              <p className="text-xs text-gray-500">
                {savedAreas.length} {savedAreas.length === 1 ? 'cell' : 'cells'} bookmarked
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close saved areas drawer"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!isAuthenticated ? (
            <div className="text-center py-12 px-4 space-y-4">
              <Bookmark className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Sign In Required</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Sign in or register to bookmark Addis Ababa grid cells, monitor anomalies, and
                receive custom intelligence reports.
              </p>
              <button
                onClick={() => {
                  onClose();
                  openAuthModal('login');
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer transition-all"
              >
                Sign In / Register
              </button>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-xs">Loading your saved areas…</p>
            </div>
          ) : isError ? (
            <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-xs">
              Failed to load saved areas. Please check your network and try again.
            </div>
          ) : savedAreas.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center mx-auto">
                <Bookmark className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                No Saved Areas Yet
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                Explore the Addis Ababa map, click on any grid cell, and click "Save Area /
                Bookmark" to monitor it here.
              </p>
              <button
                onClick={() => {
                  onClose();
                  navigate(ROUTES.MAP);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold text-xs rounded-xl hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <span>Go to Map</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {savedAreas.map((area) => {
                const isEditing = editingId === area.id;
                const score = area.cell?.compositeScore ?? 0;
                const scoreFormatted = (score * 100).toFixed(1);

                return (
                  <div
                    key={area.id}
                    className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-850 shadow-xs hover:border-blue-200 dark:hover:border-blue-900 transition-all space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              placeholder="Custom area name (e.g. Bole Medhanealem)"
                              className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                            <textarea
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              placeholder="Notes or research prompt for this cell…"
                              rows={2}
                              className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleSaveEdit(area.id)}
                                disabled={updateMutation.isPending}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 cursor-pointer"
                              >
                                {updateMutation.isPending ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <>
                                    <Check className="w-3 h-3" /> Save
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-semibold cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                {area.customName ||
                                  area.cell?.areaLabel ||
                                  `Cell ${area.gridCellId.slice(0, 8)}`}
                              </h4>
                              {area.customName && area.cell?.areaLabel && (
                                <span className="text-[10px] text-gray-400 font-medium truncate">
                                  ({area.cell.areaLabel})
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                              <span className="font-mono">ID: {area.gridCellId.slice(0, 10)}</span>
                              {area.cell?.cellRow !== undefined && (
                                <span>
                                  • R{area.cell.cellRow} C{area.cell.cellCol}
                                </span>
                              )}
                            </div>
                            {area.notes && (
                              <p className="text-xs text-gray-600 dark:text-gray-300 italic mt-1.5 line-clamp-2">
                                "{area.notes}"
                              </p>
                            )}
                          </>
                        )}
                      </div>

                      {/* Score Badge */}
                      {!isEditing && (
                        <div className="shrink-0 text-right">
                          <span
                            className="inline-block px-2 py-0.5 rounded-full text-xs font-bold border"
                            style={{
                              backgroundColor:
                                score >= 0.7
                                  ? '#F5A34A15'
                                  : score >= 0.4
                                    ? '#F3D96A15'
                                    : '#69C79A15',
                              borderColor:
                                score >= 0.7
                                  ? '#F5A34A40'
                                  : score >= 0.4
                                    ? '#F3D96A40'
                                    : '#69C79A40',
                              color:
                                score >= 0.7 ? '#F5A34A' : score >= 0.4 ? '#C5A015' : '#43B982',
                            }}
                          >
                            {scoreFormatted}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Bar */}
                    {!isEditing && (
                      <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-800">
                        <button
                          onClick={() => handleCellClick(area.gridCellId)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Fly to Cell on Map</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStartEdit(area)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                            aria-label="Edit notes"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate(area.id)}
                            disabled={deleteMutation.isPending}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                            aria-label="Delete saved area"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
