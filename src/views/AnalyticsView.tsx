/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import {
  BarChart2,
  CheckCircle2,
  Clock,
  Flame,
  AlertTriangle,
  TrendingUp,
  PieChart as PieChartIcon,
  Calendar,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTodayDateString } from '../utils/helpers';

export const AnalyticsView: React.FC = () => {
  const { tasks, habits, habitCheckins, focusSessions, settings } = useApp();

  const todayStr = getTodayDateString();

  // Metrics computation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'completed').length;
  const overdueTasks = tasks.filter((t) => t.status !== 'completed' && t.dueDate < todayStr).length;
  const overallTaskRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Total Focus Hours logged
  const totalFocusHours = useMemo(() => {
    const mins = focusSessions
      .filter((s) => s.type === 'focus' && s.completed)
      .reduce((acc, s) => acc + s.duration, 0);
    return (mins / 60).toFixed(1);
  }, [focusSessions]);

  // Priority distribution for donut chart
  const priorityDistribution = useMemo(() => {
    const counts = { urgent: 0, high: 0, medium: 0, low: 0 };
    tasks.forEach((t) => {
      counts[t.priority] = (counts[t.priority] || 0) + 1;
    });
    return counts;
  }, [tasks]);

  // Weekly Task Completion (Last 7 Days)
  const weeklyTrendData = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dateNum = String(d.getDate()).padStart(2, '0');
      const dStr = `${y}-${m}-${dateNum}`;

      const completedCount = tasks.filter(
        (t) => t.status === 'completed' && t.completedAt && t.completedAt.startsWith(dStr)
      ).length;

      days.push({
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dateStr: dStr,
        count: completedCount,
        isToday: dStr === todayStr,
      });
    }
    const maxVal = Math.max(...days.map((d) => d.count), 5);
    return { days, maxVal };
  }, [tasks, todayStr]);

  // Monthly Task Trend (Last 30 Days)
  const monthlyTrendData = useMemo(() => {
    const points = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dateNum = String(d.getDate()).padStart(2, '0');
      const dStr = `${y}-${m}-${dateNum}`;

      const count = tasks.filter(
        (t) => t.status === 'completed' && t.completedAt && t.completedAt.startsWith(dStr)
      ).length;

      points.push({ dateStr: dStr, count });
    }
    const maxVal = Math.max(...points.map((p) => p.count), 4);
    return { points, maxVal };
  }, [tasks]);

  // Habit Consistency breakdown per habit (last 30 days %)
  const habitBreakdown = useMemo(() => {
    const now = new Date();
    return habits.map((h) => {
      let count = 0;
      for (let i = 0; i < 30; i++) {
        const past = new Date(now);
        past.setDate(now.getDate() - i);
        const py = past.getFullYear();
        const pm = String(past.getMonth() + 1).padStart(2, '0');
        const pd = String(past.getDate()).padStart(2, '0');
        const dStr = `${py}-${pm}-${pd}`;
        if (habitCheckins.some((c) => c.habitId === h.id && c.date === dStr && c.completed)) {
          count++;
        }
      }
      return {
        id: h.id,
        title: h.title,
        rate: Math.round((count / 30) * 100),
      };
    });
  }, [habits, habitCheckins]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-theme flex items-center gap-2">
          <BarChart2 className="w-7 h-7 text-accent-theme" /> Productivity Analytics
        </h2>
        <p className="text-xs sm:text-sm text-secondary-theme mt-1">
          Historical trends, completion rates, task priorities, and focus efficiency.
        </p>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Tasks Completed */}
        <div className="p-5 rounded-2xl bg-card-theme border border-theme shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary-theme">Tasks Completed</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-primary-theme font-mono mt-2">
            {completedTasks}
          </p>
          <span className="text-xs text-secondary-theme mt-1 block">
            {overallTaskRate}% total completion rate
          </span>
        </div>

        {/* Metric 2: Pending Tasks */}
        <div className="p-5 rounded-2xl bg-card-theme border border-theme shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary-theme">Pending Tasks</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-primary-theme font-mono mt-2">
            {pendingTasks}
          </p>
          <span className="text-xs text-secondary-theme mt-1 block">Active backlog items</span>
        </div>

        {/* Metric 3: Overdue Alerts */}
        <div className="p-5 rounded-2xl bg-card-theme border border-theme shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary-theme">Overdue Tasks</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-rose-500 font-mono mt-2">
            {overdueTasks}
          </p>
          <span className="text-xs text-rose-500/80 mt-1 block">Require rescheduling</span>
        </div>

        {/* Metric 4: Focus Hours */}
        <div className="p-5 rounded-2xl bg-card-theme border border-theme shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary-theme">Focus Hours</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-primary-theme font-mono mt-2">
            {totalFocusHours}h
          </p>
          <span className="text-xs text-secondary-theme mt-1 block">Logged in deep pomodoro</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Weekly Task Completion Bar Chart */}
        <div className="p-6 rounded-2xl bg-card-theme border border-theme shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-theme">
            <div>
              <h3 className="font-bold text-base text-primary-theme">Weekly Task Velocity</h3>
              <p className="text-xs text-secondary-theme">Completed tasks over the past 7 days</p>
            </div>
            <TrendingUp className="w-4 h-4 text-accent-theme" />
          </div>

          <div className="py-6 flex items-end justify-between gap-3 h-52">
            {weeklyTrendData.days.map((d) => {
              const height = Math.max((d.count / weeklyTrendData.maxVal) * 100, 8);
              return (
                <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-xs font-mono font-bold text-accent-theme opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.count}
                  </span>
                  <div className="w-full bg-secondary-theme rounded-t-xl h-36 flex items-end p-1">
                    <div
                      style={{ height: `${height}%` }}
                      className={`w-full rounded-lg transition-all duration-700 ${
                        d.isToday ? 'bg-accent-theme shadow-sm' : 'bg-accent-light-theme border border-accent-light-theme group-hover:bg-accent-theme/60'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      d.isToday ? 'text-accent-theme font-bold' : 'text-secondary-theme'
                    }`}
                  >
                    {d.dayName}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-theme flex items-center justify-between text-xs text-secondary-theme">
            <span>
              Total completed: {weeklyTrendData.days.reduce((acc, d) => acc + d.count, 0)}
            </span>
            <span className="font-semibold text-accent-theme">7-day window</span>
          </div>
        </div>

        {/* Chart 2: Task Priority Distribution */}
        <div className="p-6 rounded-2xl bg-card-theme border border-theme shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-theme">
            <div>
              <h3 className="font-bold text-base text-primary-theme">Priority Breakdown</h3>
              <p className="text-xs text-secondary-theme">Distribution across task urgency levels</p>
            </div>
            <PieChartIcon className="w-4 h-4 text-accent-theme" />
          </div>

          {totalTasks === 0 ? (
            <div className="py-12 text-center text-secondary-theme text-xs">
              No tasks to analyze
            </div>
          ) : (
            <div className="py-4 space-y-3">
              {[
                { label: 'Urgent', count: priorityDistribution.urgent, color: 'bg-rose-500', barColor: '#f43f5e' },
                { label: 'High', count: priorityDistribution.high, color: 'bg-amber-500', barColor: '#f59e0b' },
                { label: 'Medium', count: priorityDistribution.medium, color: 'bg-blue-500', barColor: '#3b82f6' },
                { label: 'Low', count: priorityDistribution.low, color: 'bg-emerald-500', barColor: '#10b981' },
              ].map((p) => {
                const percent = Math.round((p.count / totalTasks) * 100);
                return (
                  <div key={p.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-primary-theme flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${p.color}`} /> {p.label}
                      </span>
                      <span className="text-secondary-theme font-mono">
                        {p.count} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-secondary-theme overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className={`h-full ${p.color} rounded-full transition-all duration-500`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-3 border-t border-theme text-xs text-secondary-theme">
            <span>Total categorized tasks: {totalTasks}</span>
          </div>
        </div>

        {/* Chart 3: Habit Consistency Ranking */}
        <div className="p-6 rounded-2xl bg-card-theme border border-theme shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-theme mb-4">
            <div>
              <h3 className="font-bold text-base text-primary-theme">Habit Consistency (30-Day)</h3>
              <p className="text-xs text-secondary-theme">Percentage of successful daily check-ins</p>
            </div>
            <Flame className="w-4 h-4 text-emerald-500" />
          </div>

          {habitBreakdown.length === 0 ? (
            <div className="py-12 text-center text-secondary-theme text-xs">
              No habits created yet.
            </div>
          ) : (
            <div className="space-y-3">
              {habitBreakdown.map((h) => (
                <div key={h.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-primary-theme truncate max-w-xs">
                      {h.title}
                    </span>
                    <span className="font-mono font-bold text-accent-theme">{h.rate}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-secondary-theme overflow-hidden">
                    <div
                      style={{ width: `${h.rate}%` }}
                      className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chart 4: Monthly Trend Line Chart (SVG) */}
        <div className="p-6 rounded-2xl bg-card-theme border border-theme shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-theme">
            <div>
              <h3 className="font-bold text-base text-primary-theme">30-Day Velocity Trend</h3>
              <p className="text-xs text-secondary-theme">Rolling daily output curve</p>
            </div>
            <Calendar className="w-4 h-4 text-accent-theme" />
          </div>

          {/* SVG Smooth Area Trend */}
          <div className="py-4">
            <div className="h-40 w-full relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Generate Points path */}
                {(() => {
                  const points = monthlyTrendData.points;
                  const max = monthlyTrendData.maxVal || 1;
                  const coords = points.map((p, i) => {
                    const x = (i / (points.length - 1)) * 300;
                    const y = 90 - (p.count / max) * 75;
                    return `${x},${y}`;
                  });

                  const lineD = `M ${coords.join(' L ')}`;
                  const areaD = `M 0,90 L ${coords.join(' L ')} L 300,90 Z`;

                  return (
                    <>
                      <path d={areaD} fill="url(#trendGradient)" />
                      <path
                        d={lineD}
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  );
                })()}
              </svg>
            </div>
            <div className="flex justify-between text-[10px] text-muted-theme mt-2">
              <span>30 days ago</span>
              <span>15 days ago</span>
              <span>Today</span>
            </div>
          </div>

          <div className="pt-3 border-t border-theme flex items-center justify-between text-xs text-secondary-theme">
            <span>Real-time local data</span>
            <span className="font-bold text-primary-theme">Continuous tracking</span>
          </div>
        </div>
      </div>
    </div>
  );
};
