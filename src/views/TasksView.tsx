/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Clock,
  Tag,
  Repeat,
  Trash2,
  Edit2,
  Columns,
  List,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task, Priority, TaskStatus } from '../types';
import { getTodayDateString, formatReadableDate, formatTime12h } from '../utils/helpers';

type TaskTab = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed' | 'kanban';

export const TasksView: React.FC = () => {
  const {
    tasks,
    toggleTaskComplete,
    deleteTask,
    setEditingTask,
    openQuickAddWithTab,
    moveTaskStatus,
  } = useApp();

  const todayStr = getTodayDateString();

  const [activeTab, setActiveTab] = useState<TaskTab>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt' | 'title'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [kanbanError, setKanbanError] = useState<string | null>(null);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [tasks]);

  // Tab counters
  const counts = useMemo(() => {
    return {
      all: tasks.length,
      today: tasks.filter((t) => t.dueDate === todayStr).length,
      upcoming: tasks.filter((t) => t.status !== 'completed' && t.dueDate > todayStr).length,
      overdue: tasks.filter((t) => t.status !== 'completed' && t.dueDate < todayStr).length,
      completed: tasks.filter((t) => t.status === 'completed').length,
    };
  }, [tasks, todayStr]);

  // Priority weighting for sorting
  const priorityWeight: Record<Priority, number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Tab filter
      if (activeTab === 'today' && t.dueDate !== todayStr) return false;
      if (activeTab === 'upcoming' && (t.status === 'completed' || t.dueDate <= todayStr)) return false;
      if (activeTab === 'overdue' && (t.status === 'completed' || t.dueDate >= todayStr)) return false;
      if (activeTab === 'completed' && t.status !== 'completed') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description?.toLowerCase().includes(q);
        const matchTag = t.tags?.some((tag) => tag.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchTag) return false;
      }

      // Priority filter
      if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;

      // Category filter
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;

      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'dueDate') {
        comparison = a.dueDate.localeCompare(b.dueDate);
      } else if (sortBy === 'priority') {
        comparison = priorityWeight[b.priority] - priorityWeight[a.priority];
      } else if (sortBy === 'createdAt') {
        comparison = a.createdAt.localeCompare(b.createdAt);
      } else if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [tasks, activeTab, todayStr, searchQuery, selectedPriority, selectedCategory, sortBy, sortOrder]);

  // Kanban columns grouping
  const kanbanColumns = useMemo(() => {
    const todo = tasks.filter((t) => t.status === 'todo');
    const inProgress = tasks.filter((t) => t.status === 'in_progress');
    const completed = tasks.filter((t) => t.status === 'completed');
    return { todo, inProgress, completed };
  }, [tasks]);

  const handleTaskDragStart = (event: React.DragEvent<HTMLDivElement>, taskId: string) => {
    event.dataTransfer.setData('text/plain', taskId);
    event.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
    setKanbanError(null);
  };

  const handleTaskDrop = async (event: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData('text/plain') || draggedTaskId;
    setDraggedTaskId(null);
    setDragOverColumn(null);
    if (!taskId) return;
    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.status === status) return;

    try {
      await moveTaskStatus(taskId, status);
    } catch (error) {
      console.error('Unable to move task on the Kanban board:', error);
      setKanbanError('The task could not be moved. Please try again.');
    }
  };

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'urgent':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-500 border border-rose-500/30">Urgent</span>;
      case 'high':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-500 border border-amber-500/30">High</span>;
      case 'medium':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-500 border border-blue-500/30">Medium</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">Low</span>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-theme">
            Task Manager
          </h2>
          <p className="text-xs sm:text-sm text-secondary-theme mt-1">
            Organize tasks by deadline, priority, subtasks, and Kanban boards.
          </p>
        </div>

        <button
          onClick={() => openQuickAddWithTab('task')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* Tabs Toolbar */}
      <div className="flex items-center gap-1.5 p-1 bg-secondary-theme rounded-xl border border-theme overflow-x-auto text-xs font-semibold">
        {(
          [
            { id: 'today', label: 'Today', badge: counts.today },
            { id: 'upcoming', label: 'Upcoming', badge: counts.upcoming },
            { id: 'overdue', label: 'Overdue', badge: counts.overdue, badgeColor: 'bg-rose-500 text-white' },
            { id: 'completed', label: 'Completed', badge: counts.completed },
            { id: 'all', label: 'All Tasks', badge: counts.all },
            { id: 'kanban', label: 'Kanban Board', icon: Columns },
          ] as Array<{
            id: TaskTab;
            label: string;
            badge?: number;
            badgeColor?: string;
            icon?: React.ComponentType<{ className?: string }>;
          }>
        ).map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon || null;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-card-theme text-primary-theme shadow-xs font-bold'
                  : 'text-secondary-theme hover:text-primary-theme'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
              {'badge' in tab && tab.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    tab.badgeColor || (isActive ? 'bg-accent-theme text-white' : 'bg-card-theme text-secondary-theme')
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filter and Sort Toolbar (When not in kanban view) */}
      {activeTab !== 'kanban' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-card-theme p-3 rounded-2xl border border-theme shadow-xs text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-secondary-theme" />
            <input
              type="text"
              placeholder="Search tasks or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-input-theme border border-theme focus:ring-1 ring-accent-theme focus:outline-hidden"
            />
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-secondary-theme shrink-0" />
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full py-1.5 px-2 rounded-xl bg-input-theme border border-theme focus:ring-1 ring-accent-theme focus:outline-hidden"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Category filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-1.5 px-2 rounded-xl bg-input-theme border border-theme focus:ring-1 ring-accent-theme focus:outline-hidden"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-secondary-theme shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 py-1.5 px-2 rounded-xl bg-input-theme border border-theme focus:ring-1 ring-accent-theme focus:outline-hidden"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="createdAt">Created Date</option>
              <option value="title">Title</option>
            </select>
            <button
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className="p-1.5 rounded-xl bg-secondary-theme border border-theme hover:bg-card-hover font-mono text-[10px]"
              title="Toggle sort direction"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      )}

      {/* VIEW: LIST (Today, Upcoming, Overdue, Completed, All) */}
      {activeTab !== 'kanban' && (
        <div className="bg-card-theme rounded-2xl border border-theme shadow-xs overflow-hidden">
          {filteredTasks.length === 0 ? (
            <div className="py-16 text-center text-secondary-theme">
              <CheckCircle2 className="w-10 h-10 mx-auto text-muted-theme opacity-30 mb-3" />
              <p className="text-sm font-semibold text-primary-theme">No matching tasks found</p>
              <p className="text-xs text-muted-theme mt-1">
                {searchQuery || selectedPriority !== 'all' || selectedCategory !== 'all'
                  ? 'Try adjusting your filters or search keywords.'
                  : 'You have clear slate! Add a new task to stay organized.'}
              </p>
              <button
                onClick={() => openQuickAddWithTab('task')}
                className="mt-4 px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-xs"
              >
                + Create New Task
              </button>
            </div>
          ) : (
            <div className="divide-y divide-theme">
              {filteredTasks.map((t) => {
                const isCompleted = t.status === 'completed';
                const isOverdue = !isCompleted && t.dueDate < todayStr;
                const completedSubtasks = t.subtasks.filter((s) => s.completed).length;

                return (
                  <div
                    key={t.id}
                    className={`p-4 flex items-start justify-between gap-3 hover:bg-card-hover transition-colors group ${
                      isCompleted ? 'bg-secondary-theme/20 text-muted-theme' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleTaskComplete(t.id)}
                        className="mt-0.5 text-secondary-theme hover:text-accent-theme transition-colors shrink-0"
                        title={isCompleted ? 'Reopen task' : 'Mark task completed'}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-theme hover:text-accent-theme" />
                        )}
                      </button>

                      {/* Details */}
                      <div
                        onClick={() => setEditingTask(t)}
                        className="cursor-pointer min-w-0 flex-1"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className={`text-sm font-semibold truncate ${
                              isCompleted ? 'line-through text-muted-theme' : 'text-primary-theme'
                            }`}
                          >
                            {t.title}
                          </p>
                          {getPriorityBadge(t.priority)}
                          {isOverdue && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-500/15 text-rose-500 border border-rose-500/30 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Overdue
                            </span>
                          )}
                        </div>

                        {t.description && (
                          <p className="text-xs text-secondary-theme truncate mt-1 max-w-xl">
                            {t.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 mt-2 text-xs text-secondary-theme flex-wrap">
                          <span
                            className={`flex items-center gap-1 font-mono text-[11px] ${
                              isOverdue ? 'text-rose-500 font-semibold' : ''
                            }`}
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            {t.dueDate === todayStr ? 'Today' : formatReadableDate(t.dueDate)}
                            {t.dueTime && ` at ${formatTime12h(t.dueTime)}`}
                          </span>

                          {t.subtasks.length > 0 && (
                            <span className="text-[11px] text-muted-theme">
                              ✓ {completedSubtasks}/{t.subtasks.length} subtasks
                            </span>
                          )}

                          {t.recurrence !== 'none' && (
                            <span className="text-[11px] text-muted-theme flex items-center gap-1">
                              <Repeat className="w-3 h-3" /> {t.recurrence}
                            </span>
                          )}

                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-secondary-theme text-secondary-theme font-medium">
                            {t.category}
                          </span>

                          {t.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-1.5 py-0.2 rounded-md bg-accent-light-theme text-accent-theme border border-accent-light-theme"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingTask(t)}
                        className="p-1.5 rounded-lg text-secondary-theme hover:text-primary-theme hover:bg-secondary-theme transition-colors"
                        title="Edit task"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTask(t.id)}
                        className="p-1.5 rounded-lg text-secondary-theme hover:text-rose-500 hover:bg-secondary-theme transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW: KANBAN BOARD */}
      {activeTab === 'kanban' && (
        <div>
        <p className="text-xs text-secondary-theme mb-3">Drag a task card to another column to update its status.</p>
        {kanbanError && <p role="alert" className="text-xs text-rose-500 mb-3">{kanbanError}</p>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Column: To Do */}
          <div
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
              setDragOverColumn('todo');
            }}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={(event) => void handleTaskDrop(event, 'todo')}
            className={`bg-secondary-theme/40 rounded-2xl border p-4 flex flex-col transition-colors ${dragOverColumn === 'todo' ? 'border-accent-theme bg-accent-light-theme/30' : 'border-theme'}`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-theme mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <h3 className="font-bold text-sm text-primary-theme">To Do</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-card-theme text-secondary-theme font-semibold">
                  {kanbanColumns.todo.length}
                </span>
              </div>
              <button
                onClick={() => openQuickAddWithTab('task')}
                className="p-1 rounded-md text-secondary-theme hover:text-accent-theme"
                title="Add to do task"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto min-h-[300px]">
              {kanbanColumns.todo.map((t) => (
                <div
                  key={t.id}
                  draggable
                  onDragStart={(event) => handleTaskDragStart(event, t.id)}
                  onDragEnd={() => {
                    setDraggedTaskId(null);
                    setDragOverColumn(null);
                  }}
                  aria-label={`Drag task ${t.title}`}
                  className={`p-3.5 rounded-xl bg-card-theme border border-theme shadow-xs hover:border-strong-theme transition-all cursor-grab active:cursor-grabbing group ${draggedTaskId === t.id ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      onClick={() => setEditingTask(t)}
                      className="font-semibold text-xs sm:text-sm text-primary-theme hover:text-accent-theme leading-snug"
                    >
                      {t.title}
                    </span>
                    {getPriorityBadge(t.priority)}
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-subtle-theme text-[11px] text-secondary-theme">
                    <span>Due {t.dueDate === todayStr ? 'Today' : formatReadableDate(t.dueDate)}</span>
                    <button
                      onClick={() => moveTaskStatus(t.id, 'in_progress')}
                      className="text-xs font-semibold text-accent-theme hover:underline"
                    >
                      Start →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column: In Progress */}
          <div
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
              setDragOverColumn('in_progress');
            }}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={(event) => void handleTaskDrop(event, 'in_progress')}
            className={`bg-secondary-theme/40 rounded-2xl border p-4 flex flex-col transition-colors ${dragOverColumn === 'in_progress' ? 'border-accent-theme bg-accent-light-theme/30' : 'border-theme'}`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-theme mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <h3 className="font-bold text-sm text-primary-theme">In Progress</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-card-theme text-secondary-theme font-semibold">
                  {kanbanColumns.inProgress.length}
                </span>
              </div>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto min-h-[300px]">
              {kanbanColumns.inProgress.map((t) => (
                <div
                  key={t.id}
                  draggable
                  onDragStart={(event) => handleTaskDragStart(event, t.id)}
                  onDragEnd={() => {
                    setDraggedTaskId(null);
                    setDragOverColumn(null);
                  }}
                  aria-label={`Drag task ${t.title}`}
                  className={`p-3.5 rounded-xl bg-card-theme border border-theme shadow-xs hover:border-strong-theme transition-all cursor-grab active:cursor-grabbing group ${draggedTaskId === t.id ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      onClick={() => setEditingTask(t)}
                      className="font-semibold text-xs sm:text-sm text-primary-theme hover:text-accent-theme leading-snug"
                    >
                      {t.title}
                    </span>
                    {getPriorityBadge(t.priority)}
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-subtle-theme text-[11px] text-secondary-theme">
                    <button
                      onClick={() => moveTaskStatus(t.id, 'todo')}
                      className="text-xs text-muted-theme hover:underline"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => moveTaskStatus(t.id, 'completed')}
                      className="text-xs font-semibold text-emerald-500 hover:underline"
                    >
                      Complete ✓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column: Completed */}
          <div
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
              setDragOverColumn('completed');
            }}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={(event) => void handleTaskDrop(event, 'completed')}
            className={`bg-secondary-theme/40 rounded-2xl border p-4 flex flex-col transition-colors ${dragOverColumn === 'completed' ? 'border-accent-theme bg-accent-light-theme/30' : 'border-theme'}`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-theme mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="font-bold text-sm text-primary-theme">Completed</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-card-theme text-secondary-theme font-semibold">
                  {kanbanColumns.completed.length}
                </span>
              </div>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto min-h-[300px]">
              {kanbanColumns.completed.map((t) => (
                <div
                  key={t.id}
                  draggable
                  onDragStart={(event) => handleTaskDragStart(event, t.id)}
                  onDragEnd={() => {
                    setDraggedTaskId(null);
                    setDragOverColumn(null);
                  }}
                  aria-label={`Drag task ${t.title}`}
                  className={`p-3.5 rounded-xl bg-card-theme/60 border border-theme shadow-xs opacity-80 hover:opacity-100 transition-all cursor-grab active:cursor-grabbing group ${draggedTaskId === t.id ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      onClick={() => setEditingTask(t)}
                      className="font-semibold text-xs sm:text-sm line-through text-muted-theme hover:text-primary-theme leading-snug"
                    >
                      {t.title}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-500">✓ Done</span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-subtle-theme text-[11px] text-secondary-theme">
                    <span>{formatReadableDate(t.dueDate)}</span>
                    <button
                      onClick={() => moveTaskStatus(t.id, 'todo')}
                      className="text-xs text-secondary-theme hover:underline"
                    >
                      Reopen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
};
