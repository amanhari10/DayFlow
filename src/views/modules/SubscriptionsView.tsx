/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { CreditCard, Plus, Calendar, Trash2, Power, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Subscription } from '../../types';
import { formatReadableDate, getTodayDateString } from '../../utils/helpers';
import { formatCurrency } from '../../utils/currency';

export const SubscriptionsView: React.FC = () => {
  const { subscriptions, addSubscription, updateSubscription, deleteSubscription, settings } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [billingCycle, setBillingCycle] = useState<Subscription['billingCycle']>('monthly');
  const [nextRenewal, setNextRenewal] = useState(getTodayDateString());
  const [category, setCategory] = useState('Software');

  // Compute monthly and yearly totals for active subscriptions
  const { monthlyTotal, yearlyTotal } = useMemo(() => {
    let monthly = 0;
    subscriptions.filter((s) => s.active).forEach((s) => {
      if (s.billingCycle === 'monthly') {
        monthly += s.amount;
      } else {
        monthly += s.amount / 12;
      }
    });
    return {
      monthlyTotal: monthly,
      yearlyTotal: monthly * 12,
    };
  }, [subscriptions]);

  const handleToggleActive = async (sub: Subscription) => {
    await updateSubscription({
      ...sub,
      active: !sub.active,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || amount === '') return;

    await addSubscription({
      name: name.trim(),
      amount: Number(amount),
      billingCycle,
      nextRenewal,
      category,
      active: true,
    });

    setIsModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-theme flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-accent-theme" /> Subscription Manager
          </h2>
          <p className="text-xs sm:text-sm text-secondary-theme mt-1">
            Audit recurring software memberships, gym passes, and avoid forgotten renewal charges.
          </p>
        </div>

        <button
          onClick={() => {
            setName('');
            setAmount('');
            setBillingCycle('monthly');
            setNextRenewal(getTodayDateString());
            setCategory('Software');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Subscription
        </button>
      </div>

      {/* Overview totals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-card-theme border border-theme shadow-xs">
          <span className="text-xs font-semibold text-secondary-theme">Estimated Monthly Burn</span>
          <p className="text-2xl font-extrabold text-primary-theme font-mono mt-2">
            {formatCurrency(monthlyTotal, settings.currency)} / mo
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-card-theme border border-theme shadow-xs">
          <span className="text-xs font-semibold text-secondary-theme">Annualized Run Rate</span>
          <p className="text-2xl font-extrabold text-rose-500 font-mono mt-2">
            {formatCurrency(yearlyTotal, settings.currency)} / yr
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-card-theme border border-theme shadow-xs">
          <span className="text-xs font-semibold text-secondary-theme">Active Services</span>
          <p className="text-2xl font-extrabold text-accent-theme font-mono mt-2">
            {subscriptions.filter((s) => s.active).length} of {subscriptions.length} Active
          </p>
        </div>
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {subscriptions.map((sub) => (
          <div
            key={sub.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              sub.active
                ? 'bg-card-theme border-theme shadow-xs hover:border-strong-theme'
                : 'bg-secondary-theme/40 border-subtle-theme opacity-60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-secondary-theme text-secondary-theme">
                  {sub.category}
                </span>
                <span className="font-mono font-extrabold text-base text-primary-theme">
                  {formatCurrency(sub.amount, settings.currency)}
                  <span className="text-xs font-normal text-secondary-theme">/{sub.billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                </span>
              </div>

              <h3 className="text-base font-bold text-primary-theme mt-3">{sub.name}</h3>

              <div className="mt-3 p-2.5 rounded-xl bg-secondary-theme/50 flex items-center justify-between text-xs font-mono">
                <span className="text-secondary-theme flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-accent-theme" /> Next Renewal:
                </span>
                <span className="font-bold text-primary-theme">{formatReadableDate(sub.nextRenewal)}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-theme flex items-center justify-between text-xs">
              <button
                onClick={() => handleToggleActive(sub)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  sub.active ? 'bg-emerald-500/15 text-emerald-500' : 'bg-card-theme text-muted-theme'
                }`}
              >
                <Power className="w-3 h-3" /> {sub.active ? 'Active' : 'Paused / Cancelled'}
              </button>

              <button
                onClick={() => deleteSubscription(sub.id)}
                className="p-1 rounded text-secondary-theme hover:text-rose-500"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-modal-theme rounded-2xl border border-theme p-6 text-primary-theme shadow-2xl space-y-4">
            <h3 className="font-bold text-lg">Add Subscription</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Service Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GitHub Copilot, Spotify"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Cost ({settings.currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="19.99"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Billing Cycle</label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Next Renewal Date</label>
                  <input
                    type="date"
                    required
                    value={nextRenewal}
                    onChange={(e) => setNextRenewal(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-theme">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-secondary-theme hover:bg-card-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:bg-accent-hover"
                >
                  Save Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
