/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Birthday, Task, CalendarEvent } from '../types';

export function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatReadableDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatTime12h(timeStr: string): string {
  if (!timeStr) return '';
  try {
    const [hourStr, minStr] = timeStr.split(':');
    const hours = parseInt(hourStr, 10);
    const minutes = minStr || '00';
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  } catch {
    return timeStr;
  }
}

// Calculate countdown days and age turning for a birthday
export function calculateBirthdayInfo(birthday: Birthday): {
  daysUntil: number;
  turningAge?: number;
  formattedDate: string;
  isToday: boolean;
  displayText: string;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parts = birthday.birthdate.split('-');
  let birthMonth: number;
  let birthDay: number;
  let birthYear: number | undefined = birthday.birthYear;

  if (parts.length === 3) {
    birthYear = parseInt(parts[0], 10);
    birthMonth = parseInt(parts[1], 10) - 1;
    birthDay = parseInt(parts[2], 10);
  } else if (parts.length === 2) {
    birthMonth = parseInt(parts[0], 10) - 1;
    birthDay = parseInt(parts[1], 10);
  } else {
    return { daysUntil: 999, formattedDate: birthday.birthdate, isToday: false, displayText: 'Unknown' };
  }

  const currentYear = today.getFullYear();
  let nextBirthday = new Date(currentYear, birthMonth, birthDay);

  if (nextBirthday < today) {
    nextBirthday = new Date(currentYear + 1, birthMonth, birthDay);
  }

  const diffTime = nextBirthday.getTime() - today.getTime();
  const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isToday = daysUntil === 0;

  const turningAge = birthYear ? nextBirthday.getFullYear() - birthYear : undefined;

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedDate = `${monthNames[birthMonth]} ${birthDay}`;

  let displayText = '';
  if (isToday) {
    displayText = turningAge ? `Turns ${turningAge} today! 🎉` : 'Birthday today! 🎉';
  } else if (daysUntil === 1) {
    displayText = turningAge ? `Turns ${turningAge} tomorrow` : 'Tomorrow';
  } else {
    displayText = turningAge ? `In ${daysUntil} days (turns ${turningAge})` : `In ${daysUntil} days`;
  }

  return {
    daysUntil,
    turningAge,
    formattedDate,
    isToday,
    displayText,
  };
}

// Compute next occurrence date for recurring tasks
export function getNextRecurringDate(currentDateStr: string, recurrence: Task['recurrence']): string {
  const [y, m, d] = currentDateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);

  if (recurrence === 'daily') {
    date.setDate(date.getDate() + 1);
  } else if (recurrence === 'weekly') {
    date.setDate(date.getDate() + 7);
  } else if (recurrence === 'monthly') {
    date.setMonth(date.getMonth() + 1);
  } else if (recurrence === 'weekdays') {
    date.setDate(date.getDate() + 1);
    while (date.getDay() === 0 || date.getDay() === 6) {
      date.setDate(date.getDate() + 1);
    }
  }

  const nextY = date.getFullYear();
  const nextM = String(date.getMonth() + 1).padStart(2, '0');
  const nextD = String(date.getDate()).padStart(2, '0');
  return `${nextY}-${nextM}-${nextD}`;
}

// Export tasks to CSV
export function exportTasksToCSV(tasks: Task[]): void {
  const headers = ['ID', 'Title', 'Description', 'Due Date', 'Due Time', 'Priority', 'Status', 'Category', 'Recurrence', 'Created At'];
  const rows = tasks.map((t) => [
    `"${t.id}"`,
    `"${t.title.replace(/"/g, '""')}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    `"${t.dueDate}"`,
    `"${t.dueTime || ''}"`,
    `"${t.priority}"`,
    `"${t.status}"`,
    `"${t.category || ''}"`,
    `"${t.recurrence}"`,
    `"${t.createdAt}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadBlob(csvContent, 'dayflow_tasks.csv', 'text/csv;charset=utf-8;');
}

// Export events to CSV
export function exportEventsToCSV(events: CalendarEvent[]): void {
  const headers = ['ID', 'Title', 'Date', 'Start Time', 'End Time', 'All Day', 'Category', 'Location', 'Recurrence'];
  const rows = events.map((e) => [
    `"${e.id}"`,
    `"${e.title.replace(/"/g, '""')}"`,
    `"${e.date}"`,
    `"${e.startTime}"`,
    `"${e.endTime}"`,
    `"${e.allDay}"`,
    `"${e.category}"`,
    `"${(e.location || '').replace(/"/g, '""')}"`,
    `"${e.recurrence}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadBlob(csvContent, 'dayflow_events.csv', 'text/csv;charset=utf-8;');
}

// Export birthdays to CSV
export function exportBirthdaysToCSV(birthdays: Birthday[]): void {
  const headers = ['ID', 'Name', 'Birthdate', 'Birth Year', 'Relationship', 'Reminder', 'Gift Ideas', 'Notes'];
  const rows = birthdays.map((b) => [
    `"${b.id}"`,
    `"${b.name.replace(/"/g, '""')}"`,
    `"${b.birthdate}"`,
    `"${b.birthYear || ''}"`,
    `"${b.relationship}"`,
    `"${b.reminder}"`,
    `"${(b.giftIdeas || []).join('; ').replace(/"/g, '""')}"`,
    `"${(b.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadBlob(csvContent, 'dayflow_birthdays.csv', 'text/csv;charset=utf-8;');
}

export function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Trigger celebratory lightweight confetti animation without heavy 3rd-party libs
export function triggerCelebration(): void {
  if (typeof document === 'undefined') return;

  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.inset = '0';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '99999';
  container.style.overflow = 'hidden';
  document.body.appendChild(container);

  const particlesCount = 45;
  for (let i = 0; i < particlesCount; i++) {
    const el = document.createElement('div');
    const size = Math.random() * 8 + 6;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const startX = window.innerWidth / 2 + (Math.random() * 300 - 150);
    const startY = window.innerHeight / 2 + (Math.random() * 200 - 100);
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 280 + 120;
    const destX = startX + Math.cos(angle) * velocity;
    const destY = startY + Math.sin(angle) * velocity + 200;

    el.style.position = 'absolute';
    el.style.width = `${size}px`;
    el.style.height = `${size * (Math.random() > 0.5 ? 1 : 1.6)}px`;
    el.style.backgroundColor = color;
    el.style.borderRadius = Math.random() > 0.5 ? '2px' : '50%';
    el.style.left = `${startX}px`;
    el.style.top = `${startY}px`;
    el.style.opacity = '1';
    el.style.transition = 'all 1s cubic-bezier(0.1, 0.8, 0.3, 1)';
    container.appendChild(el);

    requestAnimationFrame(() => {
      el.style.left = `${destX}px`;
      el.style.top = `${destY}px`;
      el.style.transform = `rotate(${Math.random() * 720}deg) scale(0.6)`;
      el.style.opacity = '0';
    });
  }

  setTimeout(() => {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }, 1200);
}
