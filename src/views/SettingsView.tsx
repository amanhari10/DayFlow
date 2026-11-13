/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Laptop,
  Palette,
  Download,
  Upload,
  Trash2,
  Database,
  ShieldCheck,
  Volume2,
  FileSpreadsheet,
  AlertTriangle,
  Sparkles,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ThemeMode, AccentColor, Priority, CalendarViewType, UserSettings } from '../types';
import { exportTasksToCSV, exportEventsToCSV, exportBirthdaysToCSV, downloadBlob } from '../utils/helpers';
import { CURRENCY_OPTIONS } from '../utils/currency';

type SidebarSectionKey = keyof UserSettings['sidebarSections'];

const SIDEBAR_PREFERENCES: {
  label: string;
  sectionKey?: SidebarSectionKey;
  modules: { key: string; label: string }[];
}[] = [
  {
    label: 'Core Planner Tools',
    modules: [
      { key: 'briefing', label: 'Daily Briefing' },
      { key: 'routines', label: 'Routines' },
    ],
  },
  {
    label: 'Productivity',
    sectionKey: 'productivity',
    modules: [
      { key: 'eisenhower', label: 'Eisenhower Matrix' },
      { key: 'timeblocking', label: 'Time Blocking' },
      { key: 'reviews', label: 'Weekly & Monthly Reviews' },
      { key: 'countdowns', label: 'Countdown Center' },
    ],
  },
  {
    label: 'Life & Relationships',
    sectionKey: 'lifeRelationships',
    modules: [
      { key: 'specialDates', label: 'Special Dates' },
      { key: 'goals', label: 'Goals & Milestones' },
      { key: 'bucketList', label: 'Bucket List' },
      { key: 'timeline', label: 'Life Timeline' },
      { key: 'decisions', label: 'Decision Journal' },
    ],
  },
  {
    label: 'Finance & Wealth',
    sectionKey: 'financeWealth',
    modules: [
      { key: 'finances', label: 'Expenses & Budget' },
      { key: 'savings', label: 'Savings Goals' },
      { key: 'wishlist', label: 'Wishlist & Purchases' },
      { key: 'subscriptions', label: 'Subscriptions' },
    ],
  },
  {
    label: 'Health & Lifestyle',
    sectionKey: 'healthLifestyle',
    modules: [
      { key: 'fitness', label: 'Workouts & Fitness' },
      { key: 'wellness', label: 'Wellness & Sleep' },
      { key: 'reading', label: 'Reading Tracker' },
      { key: 'meals', label: 'Meal Planner' },
      { key: 'chores', label: 'Household Chores' },
    ],
  },
  {
    label: 'Growth & Career',
    sectionKey: 'growthCareer',
    modules: [
      { key: 'student', label: 'Student Dashboard' },
      { key: 'skills', label: 'Skills & Certifications' },
      { key: 'career', label: 'Career & Jobs' },
      { key: 'knowledge', label: 'Knowledge Hub' },
    ],
  },
  {
    label: 'Records & Analytics',
    sectionKey: 'recordsAnalytics',
    modules: [
      { key: 'travel', label: 'Travel Planner' },
      { key: 'vault', label: 'Document Vault' },
    ],
  },
];

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    toggleModuleEnabled,
    setThemeMode,
    setAccentColor,
    tasks,
    events,
    birthdays,
    loadSampleData,
    purgeDemoData,
    resetAllData,
    exportBackup,
    importBackup,
    requestNotificationPermission,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(settings.name);
  const [avatarEmoji, setAvatarEmoji] = useState(settings.avatarEmoji);
  const [profileSaved, setProfileSaved] = useState(false);

  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      name: name.trim() || 'Alex Rivera',
      avatarEmoji: avatarEmoji.trim() || '⚡',
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  // Handle Full JSON Backup Export
  const handleExportJSON = async () => {
    try {
      const backup = await exportBackup();
      const content = JSON.stringify(backup, null, 2);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      downloadBlob(content, `dayflow_backup_${timestamp}.json`, 'application/json');
      setActionMessage('Full JSON backup successfully exported!');
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err) {
      console.error(err);
      setActionMessage('Failed to generate backup.');
    }
  };

  // Handle Full JSON Backup Import
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImportStatus('Reading and validating file...');
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!parsed || (!parsed.tasks && !parsed.events && !parsed.habits && !parsed.notes)) {
        throw new Error('File does not match the DayFlow backup schema.');
      }

      await importBackup(parsed, 'replace');
      setImportStatus('Backup successfully restored!');
      setActionMessage('All data restored from backup.');
      setTimeout(() => {
        setImportStatus(null);
        setActionMessage(null);
      }, 4000);
    } catch (err: any) {
      console.error(err);
      setImportStatus(`Import failed: ${err.message || 'Invalid format'}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Demo Data Handlers
  const handleLoadDemo = async () => {
    await loadSampleData();
    setActionMessage('Sample demo records loaded.');
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handlePurgeDemo = async () => {
    const result = await purgeDemoData();
    setActionMessage(
      `Removed ${result.tasks} tasks, ${result.events} events, ${result.birthdays} birthdays, and ${result.habits} habits.`
    );
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleFactoryReset = async () => {
    await resetAllData();
    setIsResetConfirmOpen(false);
    setActionMessage('All local data completely cleared.');
    setTimeout(() => setActionMessage(null), 4000);
  };

  const accentOptions: { name: AccentColor; label: string; colorClass: string }[] = [
    { name: 'blue', label: 'Blue', colorClass: 'bg-blue-500' },
    { name: 'purple', label: 'Purple', colorClass: 'bg-purple-500' },
    { name: 'green', label: 'Emerald', colorClass: 'bg-emerald-500' },
    { name: 'orange', label: 'Orange', colorClass: 'bg-orange-500' },
    { name: 'rose', label: 'Rose', colorClass: 'bg-rose-500' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Top Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-theme flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-accent-theme" /> Settings & Data Management
        </h2>
        <p className="text-xs sm:text-sm text-secondary-theme mt-1">
          Customize themes, accent colors, preferences, JSON backups, and local storage.
        </p>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-accent-light-theme border border-accent-light-theme text-accent-theme text-sm font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 shrink-0" />
          {actionMessage}
        </div>
      )}

      {/* SECTION 1: APPEARANCE & THEME */}
      <div className="bg-card-theme rounded-2xl border border-theme shadow-xs p-6 space-y-6">
        <div className="pb-3 border-b border-theme flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-primary-theme flex items-center gap-2">
              <Palette className="w-4 h-4 text-accent-theme" /> Theme & Appearance
            </h3>
            <p className="text-xs text-secondary-theme">
              Choose your lighting mode and brand accent color across the entire interface.
            </p>
          </div>
        </div>

        {/* Theme Mode Selector (Light, Dark, System) */}
        <div>
          <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-2">
            Theme Mode
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { mode: 'light' as ThemeMode, label: 'Light', icon: Sun },
              { mode: 'dark' as ThemeMode, label: 'Dark', icon: Moon },
              { mode: 'system' as ThemeMode, label: 'System Default', icon: Laptop },
            ].map(({ mode, label, icon: Icon }) => (
              <button
                key={mode}
                onClick={() => setThemeMode(mode)}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  settings.themeMode === mode
                    ? 'border-accent-theme bg-accent-light-theme text-accent-theme font-bold shadow-xs'
                    : 'border-theme bg-secondary-theme text-secondary-theme hover:bg-card-hover hover:text-primary-theme'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Accent Colors */}
        <div>
          <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-2">
            Accent Brand Color
          </label>
          <div className="flex items-center gap-3 flex-wrap">
            {accentOptions.map((opt) => (
              <button
                key={opt.name}
                onClick={() => setAccentColor(opt.name)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                  settings.accentColor === opt.name
                    ? 'border-accent-theme bg-accent-light-theme font-bold text-accent-theme ring-2 ring-accent-theme'
                    : 'border-theme bg-secondary-theme text-secondary-theme hover:bg-card-hover'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full ${opt.colorClass}`} />
                <span className="text-xs">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: USER PROFILE & GREETING */}
      <form onSubmit={handleSaveProfile} className="bg-card-theme rounded-2xl border border-theme shadow-xs p-6 space-y-4">
        <div className="pb-3 border-b border-theme flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-primary-theme">Personal Profile</h3>
            <p className="text-xs text-secondary-theme">Customizes dashboard greetings and identity.</p>
          </div>
          {profileSaved && <span className="text-xs font-bold text-emerald-500">Saved ✓</span>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-input-theme border border-theme text-sm font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1">
              Avatar Emoji / Icon
            </label>
            <input
              type="text"
              maxLength={2}
              value={avatarEmoji}
              onChange={(e) => setAvatarEmoji(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-input-theme border border-theme text-sm text-center"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-xs"
          >
            Save Profile
          </button>
        </div>
      </form>

      {/* SECTION 3: BUDGET CURRENCY */}
      <div className="bg-card-theme rounded-2xl border border-theme shadow-xs p-6 space-y-4">
        <div className="pb-3 border-b border-theme">
          <h3 className="font-bold text-base text-primary-theme">Budget Currency</h3>
          <p className="text-xs text-secondary-theme">
            Choose the currency symbol and format used throughout your finance features. Existing amounts will not be converted.
          </p>
        </div>
        <div className="max-w-sm">
          <label htmlFor="settings-currency" className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1">
            Display Currency
          </label>
          <select
            id="settings-currency"
            value={settings.currency}
            onChange={(e) => {
              const currency = CURRENCY_OPTIONS.find((option) => option.code === e.target.value)?.code;
              if (currency) void updateSettings({ currency });
            }}
            className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs"
          >
            {CURRENCY_OPTIONS.map(({ code, name }) => (
              <option key={code} value={code}>{code} — {name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* SECTION 4: SIDEBAR SECTIONS AND MODULE VISIBILITY */}
      <div className="bg-card-theme rounded-2xl border border-theme shadow-xs p-6 space-y-4">
        <div className="pb-3 border-b border-theme">
          <h3 className="font-bold text-base text-primary-theme">Sidebar Sections & Modules</h3>
          <p className="text-xs text-secondary-theme">
            Hide entire sidebar sections or turn off individual pages. Your data is kept and can be shown again anytime.
          </p>
        </div>
        <div className="space-y-4">
          {SIDEBAR_PREFERENCES.map((section) => (
            <section key={section.label} className="rounded-xl border border-theme p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-sm font-bold text-primary-theme">{section.label}</h4>
                {section.sectionKey && (
                  <label className="flex items-center gap-2 text-xs font-medium text-secondary-theme">
                    <input
                      type="checkbox"
                      checked={settings.sidebarSections[section.sectionKey] !== false}
                      onChange={(e) =>
                        updateSettings({
                          sidebarSections: {
                            ...settings.sidebarSections,
                            [section.sectionKey as SidebarSectionKey]: e.target.checked,
                          },
                        })
                      }
                      className="accent-current"
                    />
                    Show section
                  </label>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {section.modules.map((module) => (
                  <label key={module.key} className="flex items-center gap-2 rounded-lg bg-secondary-theme px-3 py-2 text-xs text-primary-theme">
                    <input
                      type="checkbox"
                      checked={settings.enabledModules[module.key] !== false}
                      onChange={() => void toggleModuleEnabled(module.key)}
                      className="accent-current"
                    />
                    {module.label}
                  </label>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* SECTION 5: CALENDAR & APP PREFERENCES */}
      <div className="bg-card-theme rounded-2xl border border-theme shadow-xs p-6 space-y-4">
        <div className="pb-3 border-b border-theme">
          <h3 className="font-bold text-base text-primary-theme">Calendar & Productivity Preferences</h3>
          <p className="text-xs text-secondary-theme">Customize defaults for calendars and task priorities.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1">
              Start of Week
            </label>
            <select
              value={settings.firstDayOfWeek}
              onChange={(e) => updateSettings({ firstDayOfWeek: e.target.value as any })}
              className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs"
            >
              <option value="monday">Monday</option>
              <option value="sunday">Sunday</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1">
              Default Calendar View
            </label>
            <select
              value={settings.defaultCalendarView}
              onChange={(e) => updateSettings({ defaultCalendarView: e.target.value as CalendarViewType })}
              className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs"
            >
              <option value="month">Month</option>
              <option value="week">Week</option>
              <option value="day">Day</option>
              <option value="agenda">Agenda</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1">
              Default Task Priority
            </label>
            <select
              value={settings.defaultTaskPriority}
              onChange={(e) => updateSettings({ defaultTaskPriority: e.target.value as Priority })}
              className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-accent-theme" />
            <span className="font-semibold text-primary-theme">Timer Sound Effects</span>
          </div>
          <button
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
              settings.soundEnabled
                ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                : 'bg-secondary-theme text-secondary-theme'
            }`}
          >
            {settings.soundEnabled ? 'Enabled ✓' : 'Muted'}
          </button>
        </div>
      </div>

      {/* SECTION 6: BACKUP, RESTORE & CSV EXPORT */}
      <div className="bg-card-theme rounded-2xl border border-theme shadow-xs p-6 space-y-6">
        <div className="pb-3 border-b border-theme flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-primary-theme flex items-center gap-2">
              <Database className="w-4 h-4 text-accent-theme" /> Data Backup & Portability
            </h3>
            <p className="text-xs text-secondary-theme">
              Export and restore all application state locally via JSON, or download individual CSVs.
            </p>
          </div>
        </div>

        {/* JSON Full Backup & Restore */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-secondary-theme border border-theme flex flex-col justify-between gap-3">
            <div>
              <h4 className="font-bold text-sm text-primary-theme flex items-center gap-2">
                <Download className="w-4 h-4 text-accent-theme" /> Export Full JSON Backup
              </h4>
              <p className="text-xs text-secondary-theme mt-1">
                Creates a single file containing all tasks, events, birthdays, habit logs, notes, and focus history.
              </p>
            </div>
            <button
              onClick={handleExportJSON}
              className="px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-xs"
            >
              Export JSON File
            </button>
          </div>

          <div className="p-4 rounded-xl bg-secondary-theme border border-theme flex flex-col justify-between gap-3">
            <div>
              <h4 className="font-bold text-sm text-primary-theme flex items-center gap-2">
                <Upload className="w-4 h-4 text-accent-theme" /> Restore JSON Backup
              </h4>
              <p className="text-xs text-secondary-theme mt-1">
                Upload a previous DayFlow JSON file to restore your entire application database.
              </p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-2 rounded-xl bg-card-theme border border-theme text-primary-theme text-xs font-semibold hover:bg-card-hover transition-colors shadow-xs"
              >
                Upload & Restore
              </button>
              {importStatus && (
                <p className="text-[11px] text-accent-theme mt-1 font-medium">{importStatus}</p>
              )}
            </div>
          </div>
        </div>

        {/* CSV Exporters */}
        <div>
          <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-2">
            Export Tabular Data (CSV)
          </label>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => exportTasksToCSV(tasks)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card-theme border border-theme text-xs font-semibold hover:bg-card-hover transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500" /> Export Tasks CSV ({tasks.length})
            </button>
            <button
              onClick={() => exportEventsToCSV(events)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card-theme border border-theme text-xs font-semibold hover:bg-card-hover transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-purple-500" /> Export Events CSV ({events.length})
            </button>
            <button
              onClick={() => exportBirthdaysToCSV(birthdays)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card-theme border border-theme text-xs font-semibold hover:bg-card-hover transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-rose-500" /> Export Birthdays CSV ({birthdays.length})
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 7: DEMO DATA MANAGEMENT */}
      <div className="bg-card-theme rounded-2xl border border-theme shadow-xs p-6 space-y-4">
        <div className="pb-3 border-b border-theme">
          <h3 className="font-bold text-base text-primary-theme flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" /> Sample Demo Data Controls
          </h3>
          <p className="text-xs text-secondary-theme">
            You can load realistic sample tasks, events, birthdays, and habits for testing, or clean them up anytime with one click.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleLoadDemo}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-secondary-theme border border-theme text-xs font-semibold hover:bg-card-hover transition-colors"
          >
            Load Sample Demo Records
          </button>
          <button
            onClick={handlePurgeDemo}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-semibold hover:bg-amber-500/20 transition-colors"
          >
            Purge Only Demo Records
          </button>
        </div>
      </div>

      {/* SECTION 8: DANGER ZONE */}
      <div className="bg-rose-500/5 rounded-2xl border border-rose-500/20 p-6 space-y-4">
        <div className="pb-2 border-b border-rose-500/20">
          <h3 className="font-bold text-base text-rose-500 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Danger Zone
          </h3>
          <p className="text-xs text-secondary-theme">
            Permanently erase all locally stored data from your browser.
          </p>
        </div>

        {!isResetConfirmOpen ? (
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 transition-colors shadow-xs"
          >
            Clear All Application Data...
          </button>
        ) : (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-3">
            <p className="text-xs font-bold text-rose-500">
              ⚠️ Are you sure? This will delete all tasks, events, birthdays, habits, and notes from IndexedDB. This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleFactoryReset}
                className="px-4 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
              >
                Yes, Permanently Delete Everything
              </button>
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-card-theme border border-theme text-xs font-semibold hover:bg-card-hover"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
