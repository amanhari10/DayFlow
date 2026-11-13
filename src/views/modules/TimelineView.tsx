/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { History, Plus, Star, Calendar, Trash2, Tag, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TimelineMemory } from '../../types';
import { formatReadableDate, getTodayDateString } from '../../utils/helpers';

export const TimelineView: React.FC = () => {
  const { timelineMemories, addMemory, deleteMemory } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TimelineMemory['category']>('Milestone');
  const [imageEmoji, setImageEmoji] = useState('🌟');
  const [rating, setRating] = useState(5);
  const [tagsInput, setTagsInput] = useState('');

  const sortedMemories = [...timelineMemories].sort((a, b) => b.date.localeCompare(a.date));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    await addMemory({
      title: title.trim(),
      date,
      description: description.trim(),
      category,
      imageEmoji: imageEmoji.trim() || '🌟',
      rating,
      tags,
    });

    setIsModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-theme flex items-center gap-2">
            <History className="w-7 h-7 text-accent-theme" /> Life Timeline & Memories
          </h2>
          <p className="text-xs sm:text-sm text-secondary-theme mt-1">
            Chronicle pivotal life milestones, travels, breakthroughs, and memorable stories.
          </p>
        </div>

        <button
          onClick={() => {
            setTitle('');
            setDate(getTodayDateString());
            setDescription('');
            setCategory('Milestone');
            setImageEmoji('🌟');
            setRating(5);
            setTagsInput('');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Memory
        </button>
      </div>

      {sortedMemories.length === 0 ? (
        <div className="py-16 text-center text-secondary-theme bg-card-theme rounded-2xl border border-theme">
          <History className="w-10 h-10 mx-auto text-muted-theme opacity-30 mb-3" />
          <p className="text-base font-semibold text-primary-theme">No Memories Logged</p>
          <p className="text-xs text-muted-theme mt-1">Record life breakthroughs, trips, and cherished days.</p>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 border-l-2 border-theme space-y-8 my-4 ml-4">
          {sortedMemories.map((mem) => (
            <div key={mem.id} className="relative group">
              {/* Dot Icon on Timeline */}
              <div className="absolute -left-[35px] sm:-left-[43px] top-1.5 w-8 h-8 rounded-full bg-card-theme border-2 border-accent-theme flex items-center justify-center text-sm shadow-xs">
                {mem.imageEmoji}
              </div>

              {/* Memory Card */}
              <div className="bg-card-theme rounded-2xl border border-theme p-5 shadow-xs hover:border-strong-theme transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-accent-theme font-mono">
                      {formatReadableDate(mem.date)}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-secondary-theme text-secondary-theme">
                      {mem.category}
                    </span>
                    <div className="flex items-center text-amber-400">
                      {Array.from({ length: mem.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteMemory(mem.id)}
                    className="p-1 rounded text-secondary-theme hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity self-end sm:self-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-primary-theme mt-2">{mem.title}</h3>
                <p className="text-xs text-secondary-theme mt-1 leading-relaxed whitespace-pre-line">
                  {mem.description}
                </p>

                {mem.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-subtle-theme flex-wrap">
                    {mem.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-secondary-theme text-secondary-theme"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-modal-theme rounded-2xl border border-theme p-6 text-primary-theme shadow-2xl space-y-4">
            <h3 className="font-bold text-lg">Add Life Memory</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Memory Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summited Mount Fuji"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs"
                  >
                    <option value="Milestone">Milestone</option>
                    <option value="Travel">Travel</option>
                    <option value="Career">Career</option>
                    <option value="Family">Family</option>
                    <option value="Achievement">Achievement</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Emoji Icon</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={imageEmoji}
                    onChange={(e) => setImageEmoji(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Rating (1-5)</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
                    <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
                    <option value={3}>⭐⭐⭐ 3 Stars</option>
                    <option value={2}>⭐⭐ 2 Stars</option>
                    <option value={1}>⭐ 1 Star</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Story / Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="What happened? Why was it unforgettable?..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme text-xs resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Japan, Travel, Climbing"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3.5 py-1.5 rounded-xl bg-input-theme border border-theme text-xs"
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
                  Save Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
