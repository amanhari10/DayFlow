/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Heart,
  Plus,
  Trash2,
  Calendar,
  Moon,
  Droplets,
  Zap,
  Smile,
  Meh,
  Frown,
  Edit2,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WellnessLog } from '../../types';
import { getTodayDateString } from '../../utils/helpers';
import { DateTimePicker } from '../../components/DateTimePicker';

export const WellnessView: React.FC = () => {
  const { wellnessLogs, addWellnessLog, updateWellnessLog, deleteWellnessLog } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<WellnessLog | null>(null);

  // Form states
  const [date, setDate] = useState(getTodayDateString());
  const [sleepHours, setSleepHours] = useState(7.5);
  const [sleepQuality, setSleepQuality] = useState(4);
  const [mood, setMood] = useState(4);
  const [waterLiters, setWaterLiters] = useState(2.5);
  const [energyLevel, setEnergyLevel] = useState(4);
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingLog(null);
    setDate(getTodayDateString());
    setSleepHours(7.5);
    setSleepQuality(4);
    setMood(4);
    setWaterLiters(2.5);
    setEnergyLevel(4);
    setNotes('');
    setModalOpen(true);
  };

  const openEditModal = (log: WellnessLog) => {
    setEditingLog(log);
    setDate(log.date);
    setSleepHours(log.sleepHours);
    setSleepQuality(log.sleepQuality);
    setMood(log.mood);
    setWaterLiters(log.waterLiters);
    setEnergyLevel(log.energyLevel);
    setNotes(log.notes || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLog) {
      await updateWellnessLog({
        ...editingLog,
        date,
        sleepHours: Number(sleepHours),
        sleepQuality: Number(sleepQuality),
        mood: Number(mood),
        waterLiters: Number(waterLiters),
        energyLevel: Number(energyLevel),
        notes: notes.trim() || undefined,
      });
    } else {
      await addWellnessLog({
        date,
        sleepHours: Number(sleepHours),
        sleepQuality: Number(sleepQuality),
        mood: Number(mood),
        waterLiters: Number(waterLiters),
        energyLevel: Number(energyLevel),
        notes: notes.trim() || undefined,
      });
    }
    setModalOpen(false);
  };

  const sortedLogs = useMemo(() => {
    return [...wellnessLogs].sort((a, b) => b.date.localeCompare(a.date));
  }, [wellnessLogs]);

  // Aggregate stats
  const avgSleep = useMemo(() => {
    if (wellnessLogs.length === 0) return 0;
    return (wellnessLogs.reduce((acc, l) => acc + l.sleepHours, 0) / wellnessLogs.length).toFixed(1);
  }, [wellnessLogs]);

  const avgMood = useMemo(() => {
    if (wellnessLogs.length === 0) return 0;
    return (wellnessLogs.reduce((acc, l) => acc + l.mood, 0) / wellnessLogs.length).toFixed(1);
  }, [wellnessLogs]);

  const avgWater = useMemo(() => {
    if (wellnessLogs.length === 0) return 0;
    return (wellnessLogs.reduce((acc, l) => acc + l.waterLiters, 0) / wellnessLogs.length).toFixed(1);
  }, [wellnessLogs]);

  const getMoodLabel = (m: number) => {
    switch (m) {
      case 5: return { label: 'Great', color: 'text-emerald-500', icon: Smile };
      case 4: return { label: 'Good', color: 'text-blue-500', icon: Smile };
      case 3: return { label: 'Neutral', color: 'text-amber-500', icon: Meh };
      case 2: return { label: 'Low', color: 'text-orange-500', icon: Frown };
      default: return { label: 'Difficult', color: 'text-rose-500', icon: Frown };
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-accent-theme uppercase tracking-wider mb-1">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Health & Lifestyle</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-theme">
            Wellness & Vitality Tracker
          </h1>
          <p className="text-xs sm:text-sm text-secondary-theme mt-1">
            Monitor restorative sleep, hydration, mood states, and holistic daily vitality.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-theme text-white text-sm font-semibold hover:opacity-95 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Log Daily Wellness</span>
        </button>
      </div>

      {/* Averages Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-card border border-theme shadow-xs">
          <div className="flex items-center justify-between text-secondary-theme text-xs font-medium">
            <span>Avg Sleep</span>
            <Moon className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-primary-theme mt-2">{avgSleep} hrs</p>
          <span className="text-[11px] text-secondary-theme">Target: 7-9 hrs</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-theme shadow-xs">
          <div className="flex items-center justify-between text-secondary-theme text-xs font-medium">
            <span>Avg Mood</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-primary-theme mt-2">{avgMood} / 5</p>
          <span className="text-[11px] text-emerald-500 font-semibold">Positive baseline</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-theme shadow-xs">
          <div className="flex items-center justify-between text-secondary-theme text-xs font-medium">
            <span>Avg Water</span>
            <Droplets className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-primary-theme mt-2">{avgWater} L</p>
          <span className="text-[11px] text-secondary-theme">Daily hydration</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-theme shadow-xs">
          <div className="flex items-center justify-between text-secondary-theme text-xs font-medium">
            <span>Logged Days</span>
            <TrendingUp className="w-4 h-4 text-accent-theme" />
          </div>
          <p className="text-2xl font-black text-primary-theme mt-2">{wellnessLogs.length}</p>
          <span className="text-[11px] text-secondary-theme">Consistent logs</span>
        </div>
      </div>

      {/* Logs Table / Cards */}
      {sortedLogs.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-2xl border border-theme">
          <Heart className="w-10 h-10 mx-auto text-secondary-theme/40 mb-3" />
          <h3 className="text-sm font-semibold text-primary-theme">No wellness check-ins yet</h3>
          <p className="text-xs text-secondary-theme mt-1">Start recording your sleep quality, mood, and hydration.</p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:opacity-95"
          >
            Log First Check-in
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedLogs.map((log) => {
            const moodInfo = getMoodLabel(log.mood);
            const MoodIcon = moodInfo.icon;
            return (
              <div
                key={log.id}
                className="p-5 rounded-2xl bg-card border border-theme hover:border-accent-light-theme transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-primary-theme">
                      <Calendar className="w-3.5 h-3.5 text-accent-theme" />
                      {log.date}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(log)}
                        className="p-1 rounded text-secondary-theme hover:text-primary-theme"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteWellnessLog(log.id)}
                        className="p-1 rounded text-secondary-theme hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-app border border-theme">
                      <div className="flex items-center gap-1 text-[11px] text-secondary-theme">
                        <Moon className="w-3 h-3 text-indigo-400" />
                        <span>Sleep</span>
                      </div>
                      <p className="font-bold text-primary-theme mt-1">
                        {log.sleepHours} hrs{' '}
                        <span className="text-[10px] text-secondary-theme">({log.sleepQuality}/5)</span>
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-app border border-theme">
                      <div className="flex items-center gap-1 text-[11px] text-secondary-theme">
                        <Droplets className="w-3 h-3 text-blue-400" />
                        <span>Hydration</span>
                      </div>
                      <p className="font-bold text-primary-theme mt-1">{log.waterLiters} Liters</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-app border border-theme">
                      <div className="flex items-center gap-1 text-[11px] text-secondary-theme">
                        <MoodIcon className={`w-3 h-3 ${moodInfo.color}`} />
                        <span>Mood</span>
                      </div>
                      <p className={`font-bold mt-1 ${moodInfo.color}`}>
                        {moodInfo.label} ({log.mood}/5)
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-app border border-theme">
                      <div className="flex items-center gap-1 text-[11px] text-secondary-theme">
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>Energy</span>
                      </div>
                      <p className="font-bold text-primary-theme mt-1">{log.energyLevel}/5</p>
                    </div>
                  </div>

                  {log.notes && (
                    <p className="mt-3 text-xs text-secondary-theme italic bg-card-hover/40 p-2.5 rounded-xl">
                      "{log.notes}"
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
              {editingLog ? 'Edit Daily Wellness Log' : 'New Wellness Check-in'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-secondary-theme mb-1">Date</label>
                <DateTimePicker
                  type="date"
                  required
                  value={date}
                  onChange={setDate}
                  ariaLabel="Wellness log date"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-secondary-theme mb-1">Sleep (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    required
                    value={sleepHours}
                    onChange={(e) => setSleepHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-secondary-theme mb-1">Water (Liters)</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    max="10"
                    required
                    value={waterLiters}
                    onChange={(e) => setWaterLiters(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-secondary-theme mb-1">
                  Mood Rating: {mood}/5
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={mood}
                  onChange={(e) => setMood(Number(e.target.value))}
                  className="w-full accent-accent-theme"
                />
                <div className="flex justify-between text-[10px] text-secondary-theme">
                  <span>1 - Rough</span>
                  <span>3 - Okay</span>
                  <span>5 - Incredible</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-secondary-theme mb-1">
                  Energy Level: {energyLevel}/5
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(Number(e.target.value))}
                  className="w-full accent-accent-theme"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-secondary-theme mb-1">
                  Sleep Quality: {sleepQuality}/5
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(Number(e.target.value))}
                  className="w-full accent-accent-theme"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-secondary-theme mb-1">
                  Daily Notes & Gratitude
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What energized or drained you today? One thing you are grateful for..."
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
                  {editingLog ? 'Save Changes' : 'Save Check-in'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
