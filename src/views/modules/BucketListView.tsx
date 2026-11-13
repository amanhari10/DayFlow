/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Compass, Plus, CheckCircle2, Circle, Trash2, MapPin, Calendar, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BucketListItem } from '../../types';
import { triggerCelebration } from '../../utils/helpers';

export const BucketListView: React.FC = () => {
  const { bucketList, addBucketItem, updateBucketItem, deleteBucketItem } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BucketListItem | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<BucketListItem['category']>('Adventure');
  const [location, setLocation] = useState('');
  const [targetYear, setTargetYear] = useState<number | undefined>(new Date().getFullYear() + 2);
  const [notes, setNotes] = useState('');

  const openCreateModal = () => {
    setEditingItem(null);
    setTitle('');
    setDescription('');
    setCategory('Adventure');
    setLocation('');
    setTargetYear(new Date().getFullYear() + 2);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleToggleCompleted = async (item: BucketListItem) => {
    const isNow = !item.completed;
    await updateBucketItem({
      ...item,
      completed: isNow,
      completedDate: isNow ? new Date().toISOString().split('T')[0] : undefined,
    });
    if (isNow) triggerCelebration();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingItem) {
      await updateBucketItem({
        ...editingItem,
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        location: location.trim() || undefined,
        targetYear: targetYear || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      await addBucketItem({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        location: location.trim() || undefined,
        targetYear: targetYear || undefined,
        notes: notes.trim() || undefined,
        completed: false,
      });
    }

    setIsModalOpen(false);
  };

  const completedCount = bucketList.filter((b) => b.completed).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-theme flex items-center gap-2">
            <Compass className="w-7 h-7 text-accent-theme" /> Lifetime Bucket List
          </h2>
          <p className="text-xs sm:text-sm text-secondary-theme mt-1">
            Dream adventures, bold experiences, and lifetime pursuits. ({completedCount}/{bucketList.length} completed)
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Bucket Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {bucketList.map((item) => (
          <div
            key={item.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              item.completed
                ? 'bg-secondary-theme/30 border-subtle-theme opacity-80'
                : 'bg-card-theme border-theme shadow-xs hover:border-strong-theme'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-secondary-theme text-secondary-theme">
                  {item.category}
                </span>
                {item.targetYear && (
                  <span className="text-[11px] font-mono text-muted-theme">Target: {item.targetYear}</span>
                )}
              </div>

              <div className="flex items-start gap-2.5 mt-3">
                <button
                  onClick={() => handleToggleCompleted(item)}
                  className="mt-0.5 text-secondary-theme hover:text-accent-theme shrink-0"
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-theme" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <h3
                    className={`font-bold text-sm leading-snug ${
                      item.completed ? 'line-through text-muted-theme' : 'text-primary-theme'
                    }`}
                  >
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-secondary-theme mt-1 line-clamp-2">{item.description}</p>
                  )}
                  {item.location && (
                    <span className="text-[11px] text-muted-theme flex items-center gap-1 mt-1.5">
                      <MapPin className="w-3 h-3 text-rose-500" /> {item.location}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-theme flex items-center justify-between text-xs text-secondary-theme">
              {item.completedDate ? (
                <span className="text-[11px] text-emerald-500 font-semibold">Done on {item.completedDate}</span>
              ) : (
                <span className="text-[11px] text-muted-theme">Active Goal</span>
              )}
              <button
                onClick={() => deleteBucketItem(item.id)}
                className="p-1 rounded text-secondary-theme hover:text-rose-500"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-modal-theme rounded-2xl border border-theme p-6 text-primary-theme shadow-2xl space-y-4">
            <h3 className="font-bold text-lg">Add to Bucket List</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Item Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scuba dive in Great Barrier Reef"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs"
                  >
                    <option value="Adventure">Adventure</option>
                    <option value="Travel">Travel</option>
                    <option value="Skills">Skills</option>
                    <option value="Experiences">Experiences</option>
                    <option value="Creative">Creative</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Target Year</label>
                  <input
                    type="number"
                    min="2020"
                    max="2070"
                    value={targetYear || ''}
                    onChange={(e) => setTargetYear(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Location (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Queensland, Australia"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Notes / Gear</label>
                <textarea
                  rows={2}
                  placeholder="Any key details, links, or preparations..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme text-xs resize-none"
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
                  Save to Bucket List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
