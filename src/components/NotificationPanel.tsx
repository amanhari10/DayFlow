/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Bell, Check, Trash2, X, AlertTriangle, Calendar, Gift, Clock, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTodayDateString, calculateBirthdayInfo, formatReadableDate } from '../utils/helpers';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const {
    tasks,
    events,
    birthdays,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    settings,
    requestNotificationPermission,
    setActiveView,
  } = useApp();

  const todayStr = getTodayDateString();

  // Compute live contextual alert reminders in addition to logged notifications
  const overdueTasks = useMemo(() => {
    return tasks.filter((t) => t.status !== 'completed' && t.dueDate < todayStr);
  }, [tasks, todayStr]);

  const todayTasks = useMemo(() => {
    return tasks.filter((t) => t.status !== 'completed' && t.dueDate === todayStr);
  }, [tasks, todayStr]);

  const upcomingBirthdaysAlerts = useMemo(() => {
    return birthdays
      .map((b) => ({ ...b, info: calculateBirthdayInfo(b) }))
      .filter((b) => b.info.daysUntil <= 3)
      .sort((a, b) => a.info.daysUntil - b.info.daysUntil);
  }, [birthdays]);

  const todayEvents = useMemo(() => {
    return events.filter((e) => e.date === todayStr);
  }, [events, todayStr]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
      <div
        className="w-full max-w-md h-full bg-modal-theme border-l border-theme shadow-2xl flex flex-col text-primary-theme animate-in slide-in-from-right duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-theme">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-accent-theme" />
            <h2 className="font-bold text-lg">Notifications & Reminders</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-secondary-theme hover:bg-card-hover"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Browser Notification Banner */}
        {!settings.browserNotifications && (
          <div className="p-3 mx-4 mt-3 rounded-xl bg-accent-light-theme border border-accent-light-theme text-xs flex flex-col gap-2">
            <div className="flex items-center gap-1.5 font-semibold text-accent-theme">
              <ShieldCheck className="w-4 h-4" /> Enable Web Notifications
            </div>
            <p className="text-secondary-theme leading-relaxed">
              Receive alerts for task deadlines, upcoming events, and birthdays while DayFlow is open in your browser.
            </p>
            <button
              onClick={requestNotificationPermission}
              className="self-start px-3 py-1 rounded-lg bg-accent-theme text-white font-medium hover:bg-accent-hover transition-colors"
            >
              Grant Permission
            </button>
          </div>
        )}

        {/* Action toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-theme text-xs text-secondary-theme bg-secondary-theme">
          <span>Active Alerts</span>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsRead}
              className="flex items-center gap-1 hover:text-primary-theme"
            >
              <Check className="w-3.5 h-3.5" /> Mark all read
            </button>
            <span>·</span>
            <button
              onClick={clearNotifications}
              className="flex items-center gap-1 hover:text-rose-500"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Overdue tasks urgent callout */}
          {overdueTasks.length > 0 && (
            <div
              onClick={() => {
                setActiveView('tasks');
                onClose();
              }}
              className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 cursor-pointer hover:bg-rose-500/15 transition-colors"
            >
              <div className="flex items-center gap-2 font-semibold text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? 's' : ''}</span>
              </div>
              <p className="text-xs text-rose-500/80 mt-1">
                {overdueTasks[0].title}
                {overdueTasks.length > 1 ? ` and ${overdueTasks.length - 1} more` : ''} need attention.
              </p>
            </div>
          )}

          {/* Today & Upcoming Birthday Alert */}
          {upcomingBirthdaysAlerts.length > 0 && (
            <div
              onClick={() => {
                setActiveView('birthdays');
                onClose();
              }}
              className="p-3.5 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-500 cursor-pointer hover:bg-pink-500/15 transition-colors"
            >
              <div className="flex items-center gap-2 font-semibold text-sm">
                <Gift className="w-4 h-4 shrink-0" />
                <span>Upcoming Birthdays</span>
              </div>
              <div className="mt-1 space-y-1 text-xs">
                {upcomingBirthdaysAlerts.map((b) => (
                  <p key={b.id}>
                    • <strong>{b.name}</strong>: {b.info.displayText}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Today's Schedule Alert */}
          {todayEvents.length > 0 && (
            <div
              onClick={() => {
                setActiveView('calendar');
                onClose();
              }}
              className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 cursor-pointer hover:bg-purple-500/15 transition-colors"
            >
              <div className="flex items-center gap-2 font-semibold text-sm text-purple-500">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>{todayEvents.length} Event{todayEvents.length > 1 ? 's' : ''} Scheduled Today</span>
              </div>
              <div className="mt-1 space-y-1 text-xs text-secondary-theme">
                {todayEvents.map((e) => (
                  <p key={e.id}>
                    • {e.startTime}: <strong>{e.title}</strong>
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Today's Pending Tasks */}
          {todayTasks.length > 0 && (
            <div
              onClick={() => {
                setActiveView('tasks');
                onClose();
              }}
              className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-500 cursor-pointer hover:bg-blue-500/15 transition-colors"
            >
              <div className="flex items-center gap-2 font-semibold text-sm">
                <Clock className="w-4 h-4 shrink-0" />
                <span>{todayTasks.length} Task{todayTasks.length > 1 ? 's' : ''} Due Today</span>
              </div>
              <p className="text-xs text-secondary-theme mt-1">
                Top item: {todayTasks[0].title}
              </p>
            </div>
          )}

          {/* Logged notifications from IndexedDB */}
          {notifications.length > 0 && (
            <div className="pt-2">
              <h3 className="text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-2">
                Recent Notifications
              </h3>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl border transition-colors ${
                      n.read
                        ? 'bg-card-theme border-subtle-theme text-secondary-theme'
                        : 'bg-card-theme border-accent-light-theme text-primary-theme shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (!n.read) void markNotificationRead(n.id);
                          if (n.linkView) setActiveView(n.linkView);
                          onClose();
                        }}
                        className="min-w-0 text-left flex-1"
                      >
                        <p className="text-sm font-semibold truncate">{n.title}</p>
                        <p className="text-xs text-secondary-theme mt-0.5">{n.message}</p>
                        <span className="text-[10px] text-muted-theme mt-1 block">
                          {formatReadableDate(n.timestamp.split('T')[0])}
                        </span>
                      </button>
                      {!n.read && (
                        <button
                          onClick={() => markNotificationRead(n.id)}
                          className="p-1 text-secondary-theme hover:text-accent-theme rounded"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {overdueTasks.length === 0 &&
            upcomingBirthdaysAlerts.length === 0 &&
            todayEvents.length === 0 &&
            todayTasks.length === 0 &&
            notifications.length === 0 && (
              <div className="p-8 text-center text-secondary-theme">
                <Bell className="w-8 h-8 mx-auto text-muted-theme opacity-30 mb-2" />
                <p className="font-medium text-primary-theme">You&apos;re completely up to date!</p>
                <p className="text-xs text-muted-theme mt-1">
                  No overdue tasks or immediate alerts at this moment.
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
