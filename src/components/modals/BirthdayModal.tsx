/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Gift, AlertCircle, Heart, Bell } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Birthday, RelationshipType, BirthdayReminderPref } from '../../types';
import { getTodayDateString } from '../../utils/helpers';
import { DateTimePicker } from '../DateTimePicker';

interface BirthdayModalProps {
  isOpen: boolean;
  onClose: () => void;
  birthday?: Birthday | null;
}

const AVATAR_COLORS = [
  'bg-rose-500',
  'bg-blue-500',
  'bg-purple-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-indigo-500',
  'bg-pink-500',
  'bg-teal-500',
];

export const BirthdayModal: React.FC<BirthdayModalProps> = ({ isOpen, onClose, birthday }) => {
  const { addBirthday, updateBirthday } = useApp();

  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState(getTodayDateString());
  const [birthYear, setBirthYear] = useState<string>('');
  const [relationship, setRelationship] = useState<RelationshipType>('friend');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [notes, setNotes] = useState('');
  const [giftIdeas, setGiftIdeas] = useState<string[]>([]);
  const [giftInput, setGiftInput] = useState('');
  const [reminder, setReminder] = useState<BirthdayReminderPref>('3_days_before');
  const [error, setError] = useState('');

  useEffect(() => {
    if (birthday) {
      setName(birthday.name);
      setBirthdate(birthday.birthdate);
      setBirthYear(birthday.birthYear ? String(birthday.birthYear) : '');
      setRelationship(birthday.relationship);
      setAvatarColor(birthday.avatarColor || AVATAR_COLORS[0]);
      setNotes(birthday.notes || '');
      setGiftIdeas(birthday.giftIdeas || []);
      setReminder(birthday.reminder);
    } else {
      setName('');
      setBirthdate(getTodayDateString());
      setBirthYear('');
      setRelationship('friend');
      setAvatarColor(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
      setNotes('');
      setGiftIdeas([]);
      setReminder('3_days_before');
    }
    setError('');
  }, [birthday, isOpen]);

  if (!isOpen) return null;

  const handleAddGift = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = giftInput.trim();
    if (trimmed && !giftIdeas.includes(trimmed)) {
      setGiftIdeas([...giftIdeas, trimmed]);
      setGiftInput('');
    }
  };

  const handleRemoveGift = (idea: string) => {
    setGiftIdeas(giftIdeas.filter((g) => g !== idea));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Person name is required');
      return;
    }

    const yearNum = birthYear ? parseInt(birthYear, 10) : undefined;

    if (birthday) {
      await updateBirthday({
        ...birthday,
        name: name.trim(),
        birthdate,
        birthYear: yearNum,
        relationship,
        avatarColor,
        notes: notes.trim() || undefined,
        giftIdeas,
        reminder,
      });
    } else {
      await addBirthday({
        name: name.trim(),
        birthdate,
        birthYear: yearNum,
        relationship,
        avatarColor,
        notes: notes.trim() || undefined,
        giftIdeas,
        reminder,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-modal-theme rounded-2xl border border-theme shadow-2xl p-6 text-primary-theme"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-4 border-b border-theme">
          <h2 className="text-xl font-bold tracking-tight">
            {birthday ? 'Edit Birthday Record' : 'Add Birthday Record'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-secondary-theme hover:bg-card-hover transition-colors"
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
          <div>
            <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1">
              Person Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sarah Connor"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-input-theme border border-theme focus:outline-hidden focus:ring-2 ring-accent-theme text-sm font-medium"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1">
                Birthdate (Month & Day) *
              </label>
              <DateTimePicker
                type="date"
                required
                value={birthdate}
                onChange={setBirthdate}
                ariaLabel="Birthday date"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1">
                Birth Year (Optional for age)
              </label>
              <input
                type="number"
                placeholder="e.g. 1995"
                min="1900"
                max={new Date().getFullYear()}
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme focus:outline-hidden focus:ring-2 ring-accent-theme text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1">
                <Heart className="w-3.5 h-3.5 inline mr-1 text-rose-500" /> Relationship
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value as RelationshipType)}
                className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme focus:outline-hidden focus:ring-2 ring-accent-theme text-sm"
              >
                <option value="partner">Partner / Spouse</option>
                <option value="family">Family Member</option>
                <option value="friend">Friend</option>
                <option value="colleague">Colleague / Work</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1">
                <Bell className="w-3.5 h-3.5 inline mr-1" /> Reminder Alert
              </label>
              <select
                value={reminder}
                onChange={(e) => setReminder(e.target.value as BirthdayReminderPref)}
                className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme focus:outline-hidden focus:ring-2 ring-accent-theme text-sm"
              >
                <option value="day_of">On the Day</option>
                <option value="1_day_before">1 Day Before</option>
                <option value="3_days_before">3 Days Before</option>
                <option value="1_week_before">1 Week Before</option>
                <option value="none">No Reminder</option>
              </select>
            </div>
          </div>

          {/* Avatar Color */}
          <div>
            <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1.5">
              Avatar Color Badge
            </label>
            <div className="flex items-center gap-2">
              {AVATAR_COLORS.map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setAvatarColor(color)}
                  className={`w-7 h-7 rounded-full ${color} transition-transform ${
                    avatarColor === color ? 'ring-2 ring-offset-2 ring-accent-theme scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                  aria-label={`Select ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Gift Ideas */}
          <div>
            <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1">
              <Gift className="w-3.5 h-3.5 inline mr-1 text-accent-theme" /> Gift Ideas Wishlist
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {giftIdeas.map((gift) => (
                <span
                  key={gift}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-theme border border-theme"
                >
                  🎁 {gift}
                  <button
                    type="button"
                    onClick={() => handleRemoveGift(gift)}
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
                placeholder="Type a gift idea & press Enter"
                value={giftInput}
                onChange={(e) => setGiftInput(e.target.value)}
                onKeyDown={handleAddGift}
                className="flex-1 px-3 py-1.5 rounded-lg bg-input-theme border border-theme text-sm focus:outline-hidden focus:ring-1 ring-accent-theme"
              />
              <button
                type="button"
                onClick={handleAddGift}
                className="px-3 py-1.5 rounded-lg bg-card-hover border border-theme text-xs font-medium hover:bg-secondary-theme"
              >
                Add Gift
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1">
              Important Notes & Tastes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Favorite tea flavor, sizes, dislikes, address..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme focus:outline-hidden focus:ring-2 ring-accent-theme text-sm resize-none"
            />
          </div>

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
              {birthday ? 'Update Birthday' : 'Save Birthday'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
