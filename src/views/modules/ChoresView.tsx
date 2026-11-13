/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  Edit2,
  Clock,
  Home,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { HouseholdChore } from '../../types';
import { getTodayDateString } from '../../utils/helpers';

export const ChoresView: React.FC = () => {
  const { householdChores, addChore, updateChore, deleteChore, toggleChoreDone } = useApp();

  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingChore, setEditingChore] = useState<HouseholdChore | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [room, setRoom] = useState<HouseholdChore['room']>('Kitchen');
  const [frequency, setFrequency] = useState<HouseholdChore['frequency']>('weekly');
  const [nextDue, setNextDue] = useState(getTodayDateString());

  const todayStr = getTodayDateString();

  const openAddModal = () => {
    setEditingChore(null);
    setTitle('');
    setRoom('Kitchen');
    setFrequency('weekly');
    setNextDue(getTodayDateString());
    setModalOpen(true);
  };

  const openEditModal = (chore: HouseholdChore) => {
    setEditingChore(chore);
    setTitle(chore.title);
    setRoom(chore.room);
    setFrequency(chore.frequency);
    setNextDue(chore.nextDue);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingChore) {
      await updateChore({
        ...editingChore,
        title: title.trim(),
        room,
        frequency,
        nextDue,
      });
    } else {
      await addChore({
        title: title.trim(),
        room,
        frequency,
        nextDue,
      });
    }
    setModalOpen(false);
  };

  const filteredChores = useMemo(() => {
    return householdChores
      .filter((c) => selectedRoom === 'all' || c.room === selectedRoom)
      .sort((a, b) => a.nextDue.localeCompare(b.nextDue));
  }, [householdChores, selectedRoom]);

  // Aggregate stats
  const dueTodayOrOverdue = useMemo(
    () => householdChores.filter((c) => c.nextDue <= todayStr).length,
    [householdChores, todayStr]
  );

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-accent-theme uppercase tracking-wider mb-1">
            <Home className="w-4 h-4" />
            <span>Health & Lifestyle</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-theme">
            Household Chore Manager
          </h1>
          <p className="text-xs sm:text-sm text-secondary-theme mt-1">
            Keep spaces tidy, manage recurring room duties, and check off cleanings with ease.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-theme text-white text-sm font-semibold hover:opacity-95 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Chore</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-card border border-theme shadow-xs">
          <div className="flex items-center justify-between text-secondary-theme text-xs font-medium">
            <span>Due Today / Overdue</span>
            <Clock className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-primary-theme mt-2">{dueTodayOrOverdue}</p>
          <span className="text-[11px] text-rose-500 font-semibold">Needs attention</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-theme shadow-xs">
          <div className="flex items-center justify-between text-secondary-theme text-xs font-medium">
            <span>Total Chores</span>
            <Sparkles className="w-4 h-4 text-accent-theme" />
          </div>
          <p className="text-2xl font-black text-primary-theme mt-2">{householdChores.length}</p>
          <span className="text-[11px] text-secondary-theme">Tracked routines</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-theme shadow-xs">
          <div className="flex items-center justify-between text-secondary-theme text-xs font-medium">
            <span>Active Rooms</span>
            <Home className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-primary-theme mt-2">
            {new Set(householdChores.map((c) => c.room)).size}
          </p>
          <span className="text-[11px] text-secondary-theme">Distinct spaces</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-theme shadow-xs">
          <div className="flex items-center justify-between text-secondary-theme text-xs font-medium">
            <span>Cleanliness Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-primary-theme mt-2">
            {householdChores.length > 0
              ? `${Math.round(((householdChores.length - dueTodayOrOverdue) / householdChores.length) * 100)}%`
              : '100%'}
          </p>
          <span className="text-[11px] text-emerald-500 font-semibold">Up to date</span>
        </div>
      </div>

      {/* Room Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {['all', 'Kitchen', 'Living Room', 'Bedroom', 'Bathroom', 'Balcony', 'General'].map((roomName) => (
          <button
            key={roomName}
            onClick={() => setSelectedRoom(roomName)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedRoom === roomName
                ? 'bg-accent-theme text-white'
                : 'bg-card border border-theme text-secondary-theme hover:bg-card-hover'
            }`}
          >
            {roomName === 'all' ? 'All Rooms' : roomName}
          </button>
        ))}
      </div>

      {/* Chore Cards Grid */}
      {filteredChores.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-2xl border border-theme">
          <Sparkles className="w-10 h-10 mx-auto text-secondary-theme/40 mb-3" />
          <h3 className="text-sm font-semibold text-primary-theme">No chores in this room</h3>
          <p className="text-xs text-secondary-theme mt-1">Keep living spaces fresh with recurring maintenance.</p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:opacity-95"
          >
            Add Chore
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChores.map((chore) => {
            const isOverdue = chore.nextDue < todayStr;
            const isToday = chore.nextDue === todayStr;

            return (
              <div
                key={chore.id}
                className="p-5 rounded-2xl bg-card border border-theme hover:border-accent-light-theme transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-accent-light-theme text-accent-theme">
                      {chore.room} • {chore.frequency}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(chore)}
                        className="p-1 rounded text-secondary-theme hover:text-primary-theme"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteChore(chore.id)}
                        className="p-1 rounded text-secondary-theme hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-primary-theme mt-2">{chore.title}</h3>

                  <div className="flex items-center gap-3 text-xs text-secondary-theme mt-2">
                    <span
                      className={`flex items-center gap-1 font-semibold ${
                        isOverdue ? 'text-rose-500' : isToday ? 'text-amber-500' : 'text-secondary-theme'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Due: {isToday ? 'Today' : chore.nextDue}
                    </span>
                  </div>

                  {chore.lastCompleted && (
                    <p className="text-[11px] text-muted-theme mt-1">
                      Last cleaned: {chore.lastCompleted}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-theme">
                  <button
                    onClick={() => toggleChoreDone(chore.id)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-app border border-theme hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-500 text-xs font-semibold text-primary-theme transition-all"
                  >
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Done & Reschedule</span>
                  </button>
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
              {editingChore ? 'Edit Household Chore' : 'Add Chore'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-secondary-theme mb-1">Chore Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep clean espresso machine"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-secondary-theme mb-1">Room / Area</label>
                  <select
                    value={room}
                    onChange={(e) => setRoom(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme"
                  >
                    <option value="Kitchen">Kitchen</option>
                    <option value="Living Room">Living Room</option>
                    <option value="Bedroom">Bedroom</option>
                    <option value="Bathroom">Bathroom</option>
                    <option value="Balcony">Balcony</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-secondary-theme mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-secondary-theme mb-1">Next Due Date</label>
                <input
                  type="date"
                  required
                  value={nextDue}
                  onChange={(e) => setNextDue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme"
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
                  {editingChore ? 'Save Changes' : 'Save Chore'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
