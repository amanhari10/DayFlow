/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Briefcase, Plus, ExternalLink, Calendar, Trash2, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { JobApplication, JobStatus } from '../../types';
import { formatReadableDate, getTodayDateString } from '../../utils/helpers';

const PIPELINE_COLUMNS: { status: JobStatus; label: string; color: string }[] = [
  { status: 'wishlist', label: 'Wishlist & Target', color: 'border-slate-500' },
  { status: 'applied', label: 'Applied', color: 'border-blue-500' },
  { status: 'interviewing', label: 'Interviewing', color: 'border-amber-500' },
  { status: 'offer', label: 'Offer Received 🎉', color: 'border-emerald-500' },
  { status: 'rejected', label: 'Archived / Passed', color: 'border-zinc-500' },
];

export const CareerView: React.FC = () => {
  const { jobApplications, addJob, updateJobStatus, deleteJob } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [status, setStatus] = useState<JobStatus>('applied');
  const [appliedDate, setAppliedDate] = useState(getTodayDateString());
  const [interviewDate, setInterviewDate] = useState('');
  const [notes, setNotes] = useState('');
  const [link, setLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;

    await addJob({
      company: company.trim(),
      role: role.trim(),
      location: location.trim() || undefined,
      salary: salary.trim() || undefined,
      status,
      appliedDate,
      interviewDate: interviewDate || undefined,
      notes: notes.trim() || undefined,
      link: link.trim() || undefined,
    });

    setIsModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-theme flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-accent-theme" /> Career & Job Pipeline Tracker
          </h2>
          <p className="text-xs sm:text-sm text-secondary-theme mt-1">
            Track job applications, interview timelines, compensation targets, and recruiter follow-ups.
          </p>
        </div>

        <button
          onClick={() => {
            setCompany('');
            setRole('');
            setLocation('');
            setSalary('');
            setStatus('applied');
            setAppliedDate(getTodayDateString());
            setInterviewDate('');
            setNotes('');
            setLink('');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Application
        </button>
      </div>

      {/* Kanban Pipeline Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {PIPELINE_COLUMNS.map((col) => {
          const items = jobApplications.filter((j) => j.status === col.status);
          return (
            <div key={col.status} className="bg-secondary-theme/40 rounded-2xl border border-theme p-3.5 flex flex-col min-w-[220px]">
              <div className="flex items-center justify-between pb-2 border-b border-theme mb-3">
                <span className="font-bold text-xs text-primary-theme truncate">{col.label}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-card-theme font-bold text-secondary-theme">
                  {items.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 min-h-[350px]">
                {items.map((job) => (
                  <div
                    key={job.id}
                    className="p-3.5 rounded-xl bg-card-theme border border-theme shadow-xs hover:border-strong-theme transition-all space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <h4 className="font-bold text-xs text-primary-theme leading-snug">{job.role}</h4>
                        <p className="text-xs font-semibold text-accent-theme mt-0.5">{job.company}</p>
                      </div>
                      <button
                        onClick={() => deleteJob(job.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-muted-theme hover:text-rose-500 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {job.salary && (
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 inline-block">
                        {job.salary}
                      </span>
                    )}

                    {job.interviewDate && (
                      <p className="text-[10px] text-amber-500 font-semibold flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Interview: {formatReadableDate(job.interviewDate)}
                      </p>
                    )}

                    {job.notes && (
                      <p className="text-[11px] text-secondary-theme line-clamp-2 italic">{job.notes}</p>
                    )}

                    {/* Move Status Controls */}
                    <div className="pt-2 border-t border-subtle-theme flex items-center justify-between text-[10px]">
                      <select
                        value={job.status}
                        onChange={(e) => updateJobStatus(job.id, e.target.value as JobStatus)}
                        className="bg-secondary-theme px-1.5 py-0.5 rounded border border-theme text-secondary-theme font-semibold capitalize"
                      >
                        {PIPELINE_COLUMNS.map((c) => (
                          <option key={c.status} value={c.status}>
                            {c.label}
                          </option>
                        ))}
                      </select>

                      {job.link && (
                        <a
                          href={job.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent-theme hover:underline flex items-center gap-0.5"
                        >
                          Link <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-modal-theme rounded-2xl border border-theme p-6 text-primary-theme shadow-2xl space-y-4">
            <h3 className="font-bold text-lg">Add Job Application</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Company</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stripe, Linear"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Role</label>
                  <input
                    type="text"
                    required
                    placeholder="Staff Engineer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Salary / Range</label>
                  <input
                    type="text"
                    placeholder="$180k - $210k"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as JobStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs capitalize"
                  >
                    <option value="wishlist">Wishlist</option>
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Applied Date</label>
                  <input
                    type="date"
                    value={appliedDate}
                    onChange={(e) => setAppliedDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Interview Date (Optional)</label>
                  <input
                    type="date"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Job Post URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Recruiter Notes / Interview Prep</label>
                <textarea
                  rows={2}
                  placeholder="Referrals, recruiter contact, system design notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme text-xs resize-none"
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
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
