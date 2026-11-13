/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  Volume2,
  VolumeX,
  CloudRain,
  Radio,
  Sliders,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FocusSessionType } from '../types';
import { formatReadableDate } from '../utils/helpers';

export const FocusView: React.FC = () => {
  const {
    timerMode,
    timeLeft,
    isTimerRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    changeTimerMode,
    linkedTaskId,
    setLinkedTaskId,
    ambientSound,
    setAmbientSound,
    tasks,
    focusSessions,
    settings,
    updateSettings,
  } = useApp();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customFocus, setCustomFocus] = useState(settings.pomodoro.focusDuration);
  const [customBreak, setCustomBreak] = useState(settings.pomodoro.shortBreak);
  const [customLongBreak, setCustomLongBreak] = useState(settings.pomodoro.longBreak);

  // Formatted timer text
  const formattedMinutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const formattedSeconds = String(timeLeft % 60).padStart(2, '0');

  // Total duration in seconds for progress circular calculation
  const totalDurationSeconds = useMemo(() => {
    if (timerMode === 'focus') return settings.pomodoro.focusDuration * 60;
    if (timerMode === 'short_break') return settings.pomodoro.shortBreak * 60;
    return settings.pomodoro.longBreak * 60;
  }, [timerMode, settings.pomodoro]);

  const progressPercent = Math.max(
    0,
    Math.min(100, Math.round(((totalDurationSeconds - timeLeft) / totalDurationSeconds) * 100))
  );

  // Focus statistics for today
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = useMemo(() => {
    return focusSessions.filter((s) => s.timestamp.startsWith(todayStr) && s.type === 'focus');
  }, [focusSessions, todayStr]);

  const totalFocusMinutesToday = useMemo(() => {
    return todaySessions.reduce((acc, s) => acc + s.duration, 0);
  }, [todaySessions]);

  // Uncompleted tasks for linking
  const pendingTasks = useMemo(() => {
    return tasks.filter((t) => t.status !== 'completed');
  }, [tasks]);

  const activeLinkedTask = tasks.find((t) => t.id === linkedTaskId);

  const handleSaveDurations = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      pomodoro: {
        ...settings.pomodoro,
        focusDuration: Number(customFocus),
        shortBreak: Number(customBreak),
        longBreak: Number(customLongBreak),
      },
    });
    setIsSettingsOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-theme flex items-center gap-2">
            <Timer className="w-7 h-7 text-accent-theme" /> Focus Mode (Pomodoro)
          </h2>
          <p className="text-xs sm:text-sm text-secondary-theme mt-1">
            Deep uninterrupted work intervals, browser notifications, and ambient white noise.
          </p>
        </div>

        <button
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card-theme border border-theme text-secondary-theme hover:text-primary-theme text-xs font-semibold hover:bg-card-hover transition-colors shadow-xs self-start sm:self-auto"
        >
          <Sliders className="w-3.5 h-3.5" /> Adjust Durations
        </button>
      </div>

      {/* Adjust Custom Durations Panel */}
      {isSettingsOpen && (
        <form
          onSubmit={handleSaveDurations}
          className="p-5 rounded-2xl bg-card-theme border border-theme shadow-xs space-y-4 animate-in fade-in duration-150"
        >
          <h3 className="font-bold text-sm text-primary-theme">Custom Pomodoro Intervals (Minutes)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-secondary-theme mb-1">
                Focus Duration
              </label>
              <input
                type="number"
                min="1"
                max="90"
                value={customFocus}
                onChange={(e) => setCustomFocus(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-secondary-theme mb-1">
                Short Break
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={customBreak}
                onChange={(e) => setCustomBreak(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-secondary-theme mb-1">
                Long Break
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={customLongBreak}
                onChange={(e) => setCustomLongBreak(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="px-3 py-1.5 text-xs text-secondary-theme hover:bg-card-hover rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-accent-theme text-white rounded-xl hover:bg-accent-hover"
            >
              Save Presets
            </button>
          </div>
        </form>
      )}

      {/* Main Focus Card */}
      <div className="bg-card-theme rounded-3xl border border-theme shadow-md p-6 sm:p-10 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Interval Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-secondary-theme rounded-2xl border border-theme text-xs font-semibold mb-8">
          <button
            onClick={() => changeTimerMode('focus')}
            className={`px-4 py-2 rounded-xl transition-all ${
              timerMode === 'focus'
                ? 'bg-card-theme text-primary-theme shadow-xs font-bold'
                : 'text-secondary-theme hover:text-primary-theme'
            }`}
          >
            Deep Focus ({settings.pomodoro.focusDuration}m)
          </button>
          <button
            onClick={() => changeTimerMode('short_break')}
            className={`px-4 py-2 rounded-xl transition-all ${
              timerMode === 'short_break'
                ? 'bg-card-theme text-primary-theme shadow-xs font-bold'
                : 'text-secondary-theme hover:text-primary-theme'
            }`}
          >
            Short Break ({settings.pomodoro.shortBreak}m)
          </button>
          <button
            onClick={() => changeTimerMode('long_break')}
            className={`px-4 py-2 rounded-xl transition-all ${
              timerMode === 'long_break'
                ? 'bg-card-theme text-primary-theme shadow-xs font-bold'
                : 'text-secondary-theme hover:text-primary-theme'
            }`}
          >
            Long Break ({settings.pomodoro.longBreak}m)
          </button>
        </div>

        {/* Large Circular Dial */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-secondary-theme stroke-current"
              strokeWidth="5"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-accent-theme stroke-current transition-all duration-1000 ease-linear"
              strokeWidth="5"
              strokeDasharray={276}
              strokeDashoffset={276 - (276 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Time digits & State */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
            <span className="text-6xl sm:text-7xl font-extrabold tracking-tight font-mono text-primary-theme">
              {formattedMinutes}:{formattedSeconds}
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-secondary-theme mt-2 flex items-center gap-1.5">
              {isTimerRunning ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Running
                </>
              ) : (
                <>Paused</>
              )}
            </span>
          </div>
        </div>

        {/* Controls (Start, Pause, Reset, Skip) */}
        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={resetTimer}
            className="p-3.5 rounded-2xl bg-secondary-theme text-secondary-theme hover:text-primary-theme hover:bg-card-hover transition-colors"
            title="Reset interval"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={isTimerRunning ? pauseTimer : startTimer}
            className="px-8 py-4 rounded-2xl bg-accent-theme text-white text-base font-bold hover:bg-accent-hover transition-all shadow-md hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            {isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            <span>{isTimerRunning ? 'Pause Session' : 'Start Focus'}</span>
          </button>

          <button
            onClick={skipTimer}
            className="p-3.5 rounded-2xl bg-secondary-theme text-secondary-theme hover:text-primary-theme hover:bg-card-hover transition-colors"
            title="Skip to next interval"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Link session to a task */}
        <div className="mt-8 flex items-center gap-2 max-w-md w-full text-xs">
          <LinkIcon className="w-4 h-4 text-secondary-theme shrink-0" />
          <select
            value={linkedTaskId || ''}
            onChange={(e) => setLinkedTaskId(e.target.value || null)}
            className="flex-1 px-3 py-2 rounded-xl bg-secondary-theme border border-theme text-secondary-theme focus:ring-1 ring-accent-theme focus:outline-hidden"
          >
            <option value="">Link this session to an active task (optional)...</option>
            {pendingTasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>

        {activeLinkedTask && (
          <p className="text-xs text-accent-theme font-medium mt-2">
            Active Task: &ldquo;{activeLinkedTask.title}&rdquo;
          </p>
        )}

        {/* Ambient Noise Synthesizer Selector */}
        <div className="mt-6 pt-6 border-t border-theme w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-secondary-theme">
          <span className="font-semibold flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-accent-theme" /> Background Ambient Sound:
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAmbientSound('none')}
              className={`px-3 py-1 rounded-xl transition-colors ${
                ambientSound === 'none'
                  ? 'bg-secondary-theme font-bold text-primary-theme'
                  : 'hover:text-primary-theme'
              }`}
            >
              Mute
            </button>
            <button
              onClick={() => setAmbientSound('rain')}
              className={`flex items-center gap-1 px-3 py-1 rounded-xl transition-colors ${
                ambientSound === 'rain'
                  ? 'bg-accent-light-theme text-accent-theme font-bold'
                  : 'hover:text-primary-theme'
              }`}
            >
              <CloudRain className="w-3.5 h-3.5" /> Rain
            </button>
            <button
              onClick={() => setAmbientSound('white_noise')}
              className={`flex items-center gap-1 px-3 py-1 rounded-xl transition-colors ${
                ambientSound === 'white_noise'
                  ? 'bg-accent-light-theme text-accent-theme font-bold'
                  : 'hover:text-primary-theme'
              }`}
            >
              <Radio className="w-3.5 h-3.5" /> White Noise
            </button>
          </div>
        </div>
      </div>

      {/* Focus Stats & History Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-card-theme border border-theme shadow-xs">
          <span className="text-xs text-secondary-theme font-medium">Today&apos;s Focus Time</span>
          <p className="text-2xl font-extrabold text-primary-theme font-mono mt-1">
            {totalFocusMinutesToday} mins
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-card-theme border border-theme shadow-xs">
          <span className="text-xs text-secondary-theme font-medium">Completed Sessions Today</span>
          <p className="text-2xl font-extrabold text-primary-theme font-mono mt-1">
            {todaySessions.length}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-card-theme border border-theme shadow-xs">
          <span className="text-xs text-secondary-theme font-medium">Total Lifetime Focus Time</span>
          <p className="text-2xl font-extrabold text-primary-theme font-mono mt-1">
            {Math.round(
              focusSessions.filter((s) => s.type === 'focus').reduce((acc, s) => acc + s.duration, 0) / 60
            )}{' '}
            hours
          </p>
        </div>
      </div>

      {/* Recent Focus Log */}
      {focusSessions.length > 0 && (
        <div className="bg-card-theme rounded-2xl border border-theme shadow-xs p-5 space-y-3">
          <h3 className="font-bold text-sm text-primary-theme">Recent Completed Sessions</h3>
          <div className="divide-y divide-theme max-h-56 overflow-y-auto">
            {focusSessions.slice(0, 10).map((s) => (
              <div key={s.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="font-semibold text-primary-theme capitalize">
                    {s.type.replace('_', ' ')} ({s.duration}m)
                  </span>
                  {s.taskTitle && (
                    <span className="text-muted-theme truncate max-w-xs">· {s.taskTitle}</span>
                  )}
                </div>
                <span className="text-[11px] text-secondary-theme font-mono">
                  {formatReadableDate(s.timestamp.split('T')[0])}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
