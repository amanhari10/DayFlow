/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Tag, Repeat, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CalendarEvent, EventCategory, RecurrencePattern } from '../../types';
import { getTodayDateString } from '../../utils/helpers';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: CalendarEvent | null;
  defaultDate?: string;
}

const CATEGORIES: { label: string; value: EventCategory; color: string }[] = [
  { label: 'Work', value: 'work', color: 'bg-blue-500' },
  { label: 'Meeting', value: 'meeting', color: 'bg-purple-500' },
  { label: 'Personal', value: 'personal', color: 'bg-emerald-500' },
  { label: 'Health', value: 'health', color: 'bg-rose-500' },
  { label: 'Celebration', value: 'celebration', color: 'bg-amber-500' },
  { label: 'Hobby', value: 'hobby', color: 'bg-cyan-500' },
  { label: 'Other', value: 'other', color: 'bg-slate-500' },
];

export const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, event, defaultDate }) => {
  const { addEvent, updateEvent } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(defaultDate || getTodayDateString());
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [allDay, setAllDay] = useState(false);
  const [category, setCategory] = useState<EventCategory>('work');
  const [location, setLocation] = useState('');
  const [reminder, setReminder] = useState(true);
  const [recurrence, setRecurrence] = useState<RecurrencePattern>('none');
  const [error, setError] = useState('');

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setDate(event.date);
      setEndDate(event.endDate || '');
      setStartTime(event.startTime || '09:00');
      setEndTime(event.endTime || '10:00');
      setAllDay(event.allDay);
      setCategory(event.category);
      setLocation(event.location || '');
      setReminder(event.reminder);
      setRecurrence(event.recurrence || 'none');
    } else {
      setTitle('');
      setDescription('');
      setDate(defaultDate || getTodayDateString());
      setEndDate('');
      setStartTime('09:00');
      setEndTime('10:00');
      setAllDay(false);
      setCategory('work');
      setLocation('');
      setReminder(true);
      setRecurrence('none');
    }
    setError('');
  }, [event, isOpen, defaultDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Event title is required');
      return;
    }

    if (!allDay && startTime >= endTime) {
      setError('End time must be after start time');
      return;
    }

    if (event) {
      await updateEvent({
        ...event,
        title: title.trim(),
        description: description.trim(),
        date,
        endDate: endDate || undefined,
        startTime: allDay ? '00:00' : startTime,
        endTime: allDay ? '23:59' : endTime,
        allDay,
        category,
        location: location.trim() || undefined,
        reminder,
        recurrence,
      });
    } else {
      await addEvent({
        title: title.trim(),
        description: description.trim(),
        date,
        endDate: endDate || undefined,
        startTime: allDay ? '00:00' : startTime,
        endTime: allDay ? '23:59' : endTime,
        allDay,
        category,
        location: location.trim() || undefined,
        reminder,
        recurrence,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-modal-theme rounded-2xl border border-theme shadow-2xl p-6 text-primary-theme"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-4 border-b border-theme">
          <h2 className="text-xl font-bold tracking-tight">
            {event ? 'Edit Calendar Event' : 'Schedule New Event'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-secondary-theme hover:bg-card-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Design Strategy Sync"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-input-theme border border-theme focus:outline-hidden focus:ring-2 ring-accent-theme text-sm font-medium"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allDayCheckbox"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="rounded text-accent-theme focus:ring-accent-theme cursor-pointer"
            />
            <label htmlFor="allDayCheckbox" className="text-sm font-medium text-secondary-theme cursor-pointer">
              All-day event
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1">
                <Calendar className="w-3.5 h-3.5 inline mr-1" /> Start Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme focus:outline-hidden focus:ring-2 ring-accent-theme text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1">
                <Calendar className="w-3.5 h-3.5 inline mr-1" /> End Date (Optional)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme focus:outline-hidden focus:ring-2 ring-accent-theme text-sm"
              />
            </div>
          </div>

          {!allDay && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1">
                  <Clock className="w-3.5 h-3.5 inline mr-1" /> Start Time
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme focus:outline-hidden focus:ring-2 ring-accent-theme text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1">
                  <Clock className="w-3.5 h-3.5 inline mr-1" /> End Time
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme focus:outline-hidden focus:ring-2 ring-accent-theme text-sm"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1">
                <Tag className="w-3.5 h-3.5 inline mr-1" /> Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme focus:outline-hidden focus:ring-2 ring-accent-theme text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1">
                <Repeat className="w-3.5 h-3.5 inline mr-1" /> Recurrence
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as RecurrencePattern)}
                className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme focus:outline-hidden focus:ring-2 ring-accent-theme text-sm"
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1">
              <MapPin className="w-3.5 h-3.5 inline mr-1" /> Location / Meeting Link
            </label>
            <input
              type="text"
              placeholder="e.g. Conference Room 3 or Zoom URL"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme focus:outline-hidden focus:ring-2 ring-accent-theme text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1">
              Description / Agenda
            </label>
            <textarea
              rows={2}
              placeholder="Add agenda items or notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme focus:outline-hidden focus:ring-2 ring-accent-theme text-sm resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-theme">
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
              {event ? 'Update Event' : 'Schedule Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
