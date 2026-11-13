/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Award, Plus, Star, CheckCircle, ExternalLink, Trash2, Calendar, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SkillCert } from '../../types';
import { formatReadableDate } from '../../utils/helpers';
import { DateTimePicker } from '../../components/DateTimePicker';

export const SkillsView: React.FC = () => {
  const { skillsCerts, addSkillCert, updateSkillCert, deleteSkillCert } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SkillCert['category']>('Technical');
  const [type, setType] = useState<SkillCert['type']>('skill');
  const [issuer, setIssuer] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [proficiency, setProficiency] = useState(4);
  const [status, setStatus] = useState<SkillCert['status']>('certified');
  const [credentialUrl, setCredentialUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addSkillCert({
      name: name.trim(),
      category,
      type,
      issuer: issuer.trim() || undefined,
      issueDate: issueDate || undefined,
      expiryDate: expiryDate || undefined,
      proficiency,
      status,
      credentialUrl: credentialUrl.trim() || undefined,
    });

    setIsModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-theme flex items-center gap-2">
            <Award className="w-7 h-7 text-accent-theme" /> Certification & Skills Tracker
          </h2>
          <p className="text-xs sm:text-sm text-secondary-theme mt-1">
            Map out core professional proficiencies, credentials, certifications, and renewal dates.
          </p>
        </div>

        <button
          onClick={() => {
            setName('');
            setCategory('Technical');
            setType('skill');
            setIssuer('');
            setIssueDate('');
            setExpiryDate('');
            setProficiency(4);
            setStatus('certified');
            setCredentialUrl('');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Skill / Certification
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {skillsCerts.map((sc) => (
          <div
            key={sc.id}
            className="bg-card-theme rounded-2xl border border-theme p-5 shadow-xs flex flex-col justify-between hover:border-strong-theme transition-all"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-secondary-theme text-secondary-theme">
                  {sc.category}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-accent-light-theme text-accent-theme uppercase">
                  {sc.type}
                </span>
              </div>

              <h3 className="text-base font-bold text-primary-theme mt-2.5 leading-snug">{sc.name}</h3>
              {sc.issuer && (
                <p className="text-xs text-secondary-theme mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent-theme" /> Issued by {sc.issuer}
                </p>
              )}

              {/* Proficiency Level Bar */}
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-xs text-secondary-theme">
                  <span>Proficiency</span>
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < sc.proficiency ? 'fill-amber-400' : 'text-theme'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {(sc.issueDate || sc.expiryDate) && (
                <div className="mt-3 pt-2 border-t border-subtle-theme flex justify-between text-[11px] text-muted-theme font-mono">
                  {sc.issueDate && <span>Issued: {formatReadableDate(sc.issueDate)}</span>}
                  {sc.expiryDate && <span>Expires: {formatReadableDate(sc.expiryDate)}</span>}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-theme flex items-center justify-between text-xs text-secondary-theme">
              {sc.credentialUrl ? (
                <a
                  href={sc.credentialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent-theme hover:underline flex items-center gap-1 font-semibold text-[11px]"
                >
                  Verify <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-[11px] text-muted-theme capitalize">{sc.status}</span>
              )}

              <button
                onClick={() => deleteSkillCert(sc.id)}
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
            <h3 className="font-bold text-lg">Add Skill or Certification</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Solutions Architect or Rust"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs"
                  >
                    <option value="skill">Skill</option>
                    <option value="certification">Certification</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Soft Skills">Soft Skills</option>
                    <option value="Languages">Languages</option>
                    <option value="Creative">Creative</option>
                    <option value="Business">Business</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Issuer / Institution (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Amazon Web Services, Scrum.org"
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Issue Date</label>
                  <DateTimePicker
                    type="date"
                    value={issueDate}
                    onChange={setIssueDate}
                    ariaLabel="Certificate issue date"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Expiry Date</label>
                  <DateTimePicker
                    type="date"
                    value={expiryDate}
                    onChange={setExpiryDate}
                    ariaLabel="Certificate expiry date"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Proficiency (1 - 5)</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={proficiency}
                  onChange={(e) => setProficiency(Number(e.target.value))}
                  className="w-full accent-accent-theme cursor-pointer"
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
