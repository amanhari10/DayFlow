/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Compass,
  Plus,
  Trash2,
  Calendar,
  Star,
  CheckCircle2,
  Award,
  TrendingUp,
  Sparkles,
  Edit2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ReviewRecord } from '../../types';
import { getTodayDateString, triggerCelebration } from '../../utils/helpers';

export const ReviewsView: React.FC = () => {
  const { reviewRecords, addReview, updateReview, deleteReview } = useApp();

  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewRecord | null>(null);

  // Form states
  const [periodDate, setPeriodDate] = useState(getTodayDateString().slice(0, 7)); // YYYY-MM
  const [wins, setWins] = useState<string[]>(['Shipped DayFlow core modules', 'Maintained 5-day workout streak']);
  const [challenges, setChallenges] = useState<string[]>(['Time management during mid-week sprint']);
  const [improvements, setImprovements] = useState<string[]>(['Block focus time earlier in mornings']);
  const [rating, setRating] = useState<number>(4);

  const openAddModal = (type: 'weekly' | 'monthly') => {
    setEditingReview(null);
    setPeriodDate(getTodayDateString());
    setWins(['']);
    setChallenges(['']);
    setImprovements(['']);
    setRating(4);
    setModalOpen(true);
  };

  const openEditModal = (rec: ReviewRecord) => {
    setEditingReview(rec);
    setPeriodDate(rec.periodDate);
    setWins(rec.wins || ['']);
    setChallenges(rec.challenges || ['']);
    setImprovements(rec.improvements || ['']);
    setRating(rec.rating);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanWins = wins.map((w) => w.trim()).filter((w) => w.length > 0);
    const cleanChallenges = challenges.map((c) => c.trim()).filter((c) => c.length > 0);
    const cleanImprovements = improvements.map((i) => i.trim()).filter((i) => i.length > 0);

    if (editingReview) {
      await updateReview({
        ...editingReview,
        periodType: activeTab,
        periodDate,
        wins: cleanWins,
        challenges: cleanChallenges,
        improvements: cleanImprovements,
        rating: Number(rating),
      });
    } else {
      await addReview({
        periodType: activeTab,
        periodDate,
        wins: cleanWins,
        challenges: cleanChallenges,
        improvements: cleanImprovements,
        rating: Number(rating),
      });
      triggerCelebration();
    }
    setModalOpen(false);
  };

  const filteredReviews = useMemo(() => {
    return reviewRecords
      .filter((r) => r.periodType === activeTab)
      .sort((a, b) => b.periodDate.localeCompare(a.periodDate));
  }, [reviewRecords, activeTab]);

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-accent-theme uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            <span>Retrospectives & Reflection</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-theme">
            Weekly & Monthly Reviews
          </h1>
          <p className="text-xs sm:text-sm text-secondary-theme mt-1">
            Step back from the daily weeds. Evaluate highs, bottlenecks, and strategic adaptations.
          </p>
        </div>

        <button
          onClick={() => openAddModal(activeTab)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-theme text-white text-sm font-semibold hover:opacity-95 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New {activeTab === 'weekly' ? 'Weekly' : 'Monthly'} Review</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-card p-1 rounded-2xl border border-theme w-fit">
        <button
          onClick={() => setActiveTab('weekly')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'weekly'
              ? 'bg-accent-theme text-white shadow-xs'
              : 'text-secondary-theme hover:text-primary-theme'
          }`}
        >
          Weekly Reviews ({reviewRecords.filter((r) => r.periodType === 'weekly').length})
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'monthly'
              ? 'bg-accent-theme text-white shadow-xs'
              : 'text-secondary-theme hover:text-primary-theme'
          }`}
        >
          Monthly Reviews ({reviewRecords.filter((r) => r.periodType === 'monthly').length})
        </button>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-2xl border border-theme">
          <Award className="w-10 h-10 mx-auto text-secondary-theme/40 mb-3" />
          <h3 className="text-sm font-semibold text-primary-theme">No {activeTab} reviews recorded</h3>
          <p className="text-xs text-secondary-theme mt-1">
            Dedicate 10 minutes at the end of the {activeTab === 'weekly' ? 'week' : 'month'} to document your progress.
          </p>
          <button
            onClick={() => openAddModal(activeTab)}
            className="mt-4 px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:opacity-95"
          >
            Start Retrospective
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-3xl bg-card border border-theme hover:border-accent-light-theme transition-all shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-accent-light-theme text-accent-theme">
                      {rev.periodType} review
                    </span>
                    <span className="text-xs font-bold text-primary-theme">{rev.periodDate}</span>
                  </div>

                  <div className="flex items-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-secondary-theme/30'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-secondary-theme ml-1">{rev.rating}/5</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(rev)}
                    className="p-1.5 rounded-lg text-secondary-theme hover:bg-card-hover hover:text-primary-theme"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteReview(rev.id)}
                    className="p-1.5 rounded-lg text-secondary-theme hover:bg-rose-500/10 hover:text-rose-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 3 Columns: Wins, Challenges, Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-2">
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <h4 className="font-bold text-emerald-500 uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Wins & Achievements ({rev.wins.length})
                  </h4>
                  <ul className="space-y-1 list-disc list-inside text-primary-theme">
                    {rev.wins.map((w, idx) => (
                      <li key={idx} className="font-medium">{w}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                  <h4 className="font-bold text-rose-500 uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Bottlenecks & Struggles
                  </h4>
                  <ul className="space-y-1 list-disc list-inside text-primary-theme">
                    {rev.challenges.map((c, idx) => (
                      <li key={idx} className="font-medium">{c}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-2xl bg-accent-light-theme/40 border border-accent-light-theme">
                  <h4 className="font-bold text-accent-theme uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Improvements Next Period
                  </h4>
                  <ul className="space-y-1 list-disc list-inside text-primary-theme">
                    {rev.improvements.map((imp, idx) => (
                      <li key={idx} className="font-medium">{imp}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-theme rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-primary-theme">
              {editingReview ? 'Edit Retrospective' : `New ${activeTab === 'weekly' ? 'Weekly' : 'Monthly'} Review`}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-secondary-theme mb-1">Period Identifier</label>
                  <input
                    type="text"
                    required
                    placeholder={activeTab === 'weekly' ? 'e.g. 2025-W42' : 'e.g. 2025-10'}
                    value={periodDate}
                    onChange={(e) => setPeriodDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-secondary-theme mb-1">Rating ({rating}/5)</label>
                  <div className="flex items-center gap-2 pt-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= rating ? 'text-amber-400 fill-amber-400' : 'text-secondary-theme/40'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Wins Inputs */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-emerald-500 font-bold">Wins & What Went Well</label>
                  <button
                    type="button"
                    onClick={() => setWins((prev) => [...prev, ''])}
                    className="text-xs text-accent-theme font-medium hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Win
                  </button>
                </div>
                <div className="space-y-2">
                  {wins.map((w, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Proud moment or goal hit..."
                        value={w}
                        onChange={(e) =>
                          setWins((prev) => prev.map((item, i) => (i === idx ? e.target.value : item)))
                        }
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-app border border-theme text-xs text-primary-theme focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setWins((prev) => prev.filter((_, i) => i !== idx))}
                        className="p-1 text-secondary-theme hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Challenges */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-rose-500 font-bold">Obstacles & Distractions</label>
                  <button
                    type="button"
                    onClick={() => setChallenges((prev) => [...prev, ''])}
                    className="text-xs text-accent-theme font-medium hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Challenge
                  </button>
                </div>
                <div className="space-y-2">
                  {challenges.map((c, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="What slowed you down? What felt hard?"
                        value={c}
                        onChange={(e) =>
                          setChallenges((prev) => prev.map((item, i) => (i === idx ? e.target.value : item)))
                        }
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-app border border-theme text-xs text-primary-theme focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setChallenges((prev) => prev.filter((_, i) => i !== idx))}
                        className="p-1 text-secondary-theme hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvements */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-accent-theme font-bold">Actionable Improvements</label>
                  <button
                    type="button"
                    onClick={() => setImprovements((prev) => [...prev, ''])}
                    className="text-xs text-accent-theme font-medium hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Action
                  </button>
                </div>
                <div className="space-y-2">
                  {improvements.map((imp, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Concrete tweak to systems or habits..."
                        value={imp}
                        onChange={(e) =>
                          setImprovements((prev) => prev.map((item, i) => (i === idx ? e.target.value : item)))
                        }
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-app border border-theme text-xs text-primary-theme focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setImprovements((prev) => prev.filter((_, i) => i !== idx))}
                        className="p-1 text-secondary-theme hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
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
                  Save Retrospective
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
