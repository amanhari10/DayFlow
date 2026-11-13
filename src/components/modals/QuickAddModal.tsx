/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, CheckSquare, Calendar, Gift, Flame, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Priority, EventCategory, RelationshipType, HabitFrequency, NoteCategory } from '../../types';
import { getTodayDateString } from '../../utils/helpers';

export const QuickAddModal: React.FC = () => {
  const {
    isQuickAddOpen,
    setIsQuickAddOpen,
    quickAddTab,
    addTask,
    addEvent,
    addBirthday,
    addHabit,
    addNote,
  } = useApp();

  const sanitizeTab = (tab: string): 'task' | 'event' | 'birthday' | 'habit' | 'note' => {
    if (tab === 'event' || tab === 'birthday' || tab === 'habit' || tab === 'note') return tab;
    return 'task';
  };

  const [activeTab, setActiveTab] = useState<'task' | 'event' | 'birthday' | 'habit' | 'note'>(sanitizeTab(quickAddTab));

  // Sync tab if opened via specific shortcut
  React.useEffect(() => {
    setActiveTab(sanitizeTab(quickAddTab));
  }, [quickAddTab, isQuickAddOpen]);

  // Form states
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState(getTodayDateString());
  const [taskPriority, setTaskPriority] = useState<Priority>('medium');

  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(getTodayDateString());
  const [eventTime, setEventTime] = useState('10:00');
  const [eventCategory, setEventCategory] = useState<EventCategory>('meeting');

  const [bdayName, setBdayName] = useState('');
  const [bdayDate, setBdayDate] = useState(getTodayDateString());
  const [bdayRelation, setBdayRelation] = useState<RelationshipType>('friend');

  const [habitTitle, setHabitTitle] = useState('');
  const [habitFrequency, setHabitFrequency] = useState<HabitFrequency>('daily');

  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState<NoteCategory>('general');

  if (!isQuickAddOpen) return null;

  const handleClose = () => {
    setIsQuickAddOpen(false);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    await addTask({
      title: taskTitle.trim(),
      description: '',
      dueDate: taskDueDate,
      priority: taskPriority,
      status: 'todo',
      category: 'Work',
      tags: [],
      subtasks: [],
      recurrence: 'none',
      reminder: true,
    });
    setTaskTitle('');
    handleClose();
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;
    const [h, m] = eventTime.split(':').map(Number);
    const endH = (h + 1) % 24;
    const endTime = `${String(endH).padStart(2, '0')}:${String(m || '00').padStart(2, '0')}`;

    await addEvent({
      title: eventTitle.trim(),
      date: eventDate,
      startTime: eventTime,
      endTime,
      allDay: false,
      category: eventCategory,
      reminder: true,
      recurrence: 'none',
    });
    setEventTitle('');
    handleClose();
  };

  const handleCreateBirthday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bdayName.trim()) return;
    await addBirthday({
      name: bdayName.trim(),
      birthdate: bdayDate,
      relationship: bdayRelation,
      avatarColor: 'bg-rose-500',
      giftIdeas: [],
      reminder: '3_days_before',
    });
    setBdayName('');
    handleClose();
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitTitle.trim()) return;
    await addHabit({
      title: habitTitle.trim(),
      category: 'Productivity',
      color: 'emerald',
      frequency: habitFrequency,
    });
    setHabitTitle('');
    handleClose();
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() && !noteContent.trim()) return;
    await addNote({
      title: noteTitle.trim() || 'Quick Note',
      content: noteContent.trim(),
      category: noteCategory,
      pinned: false,
      tags: ['QuickCapture'],
    });
    setNoteTitle('');
    setNoteContent('');
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-lg bg-modal-theme rounded-2xl border border-theme shadow-2xl p-6 text-primary-theme animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
      >
        <div className="flex items-center justify-between pb-3 border-b border-theme">
          <h2 className="text-lg font-bold tracking-tight">Quick Add</h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-secondary-theme hover:bg-card-hover"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex gap-1.5 p-1 bg-secondary-theme rounded-xl border border-theme mt-4 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('task')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'task'
                ? 'bg-card-theme text-primary-theme shadow-xs'
                : 'text-secondary-theme hover:text-primary-theme'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" /> Task
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('event')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'event'
                ? 'bg-card-theme text-primary-theme shadow-xs'
                : 'text-secondary-theme hover:text-primary-theme'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Event
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('birthday')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'birthday'
                ? 'bg-card-theme text-primary-theme shadow-xs'
                : 'text-secondary-theme hover:text-primary-theme'
            }`}
          >
            <Gift className="w-3.5 h-3.5" /> Birthday
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('habit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'habit'
                ? 'bg-card-theme text-primary-theme shadow-xs'
                : 'text-secondary-theme hover:text-primary-theme'
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> Habit
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('note')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'note'
                ? 'bg-card-theme text-primary-theme shadow-xs'
                : 'text-secondary-theme hover:text-primary-theme'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Note
          </button>
        </div>

        {/* Tab content */}
        <div className="mt-4">
          {activeTab === 'task' && (
            <form onSubmit={handleCreateTask} className="space-y-3">
              <input
                type="text"
                placeholder="What needs to get done?"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-input-theme border border-theme text-sm font-medium focus:ring-2 ring-accent-theme focus:outline-hidden"
                autoFocus
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-input-theme border border-theme text-sm"
                />
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as Priority)}
                  className="px-3 py-2 rounded-xl bg-input-theme border border-theme text-sm"
                >
                  <option value="low">🟢 Low Priority</option>
                  <option value="medium">🟡 Medium Priority</option>
                  <option value="high">🟠 High Priority</option>
                  <option value="urgent">🔴 Urgent</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full mt-2 py-2.5 rounded-xl bg-accent-theme text-white text-sm font-semibold hover:bg-accent-hover transition-colors"
              >
                Create Task
              </button>
            </form>
          )}

          {activeTab === 'event' && (
            <form onSubmit={handleCreateEvent} className="space-y-3">
              <input
                type="text"
                placeholder="Event title or meeting..."
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-input-theme border border-theme text-sm font-medium focus:ring-2 ring-accent-theme focus:outline-hidden"
                autoFocus
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-input-theme border border-theme text-sm"
                />
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-input-theme border border-theme text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-2 py-2.5 rounded-xl bg-accent-theme text-white text-sm font-semibold hover:bg-accent-hover transition-colors"
              >
                Schedule Event
              </button>
            </form>
          )}

          {activeTab === 'birthday' && (
            <form onSubmit={handleCreateBirthday} className="space-y-3">
              <input
                type="text"
                placeholder="Person's name..."
                value={bdayName}
                onChange={(e) => setBdayName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-input-theme border border-theme text-sm font-medium focus:ring-2 ring-accent-theme focus:outline-hidden"
                autoFocus
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={bdayDate}
                  onChange={(e) => setBdayDate(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-input-theme border border-theme text-sm"
                />
                <select
                  value={bdayRelation}
                  onChange={(e) => setBdayRelation(e.target.value as RelationshipType)}
                  className="px-3 py-2 rounded-xl bg-input-theme border border-theme text-sm"
                >
                  <option value="friend">Friend</option>
                  <option value="family">Family</option>
                  <option value="partner">Partner</option>
                  <option value="colleague">Colleague</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full mt-2 py-2.5 rounded-xl bg-accent-theme text-white text-sm font-semibold hover:bg-accent-hover transition-colors"
              >
                Add Birthday
              </button>
            </form>
          )}

          {activeTab === 'habit' && (
            <form onSubmit={handleCreateHabit} className="space-y-3">
              <input
                type="text"
                placeholder="Habit title (e.g. Read 20 mins, Hydrate)..."
                value={habitTitle}
                onChange={(e) => setHabitTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-input-theme border border-theme text-sm font-medium focus:ring-2 ring-accent-theme focus:outline-hidden"
                autoFocus
              />
              <select
                value={habitFrequency}
                onChange={(e) => setHabitFrequency(e.target.value as HabitFrequency)}
                className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-sm"
              >
                <option value="daily">Every day</option>
                <option value="weekdays">Weekdays</option>
                <option value="weekends">Weekends</option>
              </select>
              <button
                type="submit"
                className="w-full mt-2 py-2.5 rounded-xl bg-accent-theme text-white text-sm font-semibold hover:bg-accent-hover transition-colors"
              >
                Track Habit
              </button>
            </form>
          )}

          {activeTab === 'note' && (
            <form onSubmit={handleCreateNote} className="space-y-3">
              <input
                type="text"
                placeholder="Note title..."
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme text-sm font-medium focus:ring-2 ring-accent-theme focus:outline-hidden"
                autoFocus
              />
              <textarea
                rows={3}
                placeholder="Quick thoughts, ideas, or journal snippet..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme text-sm resize-none focus:ring-2 ring-accent-theme focus:outline-hidden"
              />
              <button
                type="submit"
                className="w-full mt-2 py-2.5 rounded-xl bg-accent-theme text-white text-sm font-semibold hover:bg-accent-hover transition-colors"
              >
                Save Note
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
