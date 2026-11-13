/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Heart, Plus, Calendar, Clock, Trash2, UserCheck, MessageCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SpecialDate } from '../../types';
import { formatReadableDate, getTodayDateString } from '../../utils/helpers';
import { DateTimePicker } from '../../components/DateTimePicker';

export const SpecialDatesView: React.FC = () => {
  const { specialDates, addSpecialDate, updateSpecialDate, deleteSpecialDate } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [personName, setPersonName] = useState('');
  const [relationship, setRelationship] = useState('Partner');
  const [date, setDate] = useState(getTodayDateString());
  const [type, setType] = useState<SpecialDate['type']>('anniversary');
  const [frequency, setFrequency] = useState<SpecialDate['frequency']>('yearly');
  const [notes, setNotes] = useState('');

  const handleLogContactToday = async (item: SpecialDate) => {
    await updateSpecialDate({
      ...item,
      lastContactDate: getTodayDateString(),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim()) return;

    await addSpecialDate({
      personName: personName.trim(),
      relationship: relationship.trim(),
      date,
      type,
      frequency,
      notes: notes.trim() || undefined,
      lastContactDate: getTodayDateString(),
    });

    setIsModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-theme flex items-center gap-2">
            <Heart className="w-7 h-7 text-rose-500" /> Special Dates & Relationships
          </h2>
          <p className="text-xs sm:text-sm text-secondary-theme mt-1">
            Nurture important relationships, remember anniversaries, and stay in touch consistently.
          </p>
        </div>

        <button
          onClick={() => {
            setPersonName('');
            setRelationship('Partner');
            setDate(getTodayDateString());
            setType('anniversary');
            setFrequency('yearly');
            setNotes('');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Special Date
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {specialDates.map((item) => (
          <div
            key={item.id}
            className="bg-card-theme rounded-2xl border border-theme p-5 shadow-xs flex flex-col justify-between hover:border-strong-theme transition-all"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-secondary-theme text-secondary-theme">
                  {item.relationship}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 capitalize">
                  {item.type.replace('_', ' ')}
                </span>
              </div>

              <h3 className="text-base font-bold text-primary-theme mt-2.5">{item.personName}</h3>
              <p className="text-xs text-secondary-theme flex items-center gap-1.5 mt-1 font-mono">
                <Calendar className="w-3.5 h-3.5 text-accent-theme" /> {formatReadableDate(item.date)} ({item.frequency})
              </p>

              {item.notes && (
                <p className="text-xs text-secondary-theme bg-secondary-theme/40 p-2.5 rounded-xl mt-3 line-clamp-3">
                  {item.notes}
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-theme flex items-center justify-between text-xs text-secondary-theme">
              <span className="text-[11px] text-muted-theme">
                {item.lastContactDate ? `Contacted ${formatReadableDate(item.lastContactDate)}` : 'No touchpoint logged'}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleLogContactToday(item)}
                  className="px-2.5 py-1 rounded-lg bg-secondary-theme text-primary-theme hover:bg-card-hover font-semibold text-[11px]"
                  title="Mark contacted today"
                >
                  ✓ Connected
                </button>
                <button
                  onClick={() => deleteSpecialDate(item.id)}
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
          <div className="w-full max-w-md bg-modal-theme rounded-2xl border border-theme p-6 text-primary-theme shadow-2xl space-y-4">
            <h3 className="font-bold text-lg">Add Special Relationship Date</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Person Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elena Rostova"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Relationship</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Partner, Mentor, Friend"
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Date</label>
                  <DateTimePicker
                    type="date"
                    required
                    value={date}
                    onChange={setDate}
                    ariaLabel="Special date"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Event Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs"
                  >
                    <option value="anniversary">Anniversary</option>
                    <option value="first_met">First Met</option>
                    <option value="milestone">Milestone</option>
                    <option value="check_in">Regular Check-In</option>
                    <option value="celebration">Celebration</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs"
                  >
                    <option value="yearly">Yearly</option>
                    <option value="monthly">Monthly</option>
                    <option value="once">One-Time</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Important Notes / Gift Ideas</label>
                <textarea
                  rows={2}
                  placeholder="Favorite restaurants, traditions, or shared memories..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme text-xs resize-none"
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
                  Save Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
