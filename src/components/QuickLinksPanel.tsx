import React, { useState } from 'react';
import { ExternalLink, Link2, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { QuickLink } from '../types';

export const QuickLinksPanel: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const addQuickLink = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedLabel = label.trim();
    const trimmedUrl = url.trim();

    if (!trimmedLabel || !trimmedUrl) {
      setError('Enter both a name and a website address.');
      return;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(/^https?:\/\//i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`);
    } catch {
      setError('Enter a valid website address.');
      return;
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      setError('Only HTTP and HTTPS links are supported.');
      return;
    }

    const link: QuickLink = {
      id: `quick-link-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      label: trimmedLabel,
      url: parsedUrl.href,
    };
    await updateSettings({ quickLinks: [...settings.quickLinks, link] });
    setLabel('');
    setUrl('');
    setError('');
  };

  const removeQuickLink = async (id: string) => {
    await updateSettings({ quickLinks: settings.quickLinks.filter((link) => link.id !== id) });
  };

  return (
    <div className="space-y-3">
      {settings.quickLinks.length > 0 ? (
        <ul className="space-y-2">
          {settings.quickLinks.map((link) => (
            <li key={link.id} className="flex items-center gap-2 rounded-lg bg-secondary-theme px-3 py-2">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-0 flex-1 items-center gap-2 text-sm text-accent-theme hover:underline"
              >
                <Link2 className="h-4 w-4 shrink-0" />
                <span className="truncate">{link.label}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </a>
              <button
                type="button"
                onClick={() => void removeQuickLink(link.id)}
                aria-label={`Remove ${link.label}`}
                title={`Remove ${link.label}`}
                className="rounded-md p-1 text-secondary-theme hover:bg-card-hover hover:text-rose-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-secondary-theme">No quick links yet. Add a website below.</p>
      )}

      <form onSubmit={addQuickLink} className="space-y-2">
        <input
          type="text"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder="Link name"
          aria-label="Quick link name"
          maxLength={60}
          className="w-full rounded-lg border border-theme bg-input-theme px-3 py-2 text-sm text-primary-theme"
        />
        <input
          type="text"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://example.com"
          aria-label="Quick link website address"
          maxLength={2048}
          className="w-full rounded-lg border border-theme bg-input-theme px-3 py-2 text-sm text-primary-theme"
        />
        {error && <p role="alert" className="text-xs text-rose-500">{error}</p>}
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-accent-theme px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add quick link
        </button>
      </form>
    </div>
  );
};
