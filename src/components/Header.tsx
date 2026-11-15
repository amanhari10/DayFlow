/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Menu, Search, Plus, Bell, Play, Pause } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTodayDateString, calculateBirthdayInfo } from '../utils/helpers';
import { formatShortcut } from '../utils/shortcuts';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileSidebar, onOpenNotifications }) => {
  const {
    settings,
    setIsSearchOpen,
    setIsQuickAddOpen,
    isTimerRunning,
    timeLeft,
    startTimer,
    pauseTimer,
    setActiveView,
    activeView,
    tasks,
    events,
    birthdays,
    notifications,
  } = useApp();

  const todayStr = getTodayDateString();

  // Compute greeting based on local time
  const greeting = useMemo(() => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Formatted date
  const formattedToday = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  // Total unread alerts count for the bell badge
  const alertsCount = useMemo(() => {
    const overdue = tasks.filter((t) => t.status !== 'completed' && t.dueDate < todayStr).length;
    const dueToday = tasks.filter((t) => t.status !== 'completed' && t.dueDate === todayStr).length;
    const eventsToday = events.filter((event) => event.date === todayStr).length;
    const bdays = birthdays.filter((b) => calculateBirthdayInfo(b).daysUntil <= 2).length;
    const unreadNotifs = notifications.filter((n) => !n.read).length;
    return overdue + dueToday + eventsToday + bdays + unreadNotifs;
  }, [tasks, events, birthdays, notifications, todayStr]);

  const formattedTimer = useMemo(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  }, [timeLeft]);
  const searchShortcut = formatShortcut('K');
  const quickAddShortcut = formatShortcut('N', true);

  return (
    <header className="sticky top-0 z-30 h-16 bg-sidebar/80 backdrop-blur-md border-b border-theme flex items-center justify-between gap-2 px-3 sm:px-6">
      {/* Left: Mobile hamburger & Greeting / Date */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="flex min-h-11 min-w-11 -ml-2 items-center justify-center rounded-xl p-2 text-secondary-theme transition-colors hover:bg-card-hover xl:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="truncate text-sm font-bold leading-tight text-primary-theme sm:text-base">
            <span className="hidden sm:inline">{greeting}, {settings.name.split(' ')[0]}</span>
            <span className="sm:hidden">{settings.name.split(' ')[0]}</span>
            <span className="hidden sm:inline-block">👋</span>
          </h1>
          <p className="hidden text-[11px] text-secondary-theme xl:block">
            {formattedToday}
          </p>
        </div>
      </div>

      {/* Middle & Right: Search, Quick Add, Pomodoro Status, Notification Bell */}
      <div className="flex shrink-0 items-center gap-1 sm:gap-2 lg:gap-3">
        {/* Search Bar Trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="group flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl border border-theme bg-card-theme px-3 py-1.5 text-xs font-medium text-secondary-theme shadow-xs transition-colors hover:border-strong-theme"
          title={`Search anything (${searchShortcut})`}
        >
          <Search className="w-3.5 h-3.5 group-hover:text-primary-theme" />
          <span className="hidden lg:inline">Quick Search...</span>
          <kbd className="hidden xl:inline-block text-[10px] px-1.5 py-0.5 rounded-sm bg-secondary-theme text-muted-theme font-mono">
            {searchShortcut}
          </kbd>
        </button>

        {/* Focus Timer Mini Pill (Header) */}
        {activeView !== 'focus' && (
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-secondary-theme border border-theme text-xs font-mono">
            <span
              onClick={() => setActiveView('focus')}
              className="cursor-pointer font-bold text-primary-theme hover:text-accent-theme transition-colors"
              title="Open Focus Mode"
            >
              ⏱️ {formattedTimer}
            </span>
            <button
              onClick={isTimerRunning ? pauseTimer : startTimer}
              className="p-1 rounded-md hover:bg-card-hover text-secondary-theme hover:text-primary-theme transition-colors"
              title={isTimerRunning ? 'Pause timer' : 'Start focus timer'}
            >
              {isTimerRunning ? <Pause className="w-3 h-3 text-amber-500" /> : <Play className="w-3 h-3 text-emerald-500" />}
            </button>
          </div>
        )}

        {/* Quick Add Button */}
        <button
          onClick={() => setIsQuickAddOpen(true)}
          className="flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-xl bg-accent-theme px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-accent-hover"
          title={`Quick Add (${quickAddShortcut})`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add</span>
          <kbd className="hidden lg:inline-block text-[10px] opacity-75 font-mono">
            {quickAddShortcut}
          </kbd>
        </button>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative flex min-h-11 min-w-11 items-center justify-center rounded-xl p-2 text-secondary-theme transition-colors hover:bg-card-hover hover:text-primary-theme"
          aria-label="View notifications and reminders"
        >
          <Bell className="w-4 h-4" />
          {alertsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-sidebar" />
          )}
        </button>
      </div>
    </header>
  );
};
