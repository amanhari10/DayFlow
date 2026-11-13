/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { DollarSign, Plus, ArrowDownRight, ArrowUpRight, Trash2, Calendar, CreditCard, PieChart } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ExpenseTransaction } from '../../types';
import { formatReadableDate, getTodayDateString } from '../../utils/helpers';
import { formatCurrency, getCurrencySymbol } from '../../utils/currency';

export const FinanceView: React.FC = () => {
  const { expenses, addExpense, deleteExpense, settings } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [type, setType] = useState<ExpenseTransaction['type']>('expense');
  const [category, setCategory] = useState<ExpenseTransaction['category']>('Food');
  const [date, setDate] = useState(getTodayDateString());
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');

  const { totalIncome, totalExpenses, netBalance } = useMemo(() => {
    let income = 0;
    let expense = 0;
    expenses.forEach((e) => {
      if (e.type === 'income') income += e.amount;
      else expense += e.amount;
    });
    return {
      totalIncome: income,
      totalExpenses: expense,
      netBalance: income - expense,
    };
  }, [expenses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amount === '' || Number(amount) <= 0) return;

    await addExpense({
      description: description.trim(),
      amount: Number(amount),
      type,
      category,
      date,
      paymentMethod,
    });

    setIsModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-theme flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-accent-theme" /> Expense & Budget Tracker
          </h2>
          <p className="text-xs sm:text-sm text-secondary-theme mt-1">
            Track transactions locally, monitor cashflow balance, and manage expenditure categories. Currency changes affect display only.
          </p>
        </div>

        <div className="self-start sm:self-auto">
          <button
            onClick={() => {
              setDescription('');
              setAmount('');
              setType('expense');
              setCategory('Food');
              setDate(getTodayDateString());
              setPaymentMethod('Credit Card');
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Transaction
          </button>
        </div>
      </div>

      {/* Top Balance Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-card-theme border border-theme shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary-theme">Total Inflow</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-500 font-mono mt-2">
            +{formatCurrency(totalIncome, settings.currency)}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-card-theme border border-theme shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary-theme">Total Outflow</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-rose-500 font-mono mt-2">
            -{formatCurrency(totalExpenses, settings.currency)}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-card-theme border border-theme shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary-theme">Net Cashflow</span>
            <div className="p-2 rounded-xl bg-accent-light-theme text-accent-theme">
              <span className="min-w-4 text-center text-sm font-bold" aria-hidden="true">
                {getCurrencySymbol(settings.currency)}
              </span>
            </div>
          </div>
          <p className={`text-2xl font-extrabold font-mono mt-2 ${netBalance >= 0 ? 'text-primary-theme' : 'text-rose-500'}`}>
            {formatCurrency(netBalance, settings.currency)}
          </p>
        </div>
      </div>

      {/* Transactions Ledger */}
      <div className="bg-card-theme rounded-2xl border border-theme shadow-xs overflow-hidden">
        <div className="p-4 border-b border-theme flex items-center justify-between">
          <h3 className="font-bold text-sm sm:text-base text-primary-theme">Recent Transactions</h3>
          <span className="text-xs text-muted-theme">{expenses.length} records</span>
        </div>

        <div className="divide-y divide-theme">
          {expenses.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between gap-3 hover:bg-card-hover transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    item.type === 'income' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500/15 text-rose-500'
                  }`}
                >
                  {item.type === 'income' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs sm:text-sm text-primary-theme truncate">{item.description}</p>
                  <p className="text-[11px] text-secondary-theme flex items-center gap-2 mt-0.5">
                    <span>{formatReadableDate(item.date)}</span>
                    <span>·</span>
                    <span className="capitalize">{item.category}</span>
                    {item.paymentMethod && <span>· 💳 {item.paymentMethod}</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`font-mono font-extrabold text-sm ${
                    item.type === 'income' ? 'text-emerald-500' : 'text-primary-theme'
                  }`}
                >
                  {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount, settings.currency)}
                </span>
                <button
                  onClick={() => deleteExpense(item.id)}
                  className="p-1.5 rounded text-secondary-theme hover:text-rose-500 hover:bg-secondary-theme"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-modal-theme rounded-2xl border border-theme p-6 text-primary-theme shadow-2xl space-y-4">
            <h3 className="font-bold text-lg">Add Transaction</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grocery Store or Retainer"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Amount ({settings.currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-sm font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs font-semibold"
                  >
                    <option value="expense">Expense (-)</option>
                    <option value="income">Income (+)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs"
                  >
                    <option value="Housing">Housing</option>
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Health">Health</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Income">Income</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Payment Method</label>
                <input
                  type="text"
                  placeholder="Apple Pay, Bank Transfer, Card"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs"
                />
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
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
