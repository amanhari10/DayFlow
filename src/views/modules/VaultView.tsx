/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Calendar,
  Search,
  Tag,
  Copy,
  Check,
  AlertTriangle,
  Edit2,
  Lock,
  FileText,
  Paperclip,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VaultAttachment, VaultDocument } from '../../types';
import { getTodayDateString } from '../../utils/helpers';
import { DateTimePicker } from '../../components/DateTimePicker';

const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;
const MAX_TOTAL_ATTACHMENT_SIZE = 20 * 1024 * 1024;

function readAttachment(file: File): Promise<VaultAttachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve({ fileName: file.name, mimeType: file.type, dataUrl: reader.result });
      } else {
        reject(new Error(`Unable to read ${file.name}.`));
      }
    };
    reader.onerror = () => reject(reader.error || new Error(`Unable to read ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

export const VaultView: React.FC = () => {
  const { vaultDocuments, addVaultDoc, updateVaultDoc, deleteVaultDoc } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<VaultDocument | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<VaultDocument['category']>('Identity');
  const [documentNumber, setDocumentNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [attachments, setAttachments] = useState<VaultAttachment[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const todayStr = getTodayDateString();

  const openAddModal = () => {
    setEditingDoc(null);
    setTitle('');
    setCategory('Identity');
    setDocumentNumber('');
    setIssueDate('');
    setExpiryDate('');
    setNotes('');
    setTagsInput('');
    setAttachments([]);
    setAttachmentError(null);
    setModalOpen(true);
  };

  const openEditModal = (doc: VaultDocument) => {
    setEditingDoc(doc);
    setTitle(doc.title);
    setCategory(doc.category);
    setDocumentNumber(doc.documentNumber || '');
    setIssueDate(doc.issueDate || '');
    setExpiryDate(doc.expiryDate || '');
    setNotes(doc.notes || '');
    setTagsInput(doc.tags ? doc.tags.join(', ') : '');
    setAttachments(doc.attachments || []);
    setAttachmentError(null);
    setModalOpen(true);
  };

  const handleAttachmentSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    setAttachmentError(null);
    if (files.length === 0) return;

    const unsupported = files.find((file) => !file.type.startsWith('image/') && file.type !== 'application/pdf');
    if (unsupported) {
      setAttachmentError(`${unsupported.name} is not an image or PDF.`);
      return;
    }

    const oversized = files.find((file) => file.size > MAX_ATTACHMENT_SIZE);
    if (oversized) {
      setAttachmentError(`${oversized.name} exceeds the 10 MB per-file limit.`);
      return;
    }

    const currentSize = attachments.reduce((total, attachment) => total + Math.floor(attachment.dataUrl.length * 0.75), 0);
    const addedSize = files.reduce((total, file) => total + file.size, 0);
    if (currentSize + addedSize > MAX_TOTAL_ATTACHMENT_SIZE) {
      setAttachmentError('Attachments for one vault record cannot exceed 20 MB.');
      return;
    }

    try {
      const newAttachments = await Promise.all(files.map(readAttachment));
      setAttachments((previous) => [...previous, ...newAttachments]);
    } catch (error) {
      console.error('Unable to read vault attachment:', error);
      setAttachmentError(error instanceof Error ? error.message : 'Unable to read the selected attachment.');
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      if (editingDoc) {
        await updateVaultDoc({
          ...editingDoc,
          title: title.trim(),
          category,
          documentNumber: documentNumber.trim() || undefined,
          issueDate: issueDate || undefined,
          expiryDate: expiryDate || undefined,
          notes: notes.trim() || undefined,
          tags: cleanTags,
          attachments,
        });
      } else {
        await addVaultDoc({
          title: title.trim(),
          category,
          documentNumber: documentNumber.trim() || undefined,
          issueDate: issueDate || undefined,
          expiryDate: expiryDate || undefined,
          notes: notes.trim() || undefined,
          tags: cleanTags,
          attachments,
        });
      }
      setModalOpen(false);
    } catch (error) {
      console.error('Unable to save vault record:', error);
      setAttachmentError('Unable to save this record. Check browser storage space and try again.');
    }
  };

  const filteredDocs = useMemo(() => {
    return vaultDocuments
      .filter((d) => {
        const matchesCategory = selectedCategory === 'all' || d.category === selectedCategory;
        const matchesSearch =
          d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (d.documentNumber && d.documentNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (d.notes && d.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
          d.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [vaultDocuments, selectedCategory, searchQuery]);

  // Expiring soon (within 60 days)
  const expiringSoonCount = useMemo(() => {
    return vaultDocuments.filter((d) => {
      if (!d.expiryDate) return false;
      const today = new Date(todayStr).getTime();
      const exp = new Date(d.expiryDate).getTime();
      const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
      return diffDays <= 60 && diffDays >= 0;
    }).length;
  }, [vaultDocuments, todayStr]);

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-accent-theme uppercase tracking-wider mb-1">
            <Lock className="w-4 h-4 text-emerald-500" />
            <span>Records & Security</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-theme">
            Document Vault
          </h1>
          <p className="text-xs sm:text-sm text-secondary-theme mt-1">
            Secure offline registry for key identity numbers, policies, renewals, and expiration dates.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-theme text-white text-sm font-semibold hover:opacity-95 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Document</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-card border border-theme shadow-xs">
          <div className="flex items-center justify-between text-secondary-theme text-xs font-medium">
            <span>Total Vault Records</span>
            <ShieldCheck className="w-4 h-4 text-accent-theme" />
          </div>
          <p className="text-2xl font-black text-primary-theme mt-2">{vaultDocuments.length}</p>
          <span className="text-[11px] text-secondary-theme">Stored offline</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-theme shadow-xs">
          <div className="flex items-center justify-between text-secondary-theme text-xs font-medium">
            <span>Expiring &lt; 60 Days</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-primary-theme mt-2">{expiringSoonCount}</p>
          <span className="text-[11px] text-amber-500 font-semibold">Renewal attention</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-theme shadow-xs">
          <div className="flex items-center justify-between text-secondary-theme text-xs font-medium">
            <span>Identity & Passports</span>
            <Tag className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-primary-theme mt-2">
            {vaultDocuments.filter((d) => d.category === 'Identity').length}
          </p>
          <span className="text-[11px] text-secondary-theme">Verified credentials</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-theme shadow-xs">
          <div className="flex items-center justify-between text-secondary-theme text-xs font-medium">
            <span>Policies & Insurance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-primary-theme mt-2">
            {vaultDocuments.filter((d) => d.category === 'Insurance' || d.category === 'Contracts').length}
          </p>
          <span className="text-[11px] text-secondary-theme">Agreements on file</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-theme">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['all', 'Identity', 'Finance', 'Medical', 'Insurance', 'Contracts', 'Vehicle', 'Other'].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-accent-theme text-white'
                    : 'text-secondary-theme hover:bg-card-hover'
                }`}
              >
                {cat === 'all' ? 'All Categories' : cat}
              </button>
            )
          )}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-secondary-theme" />
          <input
            type="text"
            placeholder="Search records, numbers, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-app border border-theme text-xs text-primary-theme placeholder:text-muted-theme focus:outline-hidden focus:border-accent-theme"
          />
        </div>
      </div>

      {/* Document Grid */}
      {filteredDocs.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-2xl border border-theme">
          <ShieldCheck className="w-10 h-10 mx-auto text-secondary-theme/40 mb-3" />
          <h3 className="text-sm font-semibold text-primary-theme">No documents recorded</h3>
          <p className="text-xs text-secondary-theme mt-1">Keep critical numbers and expiration dates handy.</p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:opacity-95"
          >
            Add First Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const isExpiringSoon =
              doc.expiryDate &&
              new Date(doc.expiryDate).getTime() - new Date(todayStr).getTime() < 60 * 24 * 60 * 60 * 1000;
            const isExpired = doc.expiryDate && doc.expiryDate < todayStr;

            return (
              <div
                key={doc.id}
                className="p-5 rounded-2xl bg-card border border-theme hover:border-accent-light-theme transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-accent-light-theme text-accent-theme">
                      {doc.category}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(doc)}
                        className="p-1 rounded text-secondary-theme hover:text-primary-theme"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteVaultDoc(doc.id)}
                        className="p-1 rounded text-secondary-theme hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-primary-theme mt-2">{doc.title}</h3>

                  {doc.documentNumber && (
                    <div className="mt-3 p-2.5 rounded-xl bg-app border border-theme flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <span className="block text-[10px] text-secondary-theme font-medium uppercase">
                          Identifier / Number
                        </span>
                        <code className="text-xs font-mono font-bold text-primary-theme truncate block">
                          {doc.documentNumber}
                        </code>
                      </div>
                      <button
                        onClick={() => handleCopy(doc.documentNumber!, doc.id)}
                        className="p-1.5 rounded-lg text-secondary-theme hover:bg-card-hover hover:text-primary-theme"
                        title="Copy to clipboard"
                      >
                        {copiedId === doc.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}

                  <div className="mt-3 space-y-1 text-xs text-secondary-theme">
                    {doc.issueDate && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-secondary-theme" />
                        <span>Issued: {doc.issueDate}</span>
                      </div>
                    )}
                    {doc.expiryDate && (
                      <div
                        className={`flex items-center gap-1.5 font-semibold ${
                          isExpired ? 'text-rose-500' : isExpiringSoon ? 'text-amber-500' : 'text-secondary-theme'
                        }`}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        <span>
                          {isExpired ? 'Expired: ' : 'Expires: '}
                          {doc.expiryDate}
                        </span>
                      </div>
                    )}
                  </div>

                  {doc.tags && doc.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {doc.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-card-hover text-secondary-theme font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {doc.notes && (
                    <p className="mt-3 text-xs text-secondary-theme italic bg-card-hover/40 p-2.5 rounded-xl">
                      "{doc.notes}"
                    </p>
                  )}

                  {doc.attachments && doc.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {doc.attachments.map((attachment, index) => (
                        <a
                          key={`${attachment.fileName}-${index}`}
                          href={attachment.dataUrl}
                          target="_blank"
                          rel="noreferrer"
                          download={attachment.fileName}
                          className="flex items-center gap-2 rounded-lg bg-card-hover/50 p-2 text-xs text-accent-theme hover:underline"
                        >
                          {attachment.mimeType.startsWith('image/') ? (
                            <img src={attachment.dataUrl} alt={attachment.fileName} className="w-10 h-10 object-cover rounded" />
                          ) : (
                            <FileText className="w-5 h-5 shrink-0" />
                          )}
                          <span className="truncate">{attachment.fileName}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-theme rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-primary-theme">
              {editingDoc ? 'Edit Document Vault Record' : 'Add Document to Vault'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-secondary-theme mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Passport or Comprehensive Auto Insurance"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-secondary-theme mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme"
                  >
                    <option value="Identity">Identity</option>
                    <option value="Finance">Finance</option>
                    <option value="Medical">Medical</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Contracts">Contracts</option>
                    <option value="Vehicle">Vehicle</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-secondary-theme mb-1">ID / Policy Number</label>
                  <input
                    type="text"
                    placeholder="e.g. P12345678"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-secondary-theme mb-1">Issue Date</label>
                  <DateTimePicker
                    type="date"
                    value={issueDate}
                    onChange={setIssueDate}
                    ariaLabel="Document issue date"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-secondary-theme mb-1">Expiry / Renewal</label>
                  <DateTimePicker
                    type="date"
                    value={expiryDate}
                    onChange={setExpiryDate}
                    ariaLabel="Document expiry date"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-secondary-theme mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. government, travel, international"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-secondary-theme mb-1">Important Notes / Location</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Physical copy in safe deposit box; emergency contact line..."
                  className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme resize-none"
                />
              </div>

              <div>
                <label htmlFor="vault-attachments" className="block text-xs font-medium text-secondary-theme mb-1">
                  Attach Images or PDFs (up to 10 MB each, 20 MB total)
                </label>
                <label className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-app border border-dashed border-theme text-xs text-secondary-theme cursor-pointer hover:border-accent-theme">
                  <Paperclip className="w-4 h-4" />
                  Choose files
                  <input
                    id="vault-attachments"
                    type="file"
                    accept="image/*,application/pdf"
                    multiple
                    onChange={handleAttachmentSelect}
                    className="sr-only"
                  />
                </label>
                {attachments.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {attachments.map((attachment, index) => (
                      <li key={`${attachment.fileName}-${index}`} className="flex items-center justify-between gap-2 text-xs text-secondary-theme">
                        <span className="truncate">{attachment.fileName}</span>
                        <button
                          type="button"
                          onClick={() => setAttachments((previous) => previous.filter((_, itemIndex) => itemIndex !== index))}
                          className="shrink-0 text-rose-500 hover:underline"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {attachmentError && <p role="alert" className="mt-2 text-xs text-rose-500">{attachmentError}</p>}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-secondary-theme hover:bg-card-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:opacity-95"
                >
                  {editingDoc ? 'Save Changes' : 'Save Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
