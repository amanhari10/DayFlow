/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Task,
  CalendarEvent,
  Birthday,
  Habit,
  HabitCheckin,
  Note,
  FocusSession,
  AppNotification,
  BackupData,
  UserSettings,
  LifeGoal,
  BucketListItem,
  TimelineMemory,
  SpecialDate,
  StudentCourse,
  SkillCert,
  JobApplication,
  KnowledgeItem,
  ExpenseTransaction,
  SavingsGoal,
  WishlistItem,
  Subscription,
  WorkoutLog,
  WellnessLog,
  ReadingBook,
  TripPlan,
  MealPlanItem,
  HouseholdChore,
  VaultDocument,
  DecisionItem,
  ReviewRecord,
} from '../types';

const DB_NAME = 'dayflow_db';
const DB_VERSION = 2;

export const STORES = {
  TASKS: 'tasks',
  EVENTS: 'events',
  BIRTHDAYS: 'birthdays',
  HABITS: 'habits',
  HABIT_CHECKINS: 'habitCheckins',
  NOTES: 'notes',
  FOCUS_SESSIONS: 'focusSessions',
  NOTIFICATIONS: 'notifications',
  SETTINGS: 'settings',
  // Expansion stores
  GOALS: 'goals',
  BUCKET_LIST: 'bucketList',
  TIMELINE_MEMORIES: 'timelineMemories',
  SPECIAL_DATES: 'specialDates',
  STUDENT_COURSES: 'studentCourses',
  SKILLS_CERTS: 'skillsCerts',
  JOB_APPLICATIONS: 'jobApplications',
  KNOWLEDGE_ITEMS: 'knowledgeItems',
  EXPENSES: 'expenses',
  SAVINGS_GOALS: 'savingsGoals',
  WISHLIST: 'wishlist',
  SUBSCRIPTIONS: 'subscriptions',
  WORKOUTS: 'workouts',
  WELLNESS_LOGS: 'wellnessLogs',
  READING_BOOKS: 'readingBooks',
  TRIP_PLANS: 'tripPlans',
  MEAL_PLANS: 'mealPlans',
  HOUSEHOLD_CHORES: 'householdChores',
  VAULT_DOCUMENTS: 'vaultDocuments',
  DECISION_ITEMS: 'decisionItems',
  REVIEW_RECORDS: 'reviewRecords',
} as const;

export type StoreName = (typeof STORES)[keyof typeof STORES];

class LocalDatabase {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase> | null = null;

  async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported in this browser environment.'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Base stores
        if (!db.objectStoreNames.contains(STORES.TASKS)) {
          const taskStore = db.createObjectStore(STORES.TASKS, { keyPath: 'id' });
          taskStore.createIndex('dueDate', 'dueDate', { unique: false });
          taskStore.createIndex('status', 'status', { unique: false });
          taskStore.createIndex('priority', 'priority', { unique: false });
          taskStore.createIndex('category', 'category', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.EVENTS)) {
          const eventStore = db.createObjectStore(STORES.EVENTS, { keyPath: 'id' });
          eventStore.createIndex('date', 'date', { unique: false });
          eventStore.createIndex('category', 'category', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.BIRTHDAYS)) {
          const bdayStore = db.createObjectStore(STORES.BIRTHDAYS, { keyPath: 'id' });
          bdayStore.createIndex('birthdate', 'birthdate', { unique: false });
          bdayStore.createIndex('name', 'name', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.HABITS)) {
          db.createObjectStore(STORES.HABITS, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(STORES.HABIT_CHECKINS)) {
          const checkinStore = db.createObjectStore(STORES.HABIT_CHECKINS, { keyPath: 'id' });
          checkinStore.createIndex('habitId', 'habitId', { unique: false });
          checkinStore.createIndex('date', 'date', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.NOTES)) {
          const noteStore = db.createObjectStore(STORES.NOTES, { keyPath: 'id' });
          noteStore.createIndex('category', 'category', { unique: false });
          noteStore.createIndex('pinned', 'pinned', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.FOCUS_SESSIONS)) {
          db.createObjectStore(STORES.FOCUS_SESSIONS, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(STORES.NOTIFICATIONS)) {
          db.createObjectStore(STORES.NOTIFICATIONS, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
        }

        // Expanded Stores
        const expandedStores = [
          STORES.GOALS,
          STORES.BUCKET_LIST,
          STORES.TIMELINE_MEMORIES,
          STORES.SPECIAL_DATES,
          STORES.STUDENT_COURSES,
          STORES.SKILLS_CERTS,
          STORES.JOB_APPLICATIONS,
          STORES.KNOWLEDGE_ITEMS,
          STORES.EXPENSES,
          STORES.SAVINGS_GOALS,
          STORES.WISHLIST,
          STORES.SUBSCRIPTIONS,
          STORES.WORKOUTS,
          STORES.WELLNESS_LOGS,
          STORES.READING_BOOKS,
          STORES.TRIP_PLANS,
          STORES.MEAL_PLANS,
          STORES.HOUSEHOLD_CHORES,
          STORES.VAULT_DOCUMENTS,
          STORES.DECISION_ITEMS,
          STORES.REVIEW_RECORDS,
        ];

        for (const store of expandedStores) {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store, { keyPath: 'id' });
          }
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onerror = () => {
        reject(request.error || new Error('Failed to open DayFlow IndexedDB database.'));
      };
    });

    return this.initPromise;
  }

  async getAll<T>(storeName: StoreName): Promise<T[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      if (!db.objectStoreNames.contains(storeName)) {
        resolve([]);
        return;
      }
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve((request.result as T[]) || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getById<T>(storeName: StoreName, id: string): Promise<T | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      if (!db.objectStoreNames.contains(storeName)) {
        resolve(null);
        return;
      }
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve((request.result as T) || null);
      request.onerror = () => reject(request.error);
    });
  }

  async put<T extends { id?: string; key?: string }>(storeName: StoreName, item: T): Promise<T> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onsuccess = () => resolve(item);
      request.onerror = () => reject(request.error);
    });
  }

  async putMany<T extends { id?: string; key?: string }>(storeName: StoreName, items: T[]): Promise<void> {
    if (!items || items.length === 0) return;
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      for (const item of items) {
        store.put(item);
      }

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async delete(storeName: StoreName, id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName: StoreName): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      if (!db.objectStoreNames.contains(storeName)) {
        resolve();
        return;
      }
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearAllData(): Promise<void> {
    const db = await this.getDB();
    const storeNames = Array.from(db.objectStoreNames) as StoreName[];
    for (const name of storeNames) {
      await this.clear(name);
    }
  }

  async purgeDemoData(): Promise<Record<string, number>> {
    const stats: Record<string, number> = {};
    const allStoreNames = Object.values(STORES) as StoreName[];

    for (const storeName of allStoreNames) {
      if (storeName === STORES.SETTINGS) continue;
      const records = await this.getAll<{ id: string; isDemo?: boolean }>(storeName);
      const demoRecords = records.filter((r) => r.isDemo);
      for (const r of demoRecords) {
        await this.delete(storeName, r.id);
      }
      if (demoRecords.length > 0) {
        stats[storeName] = demoRecords.length;
      }
    }

    return stats;
  }

  async exportFullBackup(settings: UserSettings): Promise<BackupData> {
    const [
      tasks,
      events,
      birthdays,
      habits,
      habitCheckins,
      notes,
      focusSessions,
      notifications,
      goals,
      bucketList,
      timelineMemories,
      specialDates,
      studentCourses,
      skillsCerts,
      jobApplications,
      knowledgeItems,
      expenses,
      savingsGoals,
      wishlist,
      subscriptions,
      workouts,
      wellnessLogs,
      readingBooks,
      tripPlans,
      mealPlans,
      householdChores,
      vaultDocuments,
      decisionItems,
      reviewRecords,
    ] = await Promise.all([
      this.getAll<Task>(STORES.TASKS),
      this.getAll<CalendarEvent>(STORES.EVENTS),
      this.getAll<Birthday>(STORES.BIRTHDAYS),
      this.getAll<Habit>(STORES.HABITS),
      this.getAll<HabitCheckin>(STORES.HABIT_CHECKINS),
      this.getAll<Note>(STORES.NOTES),
      this.getAll<FocusSession>(STORES.FOCUS_SESSIONS),
      this.getAll<AppNotification>(STORES.NOTIFICATIONS),
      this.getAll<LifeGoal>(STORES.GOALS),
      this.getAll<BucketListItem>(STORES.BUCKET_LIST),
      this.getAll<TimelineMemory>(STORES.TIMELINE_MEMORIES),
      this.getAll<SpecialDate>(STORES.SPECIAL_DATES),
      this.getAll<StudentCourse>(STORES.STUDENT_COURSES),
      this.getAll<SkillCert>(STORES.SKILLS_CERTS),
      this.getAll<JobApplication>(STORES.JOB_APPLICATIONS),
      this.getAll<KnowledgeItem>(STORES.KNOWLEDGE_ITEMS),
      this.getAll<ExpenseTransaction>(STORES.EXPENSES),
      this.getAll<SavingsGoal>(STORES.SAVINGS_GOALS),
      this.getAll<WishlistItem>(STORES.WISHLIST),
      this.getAll<Subscription>(STORES.SUBSCRIPTIONS),
      this.getAll<WorkoutLog>(STORES.WORKOUTS),
      this.getAll<WellnessLog>(STORES.WELLNESS_LOGS),
      this.getAll<ReadingBook>(STORES.READING_BOOKS),
      this.getAll<TripPlan>(STORES.TRIP_PLANS),
      this.getAll<MealPlanItem>(STORES.MEAL_PLANS),
      this.getAll<HouseholdChore>(STORES.HOUSEHOLD_CHORES),
      this.getAll<VaultDocument>(STORES.VAULT_DOCUMENTS),
      this.getAll<DecisionItem>(STORES.DECISION_ITEMS),
      this.getAll<ReviewRecord>(STORES.REVIEW_RECORDS),
    ]);

    return {
      version: 2,
      exportedAt: new Date().toISOString(),
      settings,
      tasks,
      events,
      birthdays,
      habits,
      habitCheckins,
      notes,
      focusSessions,
      notifications,
      goals,
      bucketList,
      timelineMemories,
      specialDates,
      studentCourses,
      skillsCerts,
      jobApplications,
      knowledgeItems,
      expenses,
      savingsGoals,
      wishlist,
      subscriptions,
      workouts,
      wellnessLogs,
      readingBooks,
      tripPlans,
      mealPlans,
      householdChores,
      vaultDocuments,
      decisionItems,
      reviewRecords,
    };
  }

  async restoreFullBackup(data: BackupData, mode: 'replace' | 'merge' = 'replace'): Promise<void> {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid backup file format.');
    }

    if (mode === 'replace') {
      await this.clearAllData();
    }

    if (Array.isArray(data.tasks)) await this.putMany(STORES.TASKS, data.tasks);
    if (Array.isArray(data.events)) await this.putMany(STORES.EVENTS, data.events);
    if (Array.isArray(data.birthdays)) await this.putMany(STORES.BIRTHDAYS, data.birthdays);
    if (Array.isArray(data.habits)) await this.putMany(STORES.HABITS, data.habits);
    if (Array.isArray(data.habitCheckins)) await this.putMany(STORES.HABIT_CHECKINS, data.habitCheckins);
    if (Array.isArray(data.notes)) await this.putMany(STORES.NOTES, data.notes);
    if (Array.isArray(data.focusSessions)) await this.putMany(STORES.FOCUS_SESSIONS, data.focusSessions);
    if (Array.isArray(data.notifications)) await this.putMany(STORES.NOTIFICATIONS, data.notifications);

    // Expansion
    if (Array.isArray(data.goals)) await this.putMany(STORES.GOALS, data.goals);
    if (Array.isArray(data.bucketList)) await this.putMany(STORES.BUCKET_LIST, data.bucketList);
    if (Array.isArray(data.timelineMemories)) await this.putMany(STORES.TIMELINE_MEMORIES, data.timelineMemories);
    if (Array.isArray(data.specialDates)) await this.putMany(STORES.SPECIAL_DATES, data.specialDates);
    if (Array.isArray(data.studentCourses)) await this.putMany(STORES.STUDENT_COURSES, data.studentCourses);
    if (Array.isArray(data.skillsCerts)) await this.putMany(STORES.SKILLS_CERTS, data.skillsCerts);
    if (Array.isArray(data.jobApplications)) await this.putMany(STORES.JOB_APPLICATIONS, data.jobApplications);
    if (Array.isArray(data.knowledgeItems)) await this.putMany(STORES.KNOWLEDGE_ITEMS, data.knowledgeItems);
    if (Array.isArray(data.expenses)) await this.putMany(STORES.EXPENSES, data.expenses);
    if (Array.isArray(data.savingsGoals)) await this.putMany(STORES.SAVINGS_GOALS, data.savingsGoals);
    if (Array.isArray(data.wishlist)) await this.putMany(STORES.WISHLIST, data.wishlist);
    if (Array.isArray(data.subscriptions)) await this.putMany(STORES.SUBSCRIPTIONS, data.subscriptions);
    if (Array.isArray(data.workouts)) await this.putMany(STORES.WORKOUTS, data.workouts);
    if (Array.isArray(data.wellnessLogs)) await this.putMany(STORES.WELLNESS_LOGS, data.wellnessLogs);
    if (Array.isArray(data.readingBooks)) await this.putMany(STORES.READING_BOOKS, data.readingBooks);
    if (Array.isArray(data.tripPlans)) await this.putMany(STORES.TRIP_PLANS, data.tripPlans);
    if (Array.isArray(data.mealPlans)) await this.putMany(STORES.MEAL_PLANS, data.mealPlans);
    if (Array.isArray(data.householdChores)) await this.putMany(STORES.HOUSEHOLD_CHORES, data.householdChores);
    if (Array.isArray(data.vaultDocuments)) await this.putMany(STORES.VAULT_DOCUMENTS, data.vaultDocuments);
    if (Array.isArray(data.decisionItems)) await this.putMany(STORES.DECISION_ITEMS, data.decisionItems);
    if (Array.isArray(data.reviewRecords)) await this.putMany(STORES.REVIEW_RECORDS, data.reviewRecords);
  }
}

export const db = new LocalDatabase();
