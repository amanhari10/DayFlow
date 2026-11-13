/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShoppingBag, Plus, ExternalLink, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WishlistItem } from '../../types';
import { triggerCelebration } from '../../utils/helpers';
import { formatCurrency } from '../../utils/currency';

export const WishlistView: React.FC = () => {
  const { wishlist, addWishlistItem, updateWishlistItem, deleteWishlistItem, settings } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [estimatedCost, setEstimatedCost] = useState<number | ''>('');
  const [priority, setPriority] = useState<WishlistItem['priority']>('medium');
  const [reason, setReason] = useState('');
  const [url, setUrl] = useState('');

  const handleTogglePurchased = async (item: WishlistItem) => {
    const isNow = !item.purchased;
    await updateWishlistItem({
      ...item,
      purchased: isNow,
      purchasedDate: isNow ? new Date().toISOString().split('T')[0] : undefined,
    });
    if (isNow) triggerCelebration();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || estimatedCost === '') return;

    await addWishlistItem({
      title: title.trim(),
      estimatedCost: Number(estimatedCost),
      priority,
      reason: reason.trim(),
      purchased: false,
      url: url.trim() || undefined,
    });

    setIsModalOpen(false);
  };

  const totalValue = wishlist.reduce((acc, w) => acc + w.estimatedCost, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-theme flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-accent-theme" /> Wishlist & Purchase Planner
          </h2>
          <p className="text-xs sm:text-sm text-secondary-theme mt-1">
            Intentional spending manager. Track justified reasons and prevent impulse buying. (Total value: {formatCurrency(totalValue, settings.currency)})
          </p>
        </div>

        <button
          onClick={() => {
            setTitle('');
            setEstimatedCost('');
            setPriority('medium');
            setReason('');
            setUrl('');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Wishlist Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {wishlist.map((item) => (
          <div
            key={item.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              item.purchased
                ? 'bg-secondary-theme/30 border-subtle-theme opacity-75'
                : 'bg-card-theme border-theme shadow-xs hover:border-strong-theme'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    item.priority === 'high'
                      ? 'bg-rose-500/15 text-rose-500'
                      : item.priority === 'medium'
                      ? 'bg-amber-500/15 text-amber-500'
                      : 'bg-emerald-500/15 text-emerald-500'
                  }`}
                >
                  {item.priority} Priority
                </span>
                <span className="font-mono font-extrabold text-sm text-primary-theme">
                  {formatCurrency(item.estimatedCost, settings.currency)}
                </span>
              </div>

              <div className="flex items-start gap-2.5 mt-3">
                <button
                  onClick={() => handleTogglePurchased(item)}
                  className="mt-0.5 text-secondary-theme hover:text-accent-theme shrink-0"
                >
                  {item.purchased ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-theme" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <h3
                    className={`font-bold text-sm leading-snug ${
                      item.purchased ? 'line-through text-muted-theme' : 'text-primary-theme'
                    }`}
                  >
                    {item.title}
                  </h3>
                  {item.reason && (
                    <p className="text-xs text-secondary-theme mt-1.5 leading-relaxed bg-secondary-theme/40 p-2.5 rounded-xl">
                      &ldquo;{item.reason}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-theme flex items-center justify-between text-xs text-secondary-theme">
              {item.purchasedDate ? (
                <span className="text-[11px] text-emerald-500 font-semibold">Purchased {item.purchasedDate}</span>
              ) : (
                <span className="text-[11px] text-muted-theme">Deliberating</span>
              )}

              <div className="flex items-center gap-2">
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 rounded text-secondary-theme hover:text-accent-theme"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  onClick={() => deleteWishlistItem(item.id)}
                  className="p-1 rounded text-secondary-theme hover:text-rose-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-modal-theme rounded-2xl border border-theme p-6 text-primary-theme shadow-2xl space-y-4">
            <h3 className="font-bold text-lg">Add to Purchase Planner</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Item Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ergonomic Office Chair"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Estimated Cost ({settings.currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="350.00"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs"
                  >
                    <option value="high">High Need</option>
                    <option value="medium">Medium Want</option>
                    <option value="low">Nice to Have</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Why do you need this? (Justification)</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Prevents posture fatigue during 8h deep work..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme text-xs resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Link URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-theme">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-secondary-theme hover:bg-card-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:bg-accent-hover"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
