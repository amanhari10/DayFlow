/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, Clock, Tag, AlertCircle, Repeat, CheckSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Task, Priority, TaskStatus, RecurrencePattern, Subtask } from '../../types';
import { getTodayDateString } from '../../utils/helpers';
import { DateTimePicker } from '../DateTimePicker';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
}

const CATEGORIES = ['Work', 'Personal', 'Health', 'Finance', 'Design', 'Learning', 'Errands', 'Other'];

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task }) => {
  const { addTask, updateTask, settings } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<Priority>(settings.defaultTaskPriority);
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [category, setCategory] = useState('Work');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrencePattern>('none');
  const [reminder, setReminder] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setDueDate(task.dueDate || getTodayDateString());
      setDueTime(task.dueTime || '');
      setPriority(task.priority);
      setStatus(task.status);
      setCategory(task.category || 'Work');
      setTags(task.tags || []);
      setSubtasks(task.subtasks || []);
      setRecurrence(task.recurrence || 'none');
      setReminder(task.reminder || false);
    } else {
      setTitle('');
      setDescription('');
      setDueDate(getTodayDateString());
      setDueTime('');
      setPriority(settings.defaultTaskPriority);
      setStatus('todo');
      setCategory('Work');
      setTags([]);
      setSubtasks([]);
      setRecurrence('none');
      setReminder(false);
    }
    setError('');
  }, [task, isOpen, settings.defaultTaskPriority]);

  if (!isOpen) return null;

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        title: newSubtaskTitle.trim(),
        completed: false,
      },
    ]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (subId: string) => {
    setSubtasks(subtasks.map((s) => (s.id === subId ? { ...s, completed: !s.completed } : s)));
  };

  const handleRemoveSubtask = (subId: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== subId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    if (task) {
      await updateTask({
        ...task,
        title: title.trim(),
        description: description.trim(),
        dueDate,
        dueTime: dueTime || undefined,
        priority,
        status,
        category,
        tags,
        subtasks,
        recurrence,
        reminder,
      });
    } else {
      await addTask({
        title: title.trim(),
        description: description.trim(),
        dueDate,
        dueTime: dueTime || undefined,
        priority,
        status,
        category,
        tags,
        subtasks,
        recurrence,
        reminder,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-modal-theme rounded-2xl border border-theme shadow-2xl p-6 text-primary-theme transition-all"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-4 border-b border-theme">
          <h2 className="text-xl font-bold tracking-tight">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-secondary-theme hover:bg-card-hover transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Finalize Q4 deliverables"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-input-theme border border-theme focus:outline-hidden focus:ring-2 ring-accent-theme text-sm font-medium"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1">
              Description & Notes
            </label>
            <textarea
              rows={3}
              placeholder="Add key context, checklists, or reference links..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme focus:outline-hidden focus:ring-2 ring-accent-theme text-sm resize-none"
            />
          </div>

          {/* Due Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1">
                <Calendar className="w-3.5 h-3.5 inline mr-1" /> Due Date
              </label>
              <DateTimePicker
                type="date"
                required
                value={dueDate}
                onChange={setDueDate}
                ariaLabel="Task due date"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1">
                <Clock className="w-3.5 h-3.5 inline mr-1" /> Due Time (Optional)
              </label>
              <DateTimePicker
                type="time"
                value={dueTime}
                onChange={setDueTime}
                ariaLabel="Task due time"
              />
            </div>
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme focus:outline-hidden focus:ring-2 ring-accent-theme text-sm"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🟠 High</option>
                <option value="urgent">🔴 Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme focus:outline-hidden focus:ring-2 ring-accent-theme text-sm"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Category & Recurrence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme focus:outline-hidden focus:ring-2 ring-accent-theme text-sm"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1">
                <Repeat className="w-3.5 h-3.5 inline mr-1" /> Recurrence
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as RecurrencePattern)}
                className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme focus:outline-hidden focus:ring-2 ring-accent-theme text-sm"
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekdays">Weekdays (Mon-Fri)</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          {/* Subtasks */}
          <div>
            <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1">
              <CheckSquare className="w-3.5 h-3.5 inline mr-1" /> Subtasks ({subtasks.filter((s) => s.completed).length}/{subtasks.length})
            </label>
            <div className="space-y-1.5 mb-2">
              {subtasks.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-card-theme border border-subtle-theme text-sm"
                >
                  <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={sub.completed}
                      onChange={() => handleToggleSubtask(sub.id)}
                      className="rounded text-accent-theme focus:ring-accent-theme cursor-pointer"
                    />
                    <span className={`truncate ${sub.completed ? 'line-through text-muted-theme' : ''}`}>
                      {sub.title}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(sub.id)}
                    className="p-1 text-muted-theme hover:text-rose-500 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a subtask..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask(e);
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-lg bg-input-theme border border-theme text-sm focus:outline-hidden focus:ring-1 ring-accent-theme"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 rounded-lg bg-card-hover border border-theme text-xs font-medium flex items-center gap-1 hover:bg-secondary-theme"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1">
              <Tag className="w-3.5 h-3.5 inline mr-1" /> Tags
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-light-theme text-accent-theme border border-accent-light-theme"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-500 ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a tag & press Enter (e.g. Design)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="flex-1 px-3 py-1.5 rounded-lg bg-input-theme border border-theme text-sm focus:outline-hidden focus:ring-1 ring-accent-theme"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 rounded-lg bg-card-hover border border-theme text-xs font-medium hover:bg-secondary-theme"
              >
                Add Tag
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-theme">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-secondary-theme hover:bg-card-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-accent-theme text-white hover:bg-accent-hover transition-colors shadow-sm"
            >
              {task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
