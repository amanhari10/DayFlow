/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  CheckSquare,
  Calendar,
  Gift,
  Flame,
  FileText,
  ArrowRight,
  Target,
  BookOpen,
  DollarSign,
  Compass,
  ShieldCheck,
  Timer,
  Grid,
  Sunrise,
  Command,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Task, CalendarEvent, Birthday, Note, Habit, ActiveView } from '../../types';
import { calculateBirthdayInfo, formatReadableDate } from '../../utils/helpers';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    tasks,
    events,
    birthdays,
    notes,
    habits,
    goals,
    readingBooks,
    expenses,
    tripPlans,
    vaultDocuments,
    setActiveView,
    setEditingTask,
    setEditingEvent,
    setEditingBirthday,
    setEditingNote,
    setEditingHabit,
    startTimer,
  } = useApp();

  const [query, setQuery] = useState('');

  // Built-in navigation commands
  const commands: Array<{
    id: string;
    title: string;
    subtitle: string;
    icon: any;
    action: () => void;
  }> = useMemo(
    () => [
      {
        id: 'cmd-day',
        title: 'Go to My Day',
        subtitle: 'Personalized command center',
        icon: Sunrise,
        action: () => setActiveView('day'),
      },
      {
        id: 'cmd-briefing',
        title: 'Open Daily Briefing',
        subtitle: 'Priorities, schedule, and docket recap',
        icon: Sunrise,
        action: () => setActiveView('briefing'),
      },
      {
        id: 'cmd-eisenhower',
        title: 'Eisenhower Matrix',
        subtitle: '4-quadrant urgency matrix',
        icon: Grid,
        action: () => setActiveView('eisenhower'),
      },
      {
        id: 'cmd-focus',
        title: 'Start 25m Pomodoro Focus Session',
        subtitle: 'Start deep work timer with ambient sound',
        icon: Timer,
        action: () => {
          startTimer();
          setActiveView('focus');
        },
      },
      {
        id: 'cmd-tasks',
        title: 'Open Tasks & Projects',
        subtitle: 'Kanban board & list view',
        icon: CheckSquare,
        action: () => setActiveView('tasks'),
      },
      {
        id: 'cmd-calendar',
        title: 'Open Calendar',
        subtitle: 'Monthly & weekly schedules',
        icon: Calendar,
        action: () => setActiveView('calendar'),
      },
      {
        id: 'cmd-reviews',
        title: 'Open Retrospective Reviews',
        subtitle: 'Weekly & monthly reflection',
        icon: Compass,
        action: () => setActiveView('reviews'),
      },
      {
        id: 'cmd-settings',
        title: 'Settings & Data Backup',
        subtitle: 'Theme, JSON backup, and storage',
        icon: FileText,
        action: () => setActiveView('settings'),
      },
    ],
    [setActiveView, startTimer]
  );

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const items: Array<{
      id: string;
      title: string;
      subtitle: string;
      type: string;
      icon: any;
      action: () => void;
    }> = [];

    // Filter Navigation Commands
    commands.forEach((cmd) => {
      if (cmd.title.toLowerCase().includes(q) || cmd.subtitle.toLowerCase().includes(q)) {
        items.push({
          id: cmd.id,
          title: cmd.title,
          subtitle: cmd.subtitle,
          type: 'command',
          icon: cmd.icon,
          action: cmd.action,
        });
      }
    });

    // Search Tasks
    tasks.forEach((t) => {
      if (
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        t.category.toLowerCase().includes(q)
      ) {
        items.push({
          id: t.id,
          title: t.title,
          subtitle: `Task • Due ${formatReadableDate(t.dueDate)} • ${t.status}`,
          type: 'task',
          icon: CheckSquare,
          action: () => {
            setActiveView('tasks');
            setEditingTask(t);
          },
        });
      }
    });

    // Search Events
    events.forEach((e) => {
      if (
        e.title.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q)) ||
        (e.location && e.location.toLowerCase().includes(q))
      ) {
        items.push({
          id: e.id,
          title: e.title,
          subtitle: `Event • ${e.date} ${e.startTime || ''}`,
          type: 'event',
          icon: Calendar,
          action: () => {
            setActiveView('calendar');
            setEditingEvent(e);
          },
        });
      }
    });

    // Search Goals
    goals.forEach((g) => {
      if (g.title.toLowerCase().includes(q) || (g.description && g.description.toLowerCase().includes(q))) {
        items.push({
          id: g.id,
          title: g.title,
          subtitle: `Life Goal • ${g.progress}% completed • ${g.category}`,
          type: 'goal',
          icon: Target,
          action: () => setActiveView('goals'),
        });
      }
    });

    // Search Reading Books
    readingBooks.forEach((b) => {
      if (b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)) {
        items.push({
          id: b.id,
          title: b.title,
          subtitle: `Book by ${b.author} • ${b.currentPage}/${b.totalPages} pgs`,
          type: 'reading',
          icon: BookOpen,
          action: () => setActiveView('reading'),
        });
      }
    });

    // Search Birthdays
    birthdays.forEach((b) => {
      const info = calculateBirthdayInfo(b);
      if (b.name.toLowerCase().includes(q) || b.relationship.toLowerCase().includes(q)) {
        items.push({
          id: b.id,
          title: b.name,
          subtitle: `Birthday in ${info.daysUntil} days (${info.formattedDate})`,
          type: 'birthday',
          icon: Gift,
          action: () => {
            setActiveView('birthdays');
            setEditingBirthday(b);
          },
        });
      }
    });

    // Search Notes
    notes.forEach((n) => {
      if (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)) {
        items.push({
          id: n.id,
          title: n.title,
          subtitle: `Note • ${n.content.slice(0, 50)}...`,
          type: 'note',
          icon: FileText,
          action: () => {
            setActiveView('notes');
            setEditingNote(n);
          },
        });
      }
    });

    // Search Habits
    habits.forEach((h) => {
      if (h.title.toLowerCase().includes(q) || (h.description && h.description.toLowerCase().includes(q))) {
        items.push({
          id: h.id,
          title: h.title,
          subtitle: `Habit • ${h.frequency} • ${h.category}`,
          type: 'habit',
          icon: Flame,
          action: () => {
            setActiveView('habits');
            setEditingHabit(h);
          },
        });
      }
    });

    // Search Trips
    tripPlans.forEach((tp) => {
      if (tp.destination.toLowerCase().includes(q)) {
        items.push({
          id: tp.id,
          title: `Trip: ${tp.destination}`,
          subtitle: `${tp.startDate} to ${tp.endDate} • Budget $${tp.budget}`,
          type: 'travel',
          icon: Compass,
          action: () => setActiveView('travel'),
        });
      }
    });

    // Search Documents Vault
    vaultDocuments.forEach((doc) => {
      if (doc.title.toLowerCase().includes(q) || (doc.documentNumber && doc.documentNumber.toLowerCase().includes(q))) {
        items.push({
          id: doc.id,
          title: doc.title,
          subtitle: `Vault Document • ${doc.category} ${doc.documentNumber ? `(#${doc.documentNumber})` : ''}`,
          type: 'vault',
          icon: ShieldCheck,
          action: () => setActiveView('vault'),
        });
      }
    });

    return items;
  }, [
    query,
    commands,
    tasks,
    events,
    goals,
    readingBooks,
    birthdays,
    notes,
    habits,
    tripPlans,
    vaultDocuments,
    setActiveView,
    setEditingTask,
    setEditingEvent,
    setEditingBirthday,
    setEditingNote,
    setEditingHabit,
  ]);

  if (!isSearchOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 pt-16 sm:pt-24"
      onClick={() => setIsSearchOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-card border border-theme rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-theme flex items-center gap-3">
          <Search className="w-5 h-5 text-secondary-theme shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search tasks, events, goals, books, vault..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm sm:text-base font-medium text-primary-theme placeholder:text-muted-theme focus:outline-hidden"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-secondary-theme hover:bg-card-hover"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1 text-[10px] text-secondary-theme font-mono px-2 py-0.5 rounded-md bg-app border border-theme">
              <Command className="w-3 h-3" /> K
            </div>
          )}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {query.trim() === '' ? (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-secondary-theme px-3 py-2">
                Suggested Commands & Navigation
              </p>
              <div className="space-y-1">
                {commands.map((cmd) => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        cmd.action();
                        setIsSearchOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-card-hover text-left transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-xl bg-app border border-theme text-accent-theme shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-primary-theme truncate">
                            {cmd.title}
                          </p>
                          <p className="text-[11px] text-secondary-theme truncate">{cmd.subtitle}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-secondary-theme opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-12 text-center text-secondary-theme">
              <Search className="w-8 h-8 mx-auto text-secondary-theme/40 mb-2" />
              <p className="text-sm font-semibold text-primary-theme">No matching records found</p>
              <p className="text-xs text-secondary-theme mt-0.5">Try searching for keywords or titles.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {searchResults.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      item.action();
                      setIsSearchOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-card-hover text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-xl bg-app border border-theme text-accent-theme shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-primary-theme truncate">
                            {item.title}
                          </span>
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-app border border-theme text-secondary-theme">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-secondary-theme truncate mt-0.5">{item.subtitle}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-secondary-theme opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="p-3 border-t border-theme bg-app/50 text-[11px] text-secondary-theme flex items-center justify-between">
          <span>Pro tip: Press <kbd className="px-1.5 py-0.5 rounded bg-card border border-theme text-[10px] font-mono">Esc</kbd> to close</span>
          <span>Unified search across 20+ modules</span>
        </div>
      </div>
    </div>
  );
};
