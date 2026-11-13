/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Sun,
  Calendar,
  CheckSquare,
  Gift,
  Flame,
  FileText,
  Timer,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Moon,
  Laptop,
  Sunrise,
  Grid,
  Clock,
  Compass,
  Hourglass,
  Heart,
  Target,
  ListOrdered,
  History,
  Scale,
  DollarSign,
  PiggyBank,
  ShoppingBag,
  CreditCard,
  Dumbbell,
  BookOpen,
  Utensils,
  Home,
  GraduationCap,
  Award,
  Briefcase,
  BrainCircuit,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActiveView, SidebarSectionVisibility } from '../types';
import { getTodayDateString, calculateBirthdayInfo } from '../utils/helpers';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

interface NavSection {
  title: string;
  visibilityKey?: keyof SidebarSectionVisibility;
  items: Array<{
    id: ActiveView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
    moduleKey?: string;
  }>;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const {
    activeView,
    setActiveView,
    sidebarCollapsed,
    setSidebarCollapsed,
    tasks,
    birthdays,
    isTimerRunning,
    timeLeft,
    settings,
    setThemeMode,
  } = useApp();

  const todayStr = getTodayDateString();

  // Badges calculation
  const todayTasksCount = useMemo(() => {
    return tasks.filter((t) => t.status !== 'completed' && t.dueDate === todayStr).length;
  }, [tasks, todayStr]);

  const overdueCount = useMemo(() => {
    return tasks.filter((t) => t.status !== 'completed' && t.dueDate < todayStr).length;
  }, [tasks, todayStr]);

  const upcomingBirthdaysCount = useMemo(() => {
    return birthdays.filter((b) => calculateBirthdayInfo(b).daysUntil <= 7).length;
  }, [birthdays]);

  // Section collapse state (for expanded sidebar mode)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    'Productivity': false,
    'Life & Relationships': false,
    'Finance': false,
    'Health & Lifestyle': false,
    'Growth & Career': false,
    'Records': false,
  });

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const navSections: NavSection[] = useMemo(() => [
    {
      title: 'Core Planner',
      items: [
        { id: 'day', label: 'My Day', icon: Sun, badge: todayTasksCount || undefined, badgeColor: 'bg-accent-theme text-white' },
        { id: 'briefing', label: 'Daily Briefing', icon: Sunrise, moduleKey: 'briefing' },
        { id: 'calendar', label: 'Calendar', icon: Calendar },
        { id: 'tasks', label: 'Tasks & Projects', icon: CheckSquare, badge: overdueCount || undefined, badgeColor: 'bg-rose-500 text-white' },
        { id: 'focus', label: 'Focus Mode', icon: Timer },
        { id: 'routines', label: 'Routines', icon: Sparkles, moduleKey: 'routines' },
      ],
    },
    {
      title: 'Productivity',
      visibilityKey: 'productivity',
      items: [
        { id: 'eisenhower', label: 'Eisenhower Matrix', icon: Grid, moduleKey: 'eisenhower' },
        { id: 'timeblocking', label: 'Time Blocking', icon: Clock, moduleKey: 'timeblocking' },
        { id: 'reviews', label: 'Weekly & Monthly Reviews', icon: Compass, moduleKey: 'reviews' },
        { id: 'countdowns', label: 'Countdown Center', icon: Hourglass, moduleKey: 'countdowns' },
      ],
    },
    {
      title: 'Life & Relationships',
      visibilityKey: 'lifeRelationships',
      items: [
        { id: 'birthdays', label: 'Birthdays', icon: Gift, badge: upcomingBirthdaysCount || undefined, badgeColor: 'bg-pink-500 text-white' },
        { id: 'special_dates', label: 'Special Dates', icon: Heart, moduleKey: 'specialDates' },
        { id: 'goals', label: 'Goals & Milestones', icon: Target, moduleKey: 'goals' },
        { id: 'bucket_list', label: 'Bucket List', icon: ListOrdered, moduleKey: 'bucketList' },
        { id: 'timeline', label: 'Life Timeline', icon: History, moduleKey: 'timeline' },
        { id: 'decisions', label: 'Decision Journal', icon: Scale, moduleKey: 'decisions' },
      ],
    },
    {
      title: 'Finance & Wealth',
      visibilityKey: 'financeWealth',
      items: [
        { id: 'finances', label: 'Expenses & Budget', icon: DollarSign, moduleKey: 'finances' },
        { id: 'savings', label: 'Savings Goals', icon: PiggyBank, moduleKey: 'savings' },
        { id: 'wishlist', label: 'Wishlist & Purchases', icon: ShoppingBag, moduleKey: 'wishlist' },
        { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, moduleKey: 'subscriptions' },
      ],
    },
    {
      title: 'Health & Lifestyle',
      visibilityKey: 'healthLifestyle',
      items: [
        { id: 'habits', label: 'Habits Board', icon: Flame },
        { id: 'fitness', label: 'Workouts & Fitness', icon: Dumbbell, moduleKey: 'fitness' },
        { id: 'wellness', label: 'Wellness & Sleep', icon: Heart, moduleKey: 'wellness' },
        { id: 'reading', label: 'Reading Tracker', icon: BookOpen, moduleKey: 'reading' },
        { id: 'meals', label: 'Meal Planner', icon: Utensils, moduleKey: 'meals' },
        { id: 'chores', label: 'Household Chores', icon: Home, moduleKey: 'chores' },
      ],
    },
    {
      title: 'Growth & Career',
      visibilityKey: 'growthCareer',
      items: [
        { id: 'student', label: 'Student Dashboard', icon: GraduationCap, moduleKey: 'student' },
        { id: 'skills', label: 'Skills & Certifications', icon: Award, moduleKey: 'skills' },
        { id: 'career', label: 'Career & Jobs', icon: Briefcase, moduleKey: 'career' },
        { id: 'knowledge', label: 'Knowledge Hub', icon: BrainCircuit, moduleKey: 'knowledge' },
      ],
    },
    {
      title: 'Records & Analytics',
      visibilityKey: 'recordsAnalytics',
      items: [
        { id: 'notes', label: 'Notes & Journal', icon: FileText },
        { id: 'travel', label: 'Travel Planner', icon: MapPin, moduleKey: 'travel' },
        { id: 'vault', label: 'Document Vault', icon: ShieldCheck, moduleKey: 'vault' },
        { id: 'analytics', label: 'Analytics', icon: BarChart2 },
      ],
    },
  ], [todayTasksCount, overdueCount, upcomingBirthdaysCount]);

  const handleNavClick = (id: ActiveView) => {
    setActiveView(id);
    if (mobileOpen) setMobileOpen(false);
  };

  const cycleTheme = () => {
    if (settings.themeMode === 'dark') {
      setThemeMode('light');
    } else if (settings.themeMode === 'light') {
      setThemeMode('system');
    } else {
      setThemeMode('dark');
    }
  };

  const formattedTimer = useMemo(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  }, [timeLeft]);

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen bg-sidebar border-r border-theme flex flex-col justify-between transition-all duration-200 select-none ${
          mobileOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'
        } ${sidebarCollapsed ? 'md:w-20' : 'md:w-72'}`}
      >
        {/* Brand / Logo */}
        <div className="p-4 border-b border-theme flex items-center justify-between">
          <div
            onClick={() => handleNavClick('day')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-accent-theme flex items-center justify-center text-white shadow-sm font-bold text-lg group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <span className="font-extrabold text-base tracking-tight text-primary-theme block leading-none">
                  DayFlow
                </span>
                <span className="text-[10px] text-secondary-theme font-medium tracking-wider uppercase mt-1 block">
                  Life Productivity OS
                </span>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-secondary-theme hover:bg-card-hover transition-colors"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {navSections.map((section) => {
            if (section.visibilityKey && settings.sidebarSections[section.visibilityKey] === false) {
              return null;
            }

            // Filter out items disabled in user settings
            const visibleItems = section.items.filter((item) => {
              if (item.moduleKey && settings.enabledModules[item.moduleKey] === false) {
                return false;
              }
              return true;
            });

            if (visibleItems.length === 0) return null;
            const isSectionCollapsed = collapsedSections[section.title] && !sidebarCollapsed;

            return (
              <div key={section.title} className="space-y-1">
                {/* Section Header */}
                {!sidebarCollapsed && section.title !== 'Core Planner' && (
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full flex items-center justify-between px-3 py-1 text-[10px] font-bold text-secondary-theme/70 uppercase tracking-wider hover:text-primary-theme transition-colors"
                  >
                    <span>{section.title}</span>
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${isSectionCollapsed ? '-rotate-90' : ''}`}
                    />
                  </button>
                )}

                {/* Section Items */}
                {(!isSectionCollapsed || sidebarCollapsed) && (
                  <div className="space-y-0.5">
                    {visibleItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeView === item.id;
                      const isFocusActive = item.id === 'focus' && isTimerRunning;

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-xs sm:text-sm transition-colors relative group ${
                            isActive
                              ? 'bg-accent-light-theme text-accent-theme font-semibold'
                              : 'text-secondary-theme hover:bg-card-hover hover:text-primary-theme'
                          } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                          title={sidebarCollapsed ? item.label : undefined}
                        >
                          <div className="relative">
                            <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 ${isActive ? 'text-accent-theme' : ''}`} />
                            {isFocusActive && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                            )}
                          </div>

                          {!sidebarCollapsed && (
                            <span className="truncate flex-1 text-left">{item.label}</span>
                          )}

                          {/* Badge */}
                          {!sidebarCollapsed && item.badge && item.badge > 0 && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                                item.badgeColor || 'bg-secondary-theme text-secondary-theme'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}

                          {/* Collapsed dot alert */}
                          {sidebarCollapsed && item.badge && item.badge > 0 && (
                            <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-rose-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Live Mini Pomodoro Banner in Sidebar if running and not in Focus View */}
        {isTimerRunning && activeView !== 'focus' && !sidebarCollapsed && (
          <div
            onClick={() => handleNavClick('focus')}
            className="mx-3 mb-2 p-2.5 rounded-xl bg-accent-light-theme border border-accent-light-theme cursor-pointer hover:bg-accent-light-theme/80 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-accent-theme">Focus Mode</span>
            </div>
            <span className="font-mono text-xs font-bold text-accent-theme">{formattedTimer}</span>
          </div>
        )}

        {/* Bottom User Profile, Theme & Settings */}
        <div className="p-3 border-t border-theme space-y-1">
          {/* Quick theme switcher button */}
          <button
            onClick={cycleTheme}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-secondary-theme hover:bg-card-hover transition-colors ${
              sidebarCollapsed ? 'justify-center px-0' : ''
            }`}
            title={`Current theme: ${settings.themeMode}. Click to switch.`}
          >
            {settings.themeMode === 'dark' ? (
              <Moon className="w-4 h-4 text-amber-400 shrink-0" />
            ) : settings.themeMode === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500 shrink-0" />
            ) : (
              <Laptop className="w-4 h-4 shrink-0" />
            )}
            {!sidebarCollapsed && (
              <span className="capitalize">Theme: {settings.themeMode}</span>
            )}
          </button>

          {/* Settings Nav Item */}
          <button
            onClick={() => handleNavClick('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              activeView === 'settings'
                ? 'bg-accent-light-theme text-accent-theme font-semibold'
                : 'text-secondary-theme hover:bg-card-hover hover:text-primary-theme'
            } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
            title="Settings & Data Management"
          >
            <Settings className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Settings & Backup</span>}
          </button>

          {/* User profile card */}
          <div
            onClick={() => handleNavClick('settings')}
            className={`flex items-center gap-3 p-2 rounded-xl hover:bg-card-hover cursor-pointer transition-colors ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            title="Profile"
          >
            <div className="w-8 h-8 rounded-full bg-accent-light-theme text-accent-theme flex items-center justify-center font-bold text-sm shrink-0 border border-accent-light-theme">
              {settings.avatarEmoji || settings.name.slice(0, 1)}
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-primary-theme truncate">
                  {settings.name}
                </p>
                <p className="text-[10px] text-muted-theme truncate">Personal Productivity OS</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
