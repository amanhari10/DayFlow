/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Compass,
  Plus,
  Trash2,
  Calendar,
  CheckSquare,
  Square,
  Edit2,
  MapPin,
  DollarSign,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TripPlan, PackingItem, TripActivity } from '../../types';
import { getTodayDateString, triggerCelebration } from '../../utils/helpers';
import { DateTimePicker } from '../../components/DateTimePicker';

export const TravelView: React.FC = () => {
  const { tripPlans, addTrip, updateTrip, deleteTrip } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<TripPlan | null>(null);

  // Form states
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [endDate, setEndDate] = useState(getTodayDateString());
  const [budget, setBudget] = useState(1500);
  const [status, setStatus] = useState<TripPlan['status']>('planning');
  const [packingList, setPackingList] = useState<PackingItem[]>([
    { id: '1', item: 'Passport & Visas', packed: true },
    { id: '2', item: 'Travel Adapters', packed: false },
  ]);
  const [itinerary, setItinerary] = useState<TripActivity[]>([
    { day: 1, activity: 'Arrive and check into hotel', location: 'City Center' },
  ]);

  const openAddModal = () => {
    setEditingTrip(null);
    setDestination('');
    setStartDate(getTodayDateString());
    setEndDate(getTodayDateString());
    setBudget(1200);
    setStatus('planning');
    setPackingList([
      { id: 'p1', item: 'Passport & boarding pass', packed: false },
      { id: 'p2', item: 'Phone charger & power bank', packed: false },
      { id: 'p3', item: 'Comfortable walking shoes', packed: false },
    ]);
    setItinerary([
      { day: 1, activity: 'Arrival & check-in', location: 'Hotel' },
      { day: 2, activity: 'City walking tour & local cuisine', location: 'Downtown' },
    ]);
    setModalOpen(true);
  };

  const openEditModal = (trip: TripPlan) => {
    setEditingTrip(trip);
    setDestination(trip.destination);
    setStartDate(trip.startDate);
    setEndDate(trip.endDate);
    setBudget(trip.budget);
    setStatus(trip.status);
    setPackingList(trip.packingList || []);
    setItinerary(trip.itinerary || []);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTrip) {
      await updateTrip({
        ...editingTrip,
        destination: destination.trim(),
        startDate,
        endDate,
        budget: Number(budget),
        status,
        packingList,
        itinerary,
      });
    } else {
      await addTrip({
        destination: destination.trim(),
        startDate,
        endDate,
        budget: Number(budget),
        status,
        packingList,
        itinerary,
      });
    }
    setModalOpen(false);
  };

  const handleTogglePacking = async (trip: TripPlan, itemId: string) => {
    const updatedPacking = trip.packingList.map((p) =>
      p.id === itemId ? { ...p, packed: !p.packed } : p
    );
    if (updatedPacking.every((p) => p.packed)) {
      triggerCelebration();
    }
    await updateTrip({
      ...trip,
      packingList: updatedPacking,
    });
  };

  const calculateDaysUntil = (dateStr: string) => {
    const today = new Date(getTodayDateString()).getTime();
    const target = new Date(dateStr).getTime();
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-accent-theme uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            <span>Adventures & Exploration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-theme">
            Travel Planner & Itineraries
          </h1>
          <p className="text-xs sm:text-sm text-secondary-theme mt-1">
            Plan destinations, organize day-by-day itineraries, track budgets, and check off packing lists.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-theme text-white text-sm font-semibold hover:opacity-95 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Trip</span>
        </button>
      </div>

      {/* Trips Grid */}
      {tripPlans.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-2xl border border-theme">
          <Compass className="w-10 h-10 mx-auto text-secondary-theme/40 mb-3" />
          <h3 className="text-sm font-semibold text-primary-theme">No trips planned</h3>
          <p className="text-xs text-secondary-theme mt-1">Start planning your next weekend getaway or international expedition.</p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:opacity-95"
          >
            Plan First Trip
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tripPlans.map((trip) => {
            const daysUntil = calculateDaysUntil(trip.startDate);
            const packedCount = trip.packingList.filter((p) => p.packed).length;
            const totalPacking = trip.packingList.length;

            return (
              <div
                key={trip.id}
                className="p-6 rounded-2xl bg-card border border-theme shadow-xs flex flex-col justify-between space-y-5"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            trip.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : trip.status === 'booked'
                              ? 'bg-blue-500/10 text-blue-500'
                              : 'bg-amber-500/10 text-amber-500'
                          }`}
                        >
                          {trip.status}
                        </span>

                        {daysUntil > 0 && trip.status !== 'completed' && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-accent-theme bg-accent-light-theme px-2 py-0.5 rounded-md">
                            <Clock className="w-3 h-3" />
                            {daysUntil} days away
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-black text-primary-theme mt-2 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-accent-theme shrink-0" />
                        {trip.destination}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-secondary-theme mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {trip.startDate} to {trip.endDate}
                        </span>
                        <span className="flex items-center gap-0.5 font-medium text-emerald-500">
                          <DollarSign className="w-3.5 h-3.5" />
                          ${trip.budget.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(trip)}
                        className="p-1.5 rounded-lg text-secondary-theme hover:bg-card-hover hover:text-primary-theme"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTrip(trip.id)}
                        className="p-1.5 rounded-lg text-secondary-theme hover:bg-rose-500/10 hover:text-rose-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Day by Day Itinerary */}
                  {trip.itinerary && trip.itinerary.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-theme">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-secondary-theme mb-2">
                        Itinerary Highlights
                      </h4>
                      <div className="space-y-1.5">
                        {trip.itinerary.map((it, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-xs p-2 rounded-xl bg-app border border-theme"
                          >
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent-theme text-white">
                              Day {it.day}
                            </span>
                            <span className="font-semibold text-primary-theme flex-1">{it.activity}</span>
                            {it.location && (
                              <span className="text-[11px] text-secondary-theme">{it.location}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Packing Checklist */}
                  {trip.packingList && trip.packingList.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-theme">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-secondary-theme">
                          Packing List ({packedCount}/{totalPacking})
                        </h4>
                        <span className="text-[11px] text-accent-theme font-semibold">
                          {Math.round((packedCount / (totalPacking || 1)) * 100)}% packed
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {trip.packingList.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleTogglePacking(trip, item.id)}
                            className={`flex items-center gap-2 text-xs p-2 rounded-lg border text-left transition-colors ${
                              item.packed
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 line-through'
                                : 'bg-app border-theme text-primary-theme hover:border-accent-theme'
                            }`}
                          >
                            {item.packed ? (
                              <CheckSquare className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                            ) : (
                              <Square className="w-3.5 h-3.5 shrink-0 text-secondary-theme" />
                            )}
                            <span className="truncate">{item.item}</span>
                          </button>
                        ))}
                      </div>
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
          <div className="bg-card border border-theme rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-primary-theme">
              {editingTrip ? 'Edit Trip' : 'Plan New Trip'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-secondary-theme mb-1">Destination</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kyoto, Japan or Swiss Alps"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-secondary-theme mb-1">Start Date</label>
                  <DateTimePicker
                    type="date"
                    required
                    value={startDate}
                    onChange={setStartDate}
                    ariaLabel="Trip start date"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-secondary-theme mb-1">End Date</label>
                  <DateTimePicker
                    type="date"
                    required
                    value={endDate}
                    onChange={setEndDate}
                    ariaLabel="Trip end date"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-secondary-theme mb-1">Estimated Budget ($)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-secondary-theme mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme"
                  >
                    <option value="planning">Planning</option>
                    <option value="booked">Booked</option>
                    <option value="dream">Dream / Wishlist</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Itinerary input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-secondary-theme">Itinerary Days</label>
                  <button
                    type="button"
                    onClick={() =>
                      setItinerary((prev) => [
                        ...prev,
                        { day: prev.length + 1, activity: '', location: '' },
                      ])
                    }
                    className="text-xs text-accent-theme font-medium hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Day
                  </button>
                </div>
                <div className="space-y-2">
                  {itinerary.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-secondary-theme w-12">Day {it.day}</span>
                      <input
                        type="text"
                        placeholder="Activity or landmark"
                        value={it.activity}
                        onChange={(e) =>
                          setItinerary((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, activity: e.target.value } : item))
                          )
                        }
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-app border border-theme text-xs text-primary-theme focus:outline-hidden"
                      />
                      <input
                        type="text"
                        placeholder="Location"
                        value={it.location || ''}
                        onChange={(e) =>
                          setItinerary((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, location: e.target.value } : item))
                          )
                        }
                        className="w-24 px-2.5 py-1.5 rounded-lg bg-app border border-theme text-xs text-primary-theme focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setItinerary((prev) => prev.filter((_, i) => i !== idx))}
                        className="p-1 text-secondary-theme hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Packing list input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-secondary-theme">Packing Items</label>
                  <button
                    type="button"
                    onClick={() =>
                      setPackingList((prev) => [
                        ...prev,
                        { id: `pack-${Date.now()}`, item: '', packed: false },
                      ])
                    }
                    className="text-xs text-accent-theme font-medium hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {packingList.map((pack, idx) => (
                    <div key={pack.id || idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Item name (e.g. Noise cancelling headphones)"
                        value={pack.item}
                        onChange={(e) =>
                          setPackingList((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, item: e.target.value } : item))
                          )
                        }
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-app border border-theme text-xs text-primary-theme focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setPackingList((prev) => prev.filter((_, i) => i !== idx))}
                        className="p-1 text-secondary-theme hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
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
                  {editingTrip ? 'Save Changes' : 'Save Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
