/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Pin,
  Tag,
  Trash2,
  Edit3,
  Calendar,
  BookOpen,
  Sparkles,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Note, NoteCategory } from '../types';
import { formatReadableDate } from '../utils/helpers';
import { NoteModal } from '../components/modals/NoteModal';
import { MarkdownEditor } from '../components/MarkdownEditor';

const CATEGORIES: { label: string; value: NoteCategory }[] = [
  { label: 'All Notes', value: 'all' as any },
  { label: 'General', value: 'general' },
  { label: 'Work', value: 'work' },
  { label: 'Personal', value: 'personal' },
  { label: 'Ideas', value: 'ideas' },
  { label: 'Daily Journal', value: 'journal' },
];

export const NotesView: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote, togglePinNote, setEditingNote, editingNote } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Active note in split-view inline editor
  const [activeContent, setActiveContent] = useState('');
  const [activeTitle, setActiveTitle] = useState('');
  const [activeCategoryState, setActiveCategoryState] = useState<NoteCategory>('general');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving'>('saved');

  // Filter notes
  const filteredNotes = useMemo(() => {
    return notes
      .filter((n) => {
        if (activeCategory !== 'all' && n.category !== activeCategory) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = n.title.toLowerCase().includes(q);
          const matchContent = n.content.toLowerCase().includes(q);
          const matchTag = n.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchContent && !matchTag) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Pinned notes first, then latest updated
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [notes, activeCategory, searchQuery]);

  // Set default selected note if none selected
  useEffect(() => {
    if (filteredNotes.length > 0 && !selectedNoteId) {
      const first = filteredNotes[0];
      setSelectedNoteId(first.id);
      setActiveTitle(first.title);
      setActiveContent(first.content);
      setActiveCategoryState(first.category);
    } else if (filteredNotes.length === 0) {
      setSelectedNoteId(null);
      setActiveTitle('');
      setActiveContent('');
    }
  }, [filteredNotes, selectedNoteId]);

  // When selection changes
  const handleSelectNote = (n: Note) => {
    setSelectedNoteId(n.id);
    setActiveTitle(n.title);
    setActiveContent(n.content);
    setActiveCategoryState(n.category);
  };

  // Safe Autosave debounce
  useEffect(() => {
    if (!selectedNoteId) return;
    const current = notes.find((n) => n.id === selectedNoteId);
    if (!current) return;

    if (current.title === activeTitle && current.content === activeContent && current.category === activeCategoryState) {
      return;
    }

    setAutoSaveStatus('saving');
    const timer = setTimeout(async () => {
      await updateNote({
        ...current,
        title: activeTitle.trim() || 'Untitled Note',
        content: activeContent,
        category: activeCategoryState,
      });
      setAutoSaveStatus('saved');
    }, 600);

    return () => clearTimeout(timer);
  }, [activeTitle, activeContent, activeCategoryState, selectedNoteId, notes, updateNote]);

  const activeNote = notes.find((n) => n.id === selectedNoteId);

  const wordCount = activeContent.trim() ? activeContent.trim().split(/\s+/).length : 0;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-theme">
            Notes & Journal
          </h2>
          <p className="text-xs sm:text-sm text-secondary-theme mt-1">
            Capture thoughts, project documentation, meeting summaries, and daily gratitude reflections with autosave.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> New Note / Journal
        </button>
      </div>

      {/* Categories Toolbar */}
      <div className="flex items-center gap-1.5 p-1 bg-secondary-theme rounded-xl border border-theme overflow-x-auto text-xs font-semibold">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setActiveCategory(c.value)}
            className={`px-3 py-1.5 rounded-lg capitalize transition-colors whitespace-nowrap ${
              activeCategory === c.value
                ? 'bg-card-theme text-primary-theme shadow-xs font-bold'
                : 'text-secondary-theme hover:text-primary-theme'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Split View Layout: Left Notes List, Right Active Document */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[580px]">
        {/* Left Column: List (4 cols) */}
        <div className="lg:col-span-4 bg-card-theme rounded-2xl border border-theme shadow-xs flex flex-col overflow-hidden max-h-[700px]">
          {/* Search Bar */}
          <div className="p-3 border-b border-theme relative">
            <Search className="w-3.5 h-3.5 absolute left-6 top-5 text-secondary-theme" />
            <input
              type="text"
              placeholder="Search in notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-input-theme border border-theme text-xs focus:ring-1 ring-accent-theme focus:outline-hidden"
            />
          </div>

          {/* Notes items */}
          <div className="flex-1 overflow-y-auto divide-y divide-theme p-2 space-y-1">
            {filteredNotes.length === 0 ? (
              <div className="py-12 text-center text-secondary-theme">
                <FileText className="w-8 h-8 mx-auto text-muted-theme opacity-30 mb-2" />
                <p className="text-xs font-medium">No notes match your filter</p>
              </div>
            ) : (
              filteredNotes.map((n) => {
                const isSelected = n.id === selectedNoteId;
                return (
                  <div
                    key={n.id}
                    onClick={() => handleSelectNote(n)}
                    className={`p-3 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-accent-light-theme border border-accent-light-theme text-primary-theme shadow-xs'
                        : 'hover:bg-card-hover text-secondary-theme'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        className={`font-semibold text-xs sm:text-sm truncate ${
                          isSelected ? 'text-accent-theme font-bold' : 'text-primary-theme'
                        }`}
                      >
                        {n.title}
                      </h4>
                      {n.pinned && <Pin className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
                    </div>

                    <p className="text-[11px] text-secondary-theme line-clamp-2 mt-1 leading-relaxed">
                      {n.content || 'No content...'}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-muted-theme">
                      <span className="capitalize">{n.category}</span>
                      <span>{formatReadableDate(n.updatedAt.split('T')[0])}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Full Editor & Viewer (8 cols) */}
        <div className="lg:col-span-8 bg-card-theme rounded-2xl border border-theme shadow-xs flex flex-col p-6 overflow-hidden">
          {activeNote ? (
            <div className="flex-1 flex flex-col space-y-4">
              {/* Note Header Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-theme">
                <div className="flex items-center gap-2">
                  <select
                    value={activeCategoryState}
                    onChange={(e) => setActiveCategoryState(e.target.value as NoteCategory)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-secondary-theme border border-theme font-semibold capitalize focus:ring-1 ring-accent-theme focus:outline-hidden"
                  >
                    <option value="general">General</option>
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="ideas">Ideas</option>
                    <option value="journal">Daily Journal</option>
                  </select>

                  <span className="text-[11px] text-muted-theme flex items-center gap-1 font-mono">
                    {autoSaveStatus === 'saving' ? (
                      <span className="text-amber-500">Saving...</span>
                    ) : (
                      <span className="text-emerald-500 flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Saved
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePinNote(activeNote.id)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      activeNote.pinned
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                        : 'border-theme text-secondary-theme hover:bg-secondary-theme'
                    }`}
                    title={activeNote.pinned ? 'Unpin note' : 'Pin note'}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteNote(activeNote.id)}
                    className="p-1.5 rounded-lg border border-theme text-secondary-theme hover:text-rose-500 hover:bg-secondary-theme transition-colors"
                    title="Delete note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title input */}
              <input
                type="text"
                placeholder="Title..."
                value={activeTitle}
                onChange={(e) => setActiveTitle(e.target.value)}
                className="w-full text-xl sm:text-2xl font-extrabold bg-transparent text-primary-theme focus:outline-hidden"
              />

              <MarkdownEditor
                value={activeContent}
                onChange={setActiveContent}
                placeholder="Write ideas, thoughts, meeting agendas..."
                className="flex-1"
              />

              {/* Bottom word count & tags */}
              <div className="pt-3 border-t border-theme flex flex-col sm:flex-row sm:items-center justify-between text-xs text-muted-theme gap-2">
                <div className="flex items-center gap-3">
                  <span>{wordCount} words</span>
                  <span>·</span>
                  <span>{readTimeMinutes} min read</span>
                  <span>·</span>
                  <span>Last updated {formatReadableDate(activeNote.updatedAt.split('T')[0])}</span>
                </div>

                {activeNote.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {activeNote.tags.map((t) => (
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
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-secondary-theme p-8">
              <FileText className="w-12 h-12 text-muted-theme opacity-30 mb-3" />
              <p className="text-base font-semibold text-primary-theme">No Note Selected</p>
              <p className="text-xs text-muted-theme mt-1">
                Select an existing note from the list or create a fresh entry.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-xs"
              >
                + Create Note
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Note modal */}
      {(isAddModalOpen || editingNote) && (
        <NoteModal
          isOpen={isAddModalOpen || !!editingNote}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingNote(null);
          }}
          note={editingNote}
        />
      )}
    </div>
  );
};
