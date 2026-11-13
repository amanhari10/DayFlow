/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Gift,
  Plus,
  Search,
  Calendar,
  Heart,
  Bell,
  Trash2,
  Edit2,
  Download,
  Cake,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Birthday, RelationshipType } from '../types';
import { calculateBirthdayInfo, exportBirthdaysToCSV } from '../utils/helpers';
import { BirthdayModal } from '../components/modals/BirthdayModal';

export const BirthdaysView: React.FC = () => {
  const { birthdays, deleteBirthday, setEditingBirthday, editingBirthday } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRelation, setSelectedRelation] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Compute countdown & age for all birthdays and sort upcoming
  const processedBirthdays = useMemo(() => {
    return birthdays
      .map((b) => ({
        ...b,
        info: calculateBirthdayInfo(b),
      }))
      .filter((b) => {
        if (selectedRelation !== 'all' && b.relationship !== selectedRelation) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = b.name.toLowerCase().includes(q);
          const matchNotes = b.notes?.toLowerCase().includes(q);
          const matchGifts = b.giftIdeas.some((g) => g.toLowerCase().includes(q));
          if (!matchName && !matchNotes && !matchGifts) return false;
        }
        return true;
      })
      .sort((a, b) => a.info.daysUntil - b.info.daysUntil);
  }, [birthdays, selectedRelation, searchQuery]);

  const upcomingNext = processedBirthdays[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-theme">
            Birthday Manager
          </h2>
          <p className="text-xs sm:text-sm text-secondary-theme mt-1">
            Never miss a friend or family member&apos;s special day. Track gift ideas, notes, and milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportBirthdaysToCSV(birthdays)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card-theme border border-theme text-secondary-theme hover:text-primary-theme text-xs font-semibold hover:bg-card-hover transition-colors shadow-xs"
            title="Export birthdays as CSV"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Birthday
          </button>
        </div>
      </div>

      {/* Featured Next Birthday Banner (if any) */}
      {upcomingNext && (
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-accent-light-theme border border-pink-500/20 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center text-2xl font-bold shadow-md shrink-0">
              🎂
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-pink-500">
                  Next Upcoming Birthday
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-500 font-bold">
                  {upcomingNext.info.displayText}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-primary-theme mt-1">
                {upcomingNext.name}
              </h3>
              <p className="text-xs text-secondary-theme mt-0.5">
                {upcomingNext.info.formattedDate} · <span className="capitalize">{upcomingNext.relationship}</span>
                {upcomingNext.giftIdeas.length > 0 && ` · 🎁 ${upcomingNext.giftIdeas.length} gift ideas saved`}
              </p>
            </div>
          </div>

          <button
            onClick={() => setEditingBirthday(upcomingNext)}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-card-theme border border-theme text-xs font-semibold text-primary-theme hover:bg-card-hover shadow-xs transition-colors shrink-0"
          >
            View Details & Gifts
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-card-theme p-3 rounded-2xl border border-theme shadow-xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-secondary-theme" />
          <input
            type="text"
            placeholder="Search by name, gift ideas, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-input-theme border border-theme text-xs focus:ring-1 ring-accent-theme focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedRelation}
            onChange={(e) => setSelectedRelation(e.target.value)}
            className="py-1.5 px-3 rounded-xl bg-input-theme border border-theme text-xs focus:ring-1 ring-accent-theme focus:outline-hidden"
          >
            <option value="all">All Relationships</option>
            <option value="partner">Partner</option>
            <option value="family">Family</option>
            <option value="friend">Friend</option>
            <option value="colleague">Colleague</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Birthday Cards Grid */}
      {processedBirthdays.length === 0 ? (
        <div className="py-16 text-center text-secondary-theme bg-card-theme rounded-2xl border border-theme">
          <Gift className="w-10 h-10 mx-auto text-muted-theme opacity-30 mb-3" />
          <p className="text-base font-semibold text-primary-theme">No birthdays found</p>
          <p className="text-xs text-muted-theme mt-1">
            {searchQuery ? 'Try matching a different name or relationship.' : 'Add your family and friends to get reminders.'}
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-xs"
          >
            + Add First Birthday
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {processedBirthdays.map((b) => (
            <div
              key={b.id}
              className="bg-card-theme rounded-2xl border border-theme p-5 shadow-xs hover:border-strong-theme transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-2xl ${b.avatarColor} text-white font-extrabold text-base flex items-center justify-center shrink-0 shadow-xs`}
                    >
                      {b.name.slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm sm:text-base text-primary-theme truncate">
                        {b.name}
                      </h4>
                      <p className="text-xs text-secondary-theme capitalize flex items-center gap-1.5 mt-0.5">
                        <Heart className="w-3 h-3 text-rose-500" /> {b.relationship}
                      </p>
                    </div>
                  </div>

                  {/* Countdown Badge */}
                  <span
                    className={`text-xs font-extrabold px-2.5 py-1 rounded-xl shrink-0 ${
                      b.info.isToday
                        ? 'bg-rose-500 text-white animate-bounce'
                        : b.info.daysUntil <= 3
                        ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                        : 'bg-secondary-theme text-secondary-theme'
                    }`}
                  >
                    {b.info.isToday ? 'TODAY 🎉' : `${b.info.daysUntil} days`}
                  </span>
                </div>

                {/* Date & Turning Age */}
                <div className="mt-4 p-3 rounded-xl bg-secondary-theme/50 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-secondary-theme">
                    <Calendar className="w-3.5 h-3.5 text-accent-theme" /> {b.info.formattedDate}
                  </span>
                  {b.info.turningAge && (
                    <span className="font-bold text-accent-theme font-mono">
                      Turns {b.info.turningAge}
                    </span>
                  )}
                </div>

                {/* Gift Ideas List */}
                {b.giftIdeas.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-theme block mb-1">
                      Gift Wishlist ({b.giftIdeas.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {b.giftIdeas.slice(0, 3).map((idea, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2 py-0.5 rounded-lg bg-card-theme border border-theme text-secondary-theme truncate max-w-[180px]"
                        >
                          🎁 {idea}
                        </span>
                      ))}
                      {b.giftIdeas.length > 3 && (
                        <span className="text-[10px] text-muted-theme self-center font-medium">
                          +{b.giftIdeas.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Personal Notes */}
                {b.notes && (
                  <p className="mt-3 text-xs text-secondary-theme bg-card-theme border border-subtle-theme p-2 rounded-xl line-clamp-2">
                    &ldquo;{b.notes}&rdquo;
                  </p>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-theme flex items-center justify-between text-xs text-secondary-theme">
                <span className="flex items-center gap-1 text-[11px]">
                  <Bell className="w-3 h-3 text-muted-theme" /> {b.reminder.replace(/_/g, ' ')}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingBirthday(b)}
                    className="p-1.5 rounded-lg text-secondary-theme hover:text-primary-theme hover:bg-secondary-theme transition-colors"
                    title="Edit record"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteBirthday(b.id)}
                    className="p-1.5 rounded-lg text-secondary-theme hover:text-rose-500 hover:bg-secondary-theme transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Birthday Modal */}
      {(isAddModalOpen || editingBirthday) && (
        <BirthdayModal
          isOpen={isAddModalOpen || !!editingBirthday}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingBirthday(null);
          }}
          birthday={editingBirthday}
        />
      )}
    </div>
  );
};
