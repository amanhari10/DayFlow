/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Brain, Plus, ExternalLink, Bookmark, Tag, Trash2, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { KnowledgeItem } from '../../types';
import { formatReadableDate } from '../../utils/helpers';

export const KnowledgeView: React.FC = () => {
  const { knowledgeItems, addKnowledge, deleteKnowledge } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [title, setTitle] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [category, setCategory] = useState<KnowledgeItem['category']>('article');
  const [summary, setSummary] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [takeawaysInput, setTakeawaysInput] = useState('');

  const filteredItems = knowledgeItems.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSum = item.summary.toLowerCase().includes(q);
      const matchTag = item.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchSum && !matchTag) return false;
    }
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const keyTakeaways = takeawaysInput
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    await addKnowledge({
      title: title.trim(),
      sourceUrl: sourceUrl.trim() || undefined,
      category,
      summary: summary.trim(),
      tags,
      keyTakeaways,
    });

    setIsModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-theme flex items-center gap-2">
            <Brain className="w-7 h-7 text-accent-theme" /> Knowledge Hub / Second Brain
          </h2>
          <p className="text-xs sm:text-sm text-secondary-theme mt-1">
            Store distilled takeaways, mental models, papers, book notes, and key cheat sheets.
          </p>
        </div>

        <button
          onClick={() => {
            setTitle('');
            setSourceUrl('');
            setCategory('article');
            setSummary('');
            setTagsInput('');
            setTakeawaysInput('');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Knowledge Item
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-card-theme p-3 rounded-2xl border border-theme shadow-xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-secondary-theme" />
          <input
            type="text"
            placeholder="Search concepts, summaries, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-input-theme border border-theme text-xs"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="py-1.5 px-3 rounded-xl bg-input-theme border border-theme text-xs"
        >
          <option value="all">All Categories</option>
          <option value="article">Articles</option>
          <option value="book">Books</option>
          <option value="framework">Frameworks</option>
          <option value="cheat_sheet">Cheat Sheets</option>
          <option value="concept">Concepts</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-card-theme rounded-2xl border border-theme p-5 shadow-xs flex flex-col justify-between hover:border-strong-theme transition-all group"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-secondary-theme text-secondary-theme">
                  {item.category.replace('_', ' ')}
                </span>
                <span className="text-[10px] font-mono text-muted-theme">
                  {formatReadableDate(item.createdAt.split('T')[0])}
                </span>
              </div>

              <h3 className="text-base font-bold text-primary-theme mt-2.5 leading-snug">{item.title}</h3>
              <p className="text-xs text-secondary-theme mt-2 leading-relaxed">{item.summary}</p>

              {item.keyTakeaways.length > 0 && (
                <div className="mt-3.5 p-3 rounded-xl bg-secondary-theme/50 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-theme block">
                    Key Insights:
                  </span>
                  <ul className="text-xs text-secondary-theme space-y-1">
                    {item.keyTakeaways.map((takeaway, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-accent-theme mt-0.5">•</span>
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-theme flex items-center justify-between text-xs text-secondary-theme">
              <div className="flex items-center gap-1 flex-wrap">
                {item.tags.map((t) => (
                  <span key={t} className="text-[10px] px-1.5 py-0.2 rounded-md bg-accent-light-theme text-accent-theme">
                    #{t}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {item.sourceUrl && (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 rounded text-secondary-theme hover:text-accent-theme"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  onClick={() => deleteKnowledge(item.id)}
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
          <div className="w-full max-w-lg bg-modal-theme rounded-2xl border border-theme p-6 text-primary-theme shadow-2xl space-y-4">
            <h3 className="font-bold text-lg">Save to Second Brain</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Raft Consensus Algorithm Explained"
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
                    <option value="article">Article</option>
                    <option value="book">Book Summary</option>
                    <option value="framework">Framework</option>
                    <option value="cheat_sheet">Cheat Sheet</option>
                    <option value="concept">Core Concept</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Source Link (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Core Summary</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Brief synopsis in your own words..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme text-xs resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Key Takeaways (1 per line)</label>
                <textarea
                  rows={3}
                  placeholder="- Principle 1&#10;- Principle 2"
                  value={takeawaysInput}
                  onChange={(e) => setTakeawaysInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme text-xs resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="Distributed, Consensus, Architecture"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-input-theme border border-theme text-xs"
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
