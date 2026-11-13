/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Dumbbell,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  Flame,
  Search,
  Activity,
  Award,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WorkoutLog, ExerciseSet } from '../../types';
import { getTodayDateString } from '../../utils/helpers';

export const FitnessView: React.FC = () => {
  const { workouts, addWorkout, updateWorkout, deleteWorkout } = useApp();

  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<WorkoutLog | null>(null);

  // Form state
  const [workoutType, setWorkoutType] = useState<WorkoutLog['workoutType']>('Strength');
  const [date, setDate] = useState(getTodayDateString());
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [caloriesBurned, setCaloriesBurned] = useState<number | undefined>(320);
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<ExerciseSet[]>([
    { name: 'Bench Press', sets: 4, reps: 10, weight: 65 },
  ]);

  const openAddModal = () => {
    setEditingLog(null);
    setWorkoutType('Strength');
    setDate(getTodayDateString());
    setDurationMinutes(45);
    setCaloriesBurned(300);
    setNotes('');
    setExercises([{ name: 'Barbell Squat', sets: 4, reps: 8, weight: 80 }]);
    setModalOpen(true);
  };

  const openEditModal = (log: WorkoutLog) => {
    setEditingLog(log);
    setWorkoutType(log.workoutType);
    setDate(log.date);
    setDurationMinutes(log.durationMinutes);
    setCaloriesBurned(log.caloriesBurned);
    setNotes(log.notes || '');
    setExercises(log.exercises && log.exercises.length > 0 ? log.exercises : [{ name: '', sets: 3, reps: 10 }]);
    setModalOpen(true);
  };

  const handleAddExerciseRow = () => {
    setExercises((prev) => [...prev, { name: '', sets: 3, reps: 10 }]);
  };

  const handleUpdateExerciseRow = (index: number, field: keyof ExerciseSet, value: any) => {
    setExercises((prev) =>
      prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex))
    );
  };

  const handleRemoveExerciseRow = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanExercises = exercises.filter((ex) => ex.name.trim() !== '');

    if (editingLog) {
      await updateWorkout({
        ...editingLog,
        date,
        workoutType,
        durationMinutes: Number(durationMinutes),
        caloriesBurned: caloriesBurned ? Number(caloriesBurned) : undefined,
        exercises: cleanExercises,
        notes: notes.trim() || undefined,
      });
    } else {
      await addWorkout({
        date,
        workoutType,
        durationMinutes: Number(durationMinutes),
        caloriesBurned: caloriesBurned ? Number(caloriesBurned) : undefined,
        exercises: cleanExercises,
        notes: notes.trim() || undefined,
      });
    }
    setModalOpen(false);
  };

  const filteredWorkouts = useMemo(() => {
    return workouts
      .filter((w) => {
        const matchesType = selectedType === 'all' || w.workoutType.toLowerCase() === selectedType.toLowerCase();
        const matchesSearch =
          w.workoutType.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (w.notes && w.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
          w.exercises.some((e) => e.name.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesType && matchesSearch;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [workouts, selectedType, searchQuery]);

  // Aggregate stats
  const totalMinutes = useMemo(() => workouts.reduce((acc, w) => acc + w.durationMinutes, 0), [workouts]);
  const totalCalories = useMemo(() => workouts.reduce((acc, w) => acc + (w.caloriesBurned || 0), 0), [workouts]);
  const workoutCountThisMonth = useMemo(() => {
    const currentYearMonth = getTodayDateString().slice(0, 7);
    return workouts.filter((w) => w.date.startsWith(currentYearMonth)).length;
  }, [workouts]);

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-accent-theme uppercase tracking-wider mb-1">
            <Dumbbell className="w-4 h-4" />
            <span>Health & Lifestyle</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-theme">
            Fitness & Workout Tracker
          </h1>
          <p className="text-xs sm:text-sm text-secondary-theme mt-1">
            Log exercises, track set volumes, calories burned, and celebrate physical consistency.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-theme text-white text-sm font-semibold hover:opacity-95 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Log Workout</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-card border border-theme shadow-xs">
          <div className="flex items-center justify-between text-secondary-theme text-xs font-medium">
            <span>Total Sessions</span>
            <Activity className="w-4 h-4 text-accent-theme" />
          </div>
          <p className="text-2xl font-black text-primary-theme mt-2">{workouts.length}</p>
          <span className="text-[11px] text-emerald-500 font-semibold">{workoutCountThisMonth} this month</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-theme shadow-xs">
          <div className="flex items-center justify-between text-secondary-theme text-xs font-medium">
            <span>Time Trained</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-primary-theme mt-2">
            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
          </p>
          <span className="text-[11px] text-secondary-theme">Total active duration</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-theme shadow-xs">
          <div className="flex items-center justify-between text-secondary-theme text-xs font-medium">
            <span>Est. Burned</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-2xl font-black text-primary-theme mt-2">{totalCalories.toLocaleString()}</p>
          <span className="text-[11px] text-secondary-theme">Calories logged</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-theme shadow-xs">
          <div className="flex items-center justify-between text-secondary-theme text-xs font-medium">
            <span>Consistency</span>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-primary-theme mt-2">
            {workouts.length > 0 ? `${(totalMinutes / workouts.length).toFixed(0)}m` : '0m'}
          </p>
          <span className="text-[11px] text-secondary-theme">Avg. workout length</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-theme">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['all', 'Strength', 'Cardio', 'HIIT', 'Yoga', 'Running', 'Mobility'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedType.toLowerCase() === type.toLowerCase()
                  ? 'bg-accent-theme text-white'
                  : 'text-secondary-theme hover:bg-card-hover'
              }`}
            >
              {type === 'all' ? 'All Types' : type}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-secondary-theme" />
          <input
            type="text"
            placeholder="Search workouts or exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-app border border-theme text-xs text-primary-theme placeholder:text-muted-theme focus:outline-hidden focus:border-accent-theme"
          />
        </div>
      </div>

      {/* Workout Logs List */}
      {filteredWorkouts.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-2xl border border-theme">
          <Dumbbell className="w-10 h-10 mx-auto text-secondary-theme/40 mb-3" />
          <h3 className="text-sm font-semibold text-primary-theme">No workouts found</h3>
          <p className="text-xs text-secondary-theme mt-1">Start logging your training sessions and exercise sets.</p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:opacity-95"
          >
            Log First Workout
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWorkouts.map((workout) => (
            <div
              key={workout.id}
              className="p-5 rounded-2xl bg-card border border-theme hover:border-accent-light-theme transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-accent-light-theme text-accent-theme uppercase tracking-wider">
                      {workout.workoutType}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-secondary-theme mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {workout.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {workout.durationMinutes} mins
                      </span>
                      {workout.caloriesBurned && (
                        <span className="flex items-center gap-1 text-orange-500 font-medium">
                          <Flame className="w-3.5 h-3.5" />
                          {workout.caloriesBurned} kcal
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(workout)}
                      className="p-1.5 rounded-lg text-secondary-theme hover:bg-card-hover hover:text-primary-theme transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteWorkout(workout.id)}
                      className="p-1.5 rounded-lg text-secondary-theme hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Exercises Table/Pills */}
                {workout.exercises && workout.exercises.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-theme">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-secondary-theme mb-2">
                      Exercises ({workout.exercises.length})
                    </h4>
                    <div className="space-y-1.5">
                      {workout.exercises.map((ex, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-app/60 border border-theme/60"
                        >
                          <span className="font-medium text-primary-theme">{ex.name}</span>
                          <span className="text-secondary-theme text-[11px]">
                            {ex.sets} sets × {ex.reps} reps
                            {ex.weight ? ` @ ${ex.weight}kg` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {workout.notes && (
                  <p className="mt-3 text-xs text-secondary-theme italic bg-card-hover/40 p-2 rounded-lg">
                    "{workout.notes}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-theme rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-primary-theme">
              {editingLog ? 'Edit Workout Session' : 'Log New Workout'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-secondary-theme mb-1">Workout Type</label>
                  <select
                    value={workoutType}
                    onChange={(e) => setWorkoutType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme"
                  >
                    <option value="Strength">Strength</option>
                    <option value="Cardio">Cardio</option>
                    <option value="HIIT">HIIT</option>
                    <option value="Yoga">Yoga</option>
                    <option value="Running">Running</option>
                    <option value="Mobility">Mobility</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-secondary-theme mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme"
                  >
                  </input>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-secondary-theme mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    max="600"
                    required
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-secondary-theme mb-1">Calories Burned (est.)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 350"
                    value={caloriesBurned || ''}
                    onChange={(e) => setCaloriesBurned(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme"
                  />
                </div>
              </div>

              {/* Dynamic Exercise Sets */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-secondary-theme">Exercises / Movements</label>
                  <button
                    type="button"
                    onClick={handleAddExerciseRow}
                    className="text-xs text-accent-theme hover:underline flex items-center gap-1 font-medium"
                  >
                    <Plus className="w-3 h-3" /> Add Exercise
                  </button>
                </div>

                <div className="space-y-2">
                  {exercises.map((ex, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Exercise name"
                        value={ex.name}
                        onChange={(e) => handleUpdateExerciseRow(index, 'name', e.target.value)}
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-app border border-theme text-xs text-primary-theme focus:outline-hidden"
                      />
                      <input
                        type="number"
                        placeholder="Sets"
                        title="Sets"
                        value={ex.sets || ''}
                        onChange={(e) => handleUpdateExerciseRow(index, 'sets', Number(e.target.value))}
                        className="w-16 px-2 py-1.5 rounded-lg bg-app border border-theme text-xs text-primary-theme text-center focus:outline-hidden"
                      />
                      <input
                        type="number"
                        placeholder="Reps"
                        title="Reps"
                        value={ex.reps || ''}
                        onChange={(e) => handleUpdateExerciseRow(index, 'reps', Number(e.target.value))}
                        className="w-16 px-2 py-1.5 rounded-lg bg-app border border-theme text-xs text-primary-theme text-center focus:outline-hidden"
                      />
                      <input
                        type="number"
                        placeholder="kg"
                        title="Weight in kg"
                        value={ex.weight || ''}
                        onChange={(e) => handleUpdateExerciseRow(index, 'weight', e.target.value ? Number(e.target.value) : undefined)}
                        className="w-16 px-2 py-1.5 rounded-lg bg-app border border-theme text-xs text-primary-theme text-center focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExerciseRow(index)}
                        className="p-1 text-secondary-theme hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-secondary-theme mb-1">Notes / Reflection</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Form cues, how energy felt, PRs hit..."
                  className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme resize-none"
                />
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
                  {editingLog ? 'Save Changes' : 'Save Workout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
