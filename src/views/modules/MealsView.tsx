/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Utensils,
  Plus,
  Trash2,
  Calendar,
  ShoppingCart,
  CheckSquare,
  Square,
  Edit2,
  ChefHat,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MealPlanItem } from '../../types';
import { getTodayDateString } from '../../utils/helpers';

export const MealsView: React.FC = () => {
  const { mealPlans, addMeal, updateMeal, deleteMeal } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MealPlanItem | null>(null);

  // Grocery check state stored in component session
  const [checkedGroceries, setCheckedGroceries] = useState<Record<string, boolean>>({});

  // Form states
  const [date, setDate] = useState(getTodayDateString());
  const [mealType, setMealType] = useState<MealPlanItem['mealType']>('dinner');
  const [dishName, setDishName] = useState('');
  const [recipeNotes, setRecipeNotes] = useState('');
  const [groceriesInput, setGroceriesInput] = useState('');

  const openAddModal = (defaultDate?: string, defaultType?: MealPlanItem['mealType']) => {
    setEditingMeal(null);
    setDate(defaultDate || getTodayDateString());
    setMealType(defaultType || 'dinner');
    setDishName('');
    setRecipeNotes('');
    setGroceriesInput('');
    setModalOpen(true);
  };

  const openEditModal = (meal: MealPlanItem) => {
    setEditingMeal(meal);
    setDate(meal.date);
    setMealType(meal.mealType);
    setDishName(meal.dishName);
    setRecipeNotes(meal.recipeNotes || '');
    setGroceriesInput(meal.groceriesNeeded ? meal.groceriesNeeded.join(', ') : '');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanGroceries = groceriesInput
      .split(',')
      .map((g) => g.trim())
      .filter((g) => g.length > 0);

    if (editingMeal) {
      await updateMeal({
        ...editingMeal,
        date,
        mealType,
        dishName: dishName.trim(),
        recipeNotes: recipeNotes.trim() || undefined,
        groceriesNeeded: cleanGroceries,
      });
    } else {
      await addMeal({
        date,
        mealType,
        dishName: dishName.trim(),
        recipeNotes: recipeNotes.trim() || undefined,
        groceriesNeeded: cleanGroceries,
      });
    }
    setModalOpen(false);
  };

  // Group meals by date
  const groupedMeals = useMemo(() => {
    const map: Record<string, MealPlanItem[]> = {};
    mealPlans.forEach((meal) => {
      if (!map[meal.date]) map[meal.date] = [];
      map[meal.date].push(meal);
    });
    return map;
  }, [mealPlans]);

  // Aggregate grocery items across all planned meals
  const allGroceries = useMemo(() => {
    const set = new Set<string>();
    mealPlans.forEach((meal) => {
      meal.groceriesNeeded?.forEach((g) => set.add(g));
    });
    return Array.from(set).sort();
  }, [mealPlans]);

  const toggleGrocery = (item: string) => {
    setCheckedGroceries((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const sortedDates = useMemo(() => {
    return Object.keys(groupedMeals).sort();
  }, [groupedMeals]);

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-accent-theme uppercase tracking-wider mb-1">
            <Utensils className="w-4 h-4" />
            <span>Health & Lifestyle</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-theme">
            Meal Planner & Nutrition
          </h1>
          <p className="text-xs sm:text-sm text-secondary-theme mt-1">
            Plan wholesome daily meals and generate automated consolidated grocery shopping lists.
          </p>
        </div>

        <button
          onClick={() => openAddModal()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-theme text-white text-sm font-semibold hover:opacity-95 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Plan Meal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Schedule Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-primary-theme flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent-theme" />
              Upcoming Scheduled Meals
            </h2>
          </div>

          {sortedDates.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-2xl border border-theme">
              <ChefHat className="w-10 h-10 mx-auto text-secondary-theme/40 mb-3" />
              <h3 className="text-sm font-semibold text-primary-theme">No meals planned yet</h3>
              <p className="text-xs text-secondary-theme mt-1">Add breakfast, lunch, or dinner to organize your week.</p>
              <button
                onClick={() => openAddModal()}
                className="mt-4 px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:opacity-95"
              >
                Plan First Meal
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedDates.map((dateStr) => {
                const dayMeals = groupedMeals[dateStr];
                const isToday = dateStr === getTodayDateString();

                return (
                  <div
                    key={dateStr}
                    className={`p-4 sm:p-5 rounded-2xl bg-card border shadow-xs ${
                      isToday ? 'border-accent-theme/60 ring-1 ring-accent-theme/20' : 'border-theme'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-theme">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-primary-theme">{dateStr}</span>
                        {isToday && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-theme text-white">
                            Today
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => openAddModal(dateStr)}
                        className="text-xs font-semibold text-accent-theme hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      {dayMeals.map((meal) => (
                        <div
                          key={meal.id}
                          className="p-3 rounded-xl bg-app border border-theme flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-accent-light-theme text-accent-theme">
                                {meal.mealType}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => openEditModal(meal)}
                                  className="p-1 rounded text-secondary-theme hover:text-primary-theme"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => deleteMeal(meal.id)}
                                  className="p-1 rounded text-secondary-theme hover:text-rose-500"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <h4 className="font-bold text-sm text-primary-theme mt-1.5">{meal.dishName}</h4>
                            {meal.recipeNotes && (
                              <p className="text-xs text-secondary-theme mt-1 italic">{meal.recipeNotes}</p>
                            )}
                          </div>

                          {meal.groceriesNeeded && meal.groceriesNeeded.length > 0 && (
                            <div className="mt-3 pt-2 border-t border-theme/60 flex flex-wrap gap-1">
                              {meal.groceriesNeeded.map((item, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-card-hover text-secondary-theme font-medium"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Consolidated Grocery List Sidebar */}
        <div>
          <div className="p-5 rounded-2xl bg-card border border-theme shadow-xs space-y-4 sticky top-24">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-primary-theme flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-accent-theme" />
                Aggregated Grocery List
              </h3>
              <span className="text-xs text-secondary-theme font-semibold">
                {allGroceries.length} items
              </span>
            </div>

            {allGroceries.length === 0 ? (
              <p className="text-xs text-secondary-theme py-4 text-center">
                Add groceries to your planned dishes to generate a shopping list.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-[60vh] overflow-y-auto">
                {allGroceries.map((item) => {
                  const isChecked = !!checkedGroceries[item];
                  return (
                    <button
                      key={item}
                      onClick={() => toggleGrocery(item)}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-xl border text-xs text-left transition-colors ${
                        isChecked
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 line-through'
                          : 'bg-app border-theme text-primary-theme hover:border-accent-theme'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-secondary-theme shrink-0" />
                      )}
                      <span className="truncate font-medium">{item}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-theme rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-primary-theme">
              {editingMeal ? 'Edit Planned Meal' : 'Plan Meal'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-secondary-theme mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-secondary-theme mb-1">Meal Type</label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-secondary-theme mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grilled Salmon with Quinoa & Asparagus"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-secondary-theme mb-1">
                  Required Groceries (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Salmon fillets, Quinoa, Asparagus, Lemon, Olive oil"
                  value={groceriesInput}
                  onChange={(e) => setGroceriesInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-secondary-theme mb-1">Recipe / Cooking Notes</label>
                <textarea
                  rows={2}
                  value={recipeNotes}
                  onChange={(e) => setRecipeNotes(e.target.value)}
                  placeholder="Bake at 200°C for 18 mins, season with garlic herb butter..."
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
                  {editingMeal ? 'Save Changes' : 'Save Meal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
