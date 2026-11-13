/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Star,
  Search,
  BookMarked,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ReadingBook } from '../../types';
import { triggerCelebration } from '../../utils/helpers';

export const ReadingView: React.FC = () => {
  const { readingBooks, addBook, updateBook, deleteBook } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'reading' | 'to_read' | 'completed'>('reading');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<ReadingBook | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState(300);
  const [currentPage, setCurrentPage] = useState(0);
  const [status, setStatus] = useState<ReadingBook['status']>('reading');
  const [format, setFormat] = useState<ReadingBook['format']>('physical');
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [review, setReview] = useState('');

  const openAddModal = () => {
    setEditingBook(null);
    setTitle('');
    setAuthor('');
    setTotalPages(320);
    setCurrentPage(0);
    setStatus('reading');
    setFormat('physical');
    setRating(5);
    setReview('');
    setModalOpen(true);
  };

  const openEditModal = (book: ReadingBook) => {
    setEditingBook(book);
    setTitle(book.title);
    setAuthor(book.author);
    setTotalPages(book.totalPages);
    setCurrentPage(book.currentPage);
    setStatus(book.status);
    setFormat(book.format);
    setRating(book.rating);
    setReview(book.review || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isCompleted = Number(currentPage) >= Number(totalPages) || status === 'completed';

    if (editingBook) {
      await updateBook({
        ...editingBook,
        title: title.trim(),
        author: author.trim(),
        totalPages: Number(totalPages),
        currentPage: Math.min(Number(currentPage), Number(totalPages)),
        status: isCompleted ? 'completed' : status,
        format,
        rating: rating ? Number(rating) : undefined,
        review: review.trim() || undefined,
        finishDate: isCompleted ? (editingBook.finishDate || new Date().toISOString().slice(0, 10)) : undefined,
      });
    } else {
      await addBook({
        title: title.trim(),
        author: author.trim(),
        totalPages: Number(totalPages),
        currentPage: Math.min(Number(currentPage), Number(totalPages)),
        status: isCompleted ? 'completed' : status,
        format,
        rating: rating ? Number(rating) : undefined,
        review: review.trim() || undefined,
        startDate: new Date().toISOString().slice(0, 10),
        finishDate: isCompleted ? new Date().toISOString().slice(0, 10) : undefined,
      });
    }
    setModalOpen(false);
  };

  const handleQuickPageProgress = async (book: ReadingBook, delta: number) => {
    const newPage = Math.max(0, Math.min(book.totalPages, book.currentPage + delta));
    const nowDone = newPage >= book.totalPages;
    if (nowDone && book.status !== 'completed') {
      triggerCelebration();
    }
    await updateBook({
      ...book,
      currentPage: newPage,
      status: nowDone ? 'completed' : book.status,
      finishDate: nowDone ? new Date().toISOString().slice(0, 10) : book.finishDate,
    });
  };

  const filteredBooks = useMemo(() => {
    return readingBooks
      .filter((b) => {
        const matchesTab = activeTab === 'all' || b.status === activeTab;
        const matchesSearch =
          b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (b.review && b.review.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesTab && matchesSearch;
      })
      .sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }, [readingBooks, activeTab, searchQuery]);

  // Aggregate stats
  const completedCount = useMemo(() => readingBooks.filter((b) => b.status === 'completed').length, [readingBooks]);
  const currentlyReadingCount = useMemo(() => readingBooks.filter((b) => b.status === 'reading').length, [readingBooks]);
  const totalPagesRead = useMemo(
    () => readingBooks.reduce((acc, b) => acc + (b.status === 'completed' ? b.totalPages : b.currentPage), 0),
    [readingBooks]
  );

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-accent-theme uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Health & Lifestyle</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-theme">
            Reading Tracker & Library
          </h1>
          <p className="text-xs sm:text-sm text-secondary-theme mt-1">
            Track books in progress, page milestones, reviews, and reading goals.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-theme text-white text-sm font-semibold hover:opacity-95 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Book</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-card border border-theme shadow-xs">
          <div className="flex items-center justify-between text-secondary-theme text-xs font-medium">
            <span>Books Completed</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-primary-theme mt-2">{completedCount}</p>
          <span className="text-[11px] text-emerald-500 font-semibold">Finished reads</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-theme shadow-xs">
          <div className="flex items-center justify-between text-secondary-theme text-xs font-medium">
            <span>In Progress</span>
            <BookMarked className="w-4 h-4 text-accent-theme" />
          </div>
          <p className="text-2xl font-black text-primary-theme mt-2">{currentlyReadingCount}</p>
          <span className="text-[11px] text-secondary-theme">Actively reading</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-theme shadow-xs">
          <div className="flex items-center justify-between text-secondary-theme text-xs font-medium">
            <span>Total Pages Read</span>
            <BookOpen className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-primary-theme mt-2">{totalPagesRead.toLocaleString()}</p>
          <span className="text-[11px] text-secondary-theme">Cumulative volume</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-theme shadow-xs">
          <div className="flex items-center justify-between text-secondary-theme text-xs font-medium">
            <span>Library Size</span>
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-primary-theme mt-2">{readingBooks.length}</p>
          <span className="text-[11px] text-secondary-theme">Total tracked</span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-theme">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'reading', label: `Reading (${readingBooks.filter((b) => b.status === 'reading').length})` },
            { id: 'to_read', label: `Want to Read (${readingBooks.filter((b) => b.status === 'to_read').length})` },
            { id: 'completed', label: `Completed (${completedCount})` },
            { id: 'all', label: `All Books (${readingBooks.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-accent-theme text-white'
                  : 'text-secondary-theme hover:bg-card-hover'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-secondary-theme" />
          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-app border border-theme text-xs text-primary-theme placeholder:text-muted-theme focus:outline-hidden focus:border-accent-theme"
          />
        </div>
      </div>

      {/* Book Grid */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-2xl border border-theme">
          <BookOpen className="w-10 h-10 mx-auto text-secondary-theme/40 mb-3" />
          <h3 className="text-sm font-semibold text-primary-theme">No books in this view</h3>
          <p className="text-xs text-secondary-theme mt-1">Add a book you are reading or want to read next.</p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:opacity-95"
          >
            Add Book
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBooks.map((book) => {
            const progressPct = Math.min(100, Math.round((book.currentPage / (book.totalPages || 1)) * 100));

            return (
              <div
                key={book.id}
                className="p-5 rounded-2xl bg-card border border-theme hover:border-accent-light-theme transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        book.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : book.status === 'reading'
                          ? 'bg-accent-light-theme text-accent-theme'
                          : 'bg-secondary-theme/10 text-secondary-theme'
                      }`}
                    >
                      {book.status === 'to_read' ? 'To Read' : book.status} • {book.format}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(book)}
                        className="p-1 rounded text-secondary-theme hover:text-primary-theme"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteBook(book.id)}
                        className="p-1 rounded text-secondary-theme hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-primary-theme mt-2 line-clamp-1">{book.title}</h3>
                  <p className="text-xs text-secondary-theme font-medium">by {book.author}</p>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-secondary-theme mb-1">
                      <span>Progress</span>
                      <span className="font-semibold text-primary-theme">
                        {book.currentPage} / {book.totalPages} pgs ({progressPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-app overflow-hidden">
                      <div
                        className="h-full bg-accent-theme transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    {/* Quick increment buttons if currently reading */}
                    {book.status === 'reading' && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <button
                          onClick={() => handleQuickPageProgress(book, 10)}
                          className="px-2 py-1 rounded-md text-[10px] font-semibold bg-app border border-theme text-secondary-theme hover:text-primary-theme"
                        >
                          +10 pgs
                        </button>
                        <button
                          onClick={() => handleQuickPageProgress(book, 25)}
                          className="px-2 py-1 rounded-md text-[10px] font-semibold bg-app border border-theme text-secondary-theme hover:text-primary-theme"
                        >
                          +25 pgs
                        </button>
                        <button
                          onClick={() => handleQuickPageProgress(book, 50)}
                          className="px-2 py-1 rounded-md text-[10px] font-semibold bg-app border border-theme text-secondary-theme hover:text-primary-theme"
                        >
                          +50 pgs
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Rating & Review */}
                  {book.rating && (
                    <div className="flex items-center gap-1 mt-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= (book.rating || 0)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-secondary-theme/30'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {book.review && (
                    <p className="mt-2 text-xs text-secondary-theme italic bg-card-hover/40 p-2 rounded-lg line-clamp-3">
                      "{book.review}"
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-theme rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-primary-theme">
              {editingBook ? 'Edit Book' : 'Add Book to Library'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-secondary-theme mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Atomic Habits"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-secondary-theme mb-1">Author</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. James Clear"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-secondary-theme mb-1">Total Pages</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={totalPages}
                    onChange={(e) => setTotalPages(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-secondary-theme mb-1">Current Page</label>
                  <input
                    type="number"
                    min="0"
                    max={totalPages}
                    required
                    value={currentPage}
                    onChange={(e) => setCurrentPage(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-secondary-theme mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme"
                  >
                    <option value="reading">Currently Reading</option>
                    <option value="to_read">Want to Read</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-secondary-theme mb-1">Format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme"
                  >
                    <option value="physical">Physical Book</option>
                    <option value="ebook">E-Book</option>
                    <option value="audiobook">Audiobook</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-secondary-theme mb-1">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(rating === star ? undefined : star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= (rating || 0)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-secondary-theme/40'
                        }`}
                      />
                    </button>
                  ))}
                  {rating && (
                    <span className="text-xs font-bold text-secondary-theme ml-2">{rating}/5</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-secondary-theme mb-1">Key Takeaways & Review</label>
                <textarea
                  rows={3}
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Memorable concepts, quotes, or thoughts on this book..."
                  className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-secondary-theme hover:bg-card-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:opacity-95"
                >
                  {editingBook ? 'Save Changes' : 'Save Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
