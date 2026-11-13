/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GraduationCap, Plus, BookOpen, CheckSquare, Trash2, Calendar, Award } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StudentCourse, CourseAssignment } from '../../types';
import { formatReadableDate, getTodayDateString } from '../../utils/helpers';
import { DateTimePicker } from '../../components/DateTimePicker';

export const StudentView: React.FC = () => {
  const { studentCourses, addCourse, updateCourse, deleteCourse } = useApp();

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [professor, setProfessor] = useState('');
  const [credits, setCredits] = useState(3);
  const [semester, setSemester] = useState('Fall 2026');

  // New assignment modal
  const [selectedCourseForAssign, setSelectedCourseForAssign] = useState<StudentCourse | null>(null);
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDueDate, setAssignDueDate] = useState(getTodayDateString());
  const [assignWeight, setAssignWeight] = useState(20);
  const [assignMaxScore, setAssignMaxScore] = useState(100);

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    await addCourse({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      professor: professor.trim() || undefined,
      credits,
      semester,
      status: 'active',
      assignments: [],
    });

    setIsCourseModalOpen(false);
  };

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForAssign || !assignTitle.trim()) return;

    const newAssign: CourseAssignment = {
      id: `as-${Date.now()}`,
      title: assignTitle.trim(),
      dueDate: assignDueDate,
      weight: assignWeight,
      maxScore: assignMaxScore,
      status: 'pending',
    };

    await updateCourse({
      ...selectedCourseForAssign,
      assignments: [...selectedCourseForAssign.assignments, newAssign],
    });

    setSelectedCourseForAssign(null);
  };

  const handleToggleAssignStatus = async (course: StudentCourse, assignId: string) => {
    const updated = course.assignments.map((a) => {
      if (a.id !== assignId) return a;
      const nextStatus = a.status === 'pending' ? 'submitted' : a.status === 'submitted' ? 'graded' : 'pending';
      return { ...a, status: nextStatus, score: nextStatus === 'graded' ? a.maxScore * 0.95 : undefined };
    });

    await updateCourse({
      ...course,
      assignments: updated as CourseAssignment[],
    });
  };

  const totalCredits = studentCourses.reduce((acc, c) => acc + c.credits, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-theme flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-accent-theme" /> Student Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-secondary-theme mt-1">
            Courses, syllabus deliverables, weighted assignments, credits, and academic timeline.
          </p>
        </div>

        <button
          onClick={() => {
            setCode('');
            setName('');
            setProfessor('');
            setCredits(3);
            setSemester('Fall 2026');
            setIsCourseModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Course
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-card-theme border border-theme shadow-xs">
          <span className="text-xs text-secondary-theme font-medium">Active Enrolled Courses</span>
          <p className="text-2xl font-extrabold text-primary-theme font-mono mt-1">{studentCourses.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-card-theme border border-theme shadow-xs">
          <span className="text-xs text-secondary-theme font-medium">Total Semester Credits</span>
          <p className="text-2xl font-extrabold text-primary-theme font-mono mt-1">{totalCredits} Units</p>
        </div>
        <div className="p-4 rounded-2xl bg-card-theme border border-theme shadow-xs">
          <span className="text-xs text-secondary-theme font-medium">Pending Assignments</span>
          <p className="text-2xl font-extrabold text-accent-theme font-mono mt-1">
            {studentCourses.reduce((acc, c) => acc + c.assignments.filter((a) => a.status === 'pending').length, 0)}
          </p>
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-6">
        {studentCourses.map((c) => (
          <div key={c.id} className="bg-card-theme rounded-2xl border border-theme p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-theme">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-xl bg-accent-light-theme text-accent-theme font-extrabold text-xs font-mono">
                  {c.code}
                </span>
                <div>
                  <h3 className="text-base font-bold text-primary-theme">{c.name}</h3>
                  <p className="text-xs text-secondary-theme">
                    {c.credits} Credits · {c.semester} {c.professor ? `· Prof. ${c.professor}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedCourseForAssign(c);
                    setAssignTitle('');
                    setAssignDueDate(getTodayDateString());
                    setAssignWeight(20);
                    setAssignMaxScore(100);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-secondary-theme hover:bg-card-hover text-xs font-semibold text-primary-theme"
                >
                  + Assignment
                </button>
                <button
                  onClick={() => deleteCourse(c.id)}
                  className="p-1.5 rounded-lg text-secondary-theme hover:text-rose-500 hover:bg-secondary-theme"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Assignments Table/List */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-theme block">
                Deliverables & Exams ({c.assignments.length})
              </span>

              {c.assignments.length === 0 ? (
                <p className="text-xs text-muted-theme italic py-2">No assignments added yet.</p>
              ) : (
                <div className="divide-y divide-subtle-theme">
                  {c.assignments.map((a) => (
                    <div key={a.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          onClick={() => handleToggleAssignStatus(c, a.id)}
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                            a.status === 'graded'
                              ? 'bg-emerald-500/15 text-emerald-500'
                              : a.status === 'submitted'
                              ? 'bg-blue-500/15 text-blue-500'
                              : 'bg-amber-500/15 text-amber-500'
                          }`}
                        >
                          {a.status}
                        </button>
                        <span className="font-semibold text-primary-theme truncate">{a.title}</span>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 text-secondary-theme">
                        <span>Weight: {a.weight}%</span>
                        <span className="font-mono text-muted-theme">Due {formatReadableDate(a.dueDate)}</span>
                        {a.score !== undefined && (
                          <span className="font-bold text-emerald-500 font-mono">
                            {a.score}/{a.maxScore}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Course Modal */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-modal-theme rounded-2xl border border-theme p-6 text-primary-theme shadow-2xl space-y-4">
            <h3 className="font-bold text-lg">Add Enrolled Course</h3>
            <form onSubmit={handleAddCourse} className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Code</label>
                  <input
                    type="text"
                    required
                    placeholder="CS-401"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs font-mono uppercase"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Course Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Distributed Systems"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Credits / Units</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={credits}
                    onChange={(e) => setCredits(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Semester</label>
                  <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Professor (Optional)</label>
                <input
                  type="text"
                  placeholder="Dr. Evelyn Vance"
                  value={professor}
                  onChange={(e) => setProfessor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-theme">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-secondary-theme hover:bg-card-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:bg-accent-hover"
                >
                  Enroll Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {selectedCourseForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-modal-theme rounded-2xl border border-theme p-6 text-primary-theme shadow-2xl space-y-4">
            <h3 className="font-bold text-lg">Add Assignment for {selectedCourseForAssign.code}</h3>
            <form onSubmit={handleAddAssignment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Assignment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midterm Project or Essay"
                  value={assignTitle}
                  onChange={(e) => setAssignTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Due Date</label>
                  <DateTimePicker
                    type="date"
                    required
                    value={assignDueDate}
                    onChange={setAssignDueDate}
                    ariaLabel="Assignment due date"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Weight (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={assignWeight}
                    onChange={(e) => setAssignWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-theme">
                <button
                  type="button"
                  onClick={() => setSelectedCourseForAssign(null)}
                  className="px-4 py-2 rounded-xl text-xs text-secondary-theme hover:bg-card-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:bg-accent-hover"
                >
                  Add Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
