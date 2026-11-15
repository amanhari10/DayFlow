import React, { useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export const PwaUpdatePrompt: React.FC = () => {
  const [serviceWorkerError, setServiceWorkerError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.error('DayFlow service worker registration failed:', error);
      setServiceWorkerError('Offline support could not start in this browser.');
    },
  });

  if (!needRefresh && !offlineReady && !serviceWorkerError) return null;

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateServiceWorker(true);
    } catch (error) {
      console.error('DayFlow service worker update failed:', error);
      setServiceWorkerError('The update could not be applied. Try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const dismiss = () => {
    setNeedRefresh(false);
    setOfflineReady(false);
    setServiceWorkerError(null);
  };

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed inset-x-3 bottom-3 z-[80] mx-auto flex max-w-lg items-center gap-3 rounded-2xl border border-theme bg-modal-theme p-3 text-primary-theme shadow-xl sm:inset-x-auto sm:right-5 sm:bottom-5"
    >
      <p className="min-w-0 flex-1 text-sm">
        {serviceWorkerError || (needRefresh
          ? 'A new DayFlow version is ready.'
          : 'DayFlow is ready to work offline.')}
      </p>
      {needRefresh && (
        <button
          type="button"
          onClick={() => void handleUpdate()}
          disabled={isUpdating}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-accent-theme px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
          Reload to update
        </button>
      )}
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss update message"
        className="shrink-0 rounded-lg p-2 text-secondary-theme transition-colors hover:bg-card-hover hover:text-primary-theme"
      >
        <X className="h-4 w-4" />
      </button>
    </aside>
  );
};
