/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Pin, Tag, BookOpen, Sparkles, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Note, NoteCategory } from '../../types';
import { MarkdownEditor, MarkdownPreview } from '../MarkdownEditor';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note?: Note | null;
  defaultCategory?: NoteCategory;
}

const TEMPLATES: { label: string; template: string }[] = [
  {
    label: 'Daily Gratitude',
    template: `### Morning Intention
What is the single most meaningful focus today?

### Three Things I am Grateful For
1. 
2. 
3. 

### Evening Reflection
- What went well?
- What could I improve tomorrow?`,
  },
  {
    label: 'Meeting Minutes',
    template: `### Meeting: [Topic]
**Date**: ${new Date().toLocaleDateString()}
**Attendees**: 

### Agenda & Key Discussions
- 

### Action Items
- [ ] Task 1 (Assignee, Due Date)
- [ ] Task 2`,
  },
  {
    label: 'Idea Brainstorm',
    template: `### Core Concept
What problem does this solve?

### Key Features / MVP Scope
1. 
2. 

### Next Steps / Validation
- `,
  },
];

export const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose, note, defaultCategory }) => {
  const { addNote, updateNote } = useApp();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteCategory>(defaultCategory || 'general');
  const [pinned, setPinned] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setCategory(note.category);
      setPinned(note.pinned);
      setTags(note.tags || []);
    } else {
      setTitle('');
      setContent('');
      setCategory(defaultCategory || 'general');
      setPinned(false);
      setTags([]);
    }
    setIsPreview(false);
    setError('');
  }, [note, isOpen, defaultCategory]);

  if (!isOpen) return null;

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleInsertTemplate = (tmpl: string) => {
    setContent((prev) => (prev ? `${prev}\n\n${tmpl}` : tmpl));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) {
      setError('Please provide at least a title or content for your note');
      return;
    }

    const noteTitle = title.trim() || 'Untitled Note';

    if (note) {
      await updateNote({
        ...note,
        title: noteTitle,
        content,
        category,
        pinned,
        tags,
      });
    } else {
      await addNote({
        title: noteTitle,
        content,
        category,
        pinned,
        tags,
      });
    }

    onClose();
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-2xl max-h-[92vh] flex flex-col bg-modal-theme rounded-2xl border border-theme shadow-2xl p-6 text-primary-theme"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-theme shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight">
              {note ? 'Edit Note' : 'New Note / Journal Entry'}
            </h2>
            <button
              type="button"
              onClick={() => setPinned(!pinned)}
              className={`p-1.5 rounded-lg border transition-colors ${
                pinned
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-500'
                  : 'border-theme text-secondary-theme hover:bg-card-hover'
              }`}
              title={pinned ? 'Pinned to top' : 'Pin note'}
            >
              <Pin className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-secondary-theme hover:bg-card-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Templates helper */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
          <span className="text-xs text-secondary-theme font-medium flex items-center gap-1 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-accent-theme" /> Quick Template:
          </span>
          {TEMPLATES.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => handleInsertTemplate(t.template)}
              className="text-xs px-2.5 py-1 rounded-lg bg-card-theme border border-theme text-secondary-theme hover:bg-card-hover hover:text-primary-theme transition-colors whitespace-nowrap"
            >
              + {t.label}
            </button>
          ))}
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="mt-3 flex-1 flex flex-col space-y-3 min-h-0">
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <input
              type="text"
              placeholder="Note Title..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              className="flex-1 px-3.5 py-2 rounded-xl bg-input-theme border border-theme focus:outline-hidden focus:ring-2 ring-accent-theme text-base font-semibold"
              autoFocus
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as NoteCategory)}
              className="px-3 py-2 rounded-xl bg-input-theme border border-theme focus:outline-hidden focus:ring-2 ring-accent-theme text-sm"
            >
              <option value="general">General Note</option>
              <option value="work">Work & Projects</option>
              <option value="personal">Personal</option>
              <option value="ideas">Ideas & Scratch</option>
              <option value="journal">Daily Journal</option>
            </select>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center justify-between text-xs text-secondary-theme shrink-0">
            <div className="flex items-center gap-1 bg-secondary-theme p-0.5 rounded-lg border border-theme">
              <button
                type="button"
                onClick={() => setIsPreview(false)}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  !isPreview ? 'bg-card-theme text-primary-theme shadow-xs' : 'hover:text-primary-theme'
                }`}
              >
                Write (Markdown)
              </button>
              <button
                type="button"
                onClick={() => setIsPreview(true)}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  isPreview ? 'bg-card-theme text-primary-theme shadow-xs' : 'hover:text-primary-theme'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 inline mr-1" /> Preview
              </button>
            </div>
            <span>{wordCount} words · {content.length} chars</span>
          </div>

          {/* Editor Area */}
          <div className="flex-1 min-h-[220px]">
            {!isPreview ? (
              <MarkdownEditor
                value={content}
                onChange={setContent}
                placeholder="Write your thoughts, meeting notes, or journal entry..."
                className="h-full"
                showPreviewToggle={false}
              />
            ) : (
              <div className="w-full h-full p-4 rounded-xl bg-card-theme border border-theme overflow-y-auto text-primary-theme">
                {content ? <MarkdownPreview content={content} /> : <span className="text-muted-theme italic">No content to preview</span>}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="shrink-0">
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-light-theme text-accent-theme border border-accent-light-theme"
                >
                  <Tag className="w-3 h-3" />
                  {t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-500 ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add tag and press Enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="flex-1 px-3 py-1.5 rounded-lg bg-input-theme border border-theme text-xs focus:outline-hidden focus:ring-1 ring-accent-theme"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 rounded-lg bg-card-hover border border-theme text-xs font-medium hover:bg-secondary-theme"
              >
                Add Tag
              </button>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-theme shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-secondary-theme hover:bg-card-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-accent-theme text-white hover:bg-accent-hover transition-colors shadow-sm"
            >
              {note ? 'Save Changes' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
