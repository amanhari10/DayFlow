/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  Task,
  CalendarEvent,
  Birthday,
  Habit,
  HabitCheckin,
  Note,
  FocusSession,
  AppNotification,
  UserSettings,
  ActiveView,
  ThemeMode,
  AccentColor,
  FocusSessionType,
  BackupData,
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
  JobStatus,
} from '../types';
import { db, STORES, StoreName } from '../db/indexedDB';
import { DEFAULT_SETTINGS, generateSampleData } from '../db/sampleData';
import {
  getTodayDateString,
  getNextRecurringDate,
  triggerCelebration,
  calculateBirthdayInfo,
} from '../utils/helpers';
import { soundService } from '../utils/audio';

interface AppContextType {
  // Core Data
  tasks: Task[];
  events: CalendarEvent[];
  birthdays: Birthday[];
  habits: Habit[];
  habitCheckins: HabitCheckin[];
  notes: Note[];
  focusSessions: FocusSession[];
  notifications: AppNotification[];
  settings: UserSettings;
  isLoading: boolean;
  storageError: string | null;

  // Expansion Data
  goals: LifeGoal[];
  bucketList: BucketListItem[];
  timelineMemories: TimelineMemory[];
  specialDates: SpecialDate[];
  studentCourses: StudentCourse[];
  skillsCerts: SkillCert[];
  jobApplications: JobApplication[];
  knowledgeItems: KnowledgeItem[];
  expenses: ExpenseTransaction[];
  savingsGoals: SavingsGoal[];
  wishlist: WishlistItem[];
  subscriptions: Subscription[];
  workouts: WorkoutLog[];
  wellnessLogs: WellnessLog[];
  readingBooks: ReadingBook[];
  tripPlans: TripPlan[];
  mealPlans: MealPlanItem[];
  householdChores: HouseholdChore[];
  vaultDocuments: VaultDocument[];
  decisionItems: DecisionItem[];
  reviewRecords: ReviewRecord[];

  // Navigation & UI
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;

  // Modals
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
  quickAddTab: 'task' | 'event' | 'birthday' | 'habit' | 'note' | 'goal' | 'expense' | 'reading';
  openQuickAddWithTab: (tab: 'task' | 'event' | 'birthday' | 'habit' | 'note' | 'goal' | 'expense' | 'reading') => void;

  // Editing state for modals
  editingTask: Task | null;
  setEditingTask: (t: Task | null) => void;
  editingEvent: CalendarEvent | null;
  setEditingEvent: (e: CalendarEvent | null) => void;
  editingBirthday: Birthday | null;
  setEditingBirthday: (b: Birthday | null) => void;
  editingHabit: Habit | null;
  setEditingHabit: (h: Habit | null) => void;
  editingNote: Note | null;
  setEditingNote: (n: Note | null) => void;

  // Focus Timer
  timerMode: FocusSessionType;
  timeLeft: number;
  isTimerRunning: boolean;
  linkedTaskId: string | null;
  ambientSound: 'none' | 'rain' | 'white_noise';
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipTimer: () => void;
  changeTimerMode: (mode: FocusSessionType) => void;
  setLinkedTaskId: (id: string | null) => void;
  setAmbientSound: (sound: 'none' | 'rain' | 'white_noise') => void;

  // Core CRUD
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<Task>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  moveTaskStatus: (id: string, status: Task['status']) => Promise<void>;

  addEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<CalendarEvent>;
  updateEvent: (event: CalendarEvent) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  addBirthday: (bday: Omit<Birthday, 'id'>) => Promise<Birthday>;
  updateBirthday: (bday: Birthday) => Promise<void>;
  deleteBirthday: (id: string) => Promise<void>;

  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => Promise<Habit>;
  updateHabit: (habit: Habit) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitCheckin: (habitId: string, dateStr?: string) => Promise<void>;

  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Note>;
  updateNote: (note: Note) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  togglePinNote: (id: string) => Promise<void>;

  // Expansion CRUD
  addGoal: (goal: Omit<LifeGoal, 'id'>) => Promise<LifeGoal>;
  updateGoal: (goal: LifeGoal) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  addBucketItem: (item: Omit<BucketListItem, 'id'>) => Promise<BucketListItem>;
  updateBucketItem: (item: BucketListItem) => Promise<void>;
  deleteBucketItem: (id: string) => Promise<void>;

  addMemory: (memory: Omit<TimelineMemory, 'id'>) => Promise<TimelineMemory>;
  updateMemory: (memory: TimelineMemory) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;

  addSpecialDate: (item: Omit<SpecialDate, 'id'>) => Promise<SpecialDate>;
  updateSpecialDate: (item: SpecialDate) => Promise<void>;
  deleteSpecialDate: (id: string) => Promise<void>;

  addCourse: (course: Omit<StudentCourse, 'id'>) => Promise<StudentCourse>;
  updateCourse: (course: StudentCourse) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;

  addSkillCert: (item: Omit<SkillCert, 'id'>) => Promise<SkillCert>;
  updateSkillCert: (item: SkillCert) => Promise<void>;
  deleteSkillCert: (id: string) => Promise<void>;

  addJob: (job: Omit<JobApplication, 'id'>) => Promise<JobApplication>;
  updateJob: (job: JobApplication) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  updateJobStatus: (id: string, status: JobStatus) => Promise<void>;

  addKnowledge: (item: Omit<KnowledgeItem, 'id' | 'createdAt'>) => Promise<KnowledgeItem>;
  updateKnowledge: (item: KnowledgeItem) => Promise<void>;
  deleteKnowledge: (id: string) => Promise<void>;

  addExpense: (expense: Omit<ExpenseTransaction, 'id'>) => Promise<ExpenseTransaction>;
  updateExpense: (expense: ExpenseTransaction) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => Promise<SavingsGoal>;
  updateSavingsGoal: (goal: SavingsGoal) => Promise<void>;
  deleteSavingsGoal: (id: string) => Promise<void>;

  addWishlistItem: (item: Omit<WishlistItem, 'id'>) => Promise<WishlistItem>;
  updateWishlistItem: (item: WishlistItem) => Promise<void>;
  deleteWishlistItem: (id: string) => Promise<void>;

  addSubscription: (sub: Omit<Subscription, 'id'>) => Promise<Subscription>;
  updateSubscription: (sub: Subscription) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;

  addWorkout: (wo: Omit<WorkoutLog, 'id'>) => Promise<WorkoutLog>;
  updateWorkout: (wo: WorkoutLog) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;

  addWellnessLog: (log: Omit<WellnessLog, 'id'>) => Promise<WellnessLog>;
  updateWellnessLog: (log: WellnessLog) => Promise<void>;
  deleteWellnessLog: (id: string) => Promise<void>;

  addBook: (book: Omit<ReadingBook, 'id'>) => Promise<ReadingBook>;
  updateBook: (book: ReadingBook) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;

  addTrip: (trip: Omit<TripPlan, 'id'>) => Promise<TripPlan>;
  updateTrip: (trip: TripPlan) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;

  addMeal: (meal: Omit<MealPlanItem, 'id'>) => Promise<MealPlanItem>;
  updateMeal: (meal: MealPlanItem) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;

  addChore: (chore: Omit<HouseholdChore, 'id'>) => Promise<HouseholdChore>;
  updateChore: (chore: HouseholdChore) => Promise<void>;
  deleteChore: (id: string) => Promise<void>;
  toggleChoreDone: (id: string) => Promise<void>;

  addVaultDoc: (doc: Omit<VaultDocument, 'id'>) => Promise<VaultDocument>;
  updateVaultDoc: (doc: VaultDocument) => Promise<void>;
  deleteVaultDoc: (id: string) => Promise<void>;

  addDecision: (dec: Omit<DecisionItem, 'id'>) => Promise<DecisionItem>;
  updateDecision: (dec: DecisionItem) => Promise<void>;
  deleteDecision: (id: string) => Promise<void>;

  addReview: (rev: Omit<ReviewRecord, 'id'>) => Promise<ReviewRecord>;
  updateReview: (rev: ReviewRecord) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;

  // Routines & Preferences
  toggleMorningRoutineItem: (id: string) => Promise<void>;
  toggleEveningRoutineItem: (id: string) => Promise<void>;
  toggleModuleEnabled: (moduleKey: string) => Promise<void>;

  // Settings & Theme
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setAccentColor: (color: AccentColor) => Promise<void>;

  // Notifications
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
  requestNotificationPermission: () => Promise<boolean>;

  // Backup & sample data
  loadSampleData: () => Promise<void>;
  purgeDemoData: () => Promise<Record<string, number>>;
  resetAllData: () => Promise<void>;
  exportBackup: () => Promise<BackupData>;
  importBackup: (backup: BackupData, mode?: 'replace' | 'merge') => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Base State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitCheckins, setHabitCheckins] = useState<HabitCheckin[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem('dayflow_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Expansion State
  const [goals, setGoals] = useState<LifeGoal[]>([]);
  const [bucketList, setBucketList] = useState<BucketListItem[]>([]);
  const [timelineMemories, setTimelineMemories] = useState<TimelineMemory[]>([]);
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>([]);
  const [studentCourses, setStudentCourses] = useState<StudentCourse[]>([]);
  const [skillsCerts, setSkillsCerts] = useState<SkillCert[]>([]);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseTransaction[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [wellnessLogs, setWellnessLogs] = useState<WellnessLog[]>([]);
  const [readingBooks, setReadingBooks] = useState<ReadingBook[]>([]);
  const [tripPlans, setTripPlans] = useState<TripPlan[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlanItem[]>([]);
  const [householdChores, setHouseholdChores] = useState<HouseholdChore[]>([]);
  const [vaultDocuments, setVaultDocuments] = useState<VaultDocument[]>([]);
  const [decisionItems, setDecisionItems] = useState<DecisionItem[]>([]);
  const [reviewRecords, setReviewRecords] = useState<ReviewRecord[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [storageError, setStorageError] = useState<string | null>(null);

  // Navigation & UI
  const [activeView, setActiveView] = useState<ActiveView>(() => {
    return (localStorage.getItem('dayflow_active_view') as ActiveView) || 'day';
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('dayflow_sidebar_collapsed') === 'true';
  });

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddTab, setQuickAddTab] = useState<'task' | 'event' | 'birthday' | 'habit' | 'note' | 'goal' | 'expense' | 'reading'>('task');

  // Editing state
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [editingBirthday, setEditingBirthday] = useState<Birthday | null>(null);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Focus Timer state
  const [timerMode, setTimerMode] = useState<FocusSessionType>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(settings.pomodoro.focusDuration * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [linkedTaskId, setLinkedTaskId] = useState<string | null>(null);
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'white_noise'>('none');
  const timerEndTimeRef = useRef<number | null>(null);
  const processedReminderIdsRef = useRef(new Set<string>());

  // Save active view & sidebar collapse
  useEffect(() => {
    try {
      localStorage.setItem('dayflow_active_view', activeView);
    } catch {}
  }, [activeView]);

  useEffect(() => {
    try {
      localStorage.setItem('dayflow_sidebar_collapsed', String(sidebarCollapsed));
    } catch {}
  }, [sidebarCollapsed]);

  // Apply Theme Mode & Accent to root element
  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      const mode = settings.themeMode;
      const isDark =
        mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      if (settings.themeMode === 'system') applyTheme();
    };
    mediaQuery.addEventListener('change', listener);

    const accentClasses = ['accent-blue', 'accent-purple', 'accent-green', 'accent-orange', 'accent-rose'];
    accentClasses.forEach((cls) => root.classList.remove(cls));
    root.classList.add(`accent-${settings.accentColor}`);

    return () => mediaQuery.removeEventListener('change', listener);
  }, [settings.themeMode, settings.accentColor]);

  // Persist settings
  const updateSettings = useCallback(
    async (newSettings: Partial<UserSettings>) => {
      setSettings((prev) => {
        const updated = { ...prev, ...newSettings };
        try {
          localStorage.setItem('dayflow_settings', JSON.stringify(updated));
        } catch {}
        db.put(STORES.SETTINGS, { key: 'user_settings', value: updated }).catch(() => {});
        return updated;
      });
    },
    []
  );

  const setThemeMode = useCallback(
    async (mode: ThemeMode) => {
      await updateSettings({ themeMode: mode });
    },
    [updateSettings]
  );

  const setAccentColor = useCallback(
    async (color: AccentColor) => {
      await updateSettings({ accentColor: color });
    },
    [updateSettings]
  );

  const openQuickAddWithTab = useCallback((tab: 'task' | 'event' | 'birthday' | 'habit' | 'note' | 'goal' | 'expense' | 'reading') => {
    setQuickAddTab(tab);
    setIsQuickAddOpen(true);
  }, []);

  // Keyboard shortcuts (Cmd/Ctrl + K, Cmd/Ctrl + N, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsQuickAddOpen(true);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsQuickAddOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load all data on mount
  useEffect(() => {
    let isMounted = true;
    const initializeData = async () => {
      try {
        setIsLoading(true);
        const [
          savedTasks,
          savedEvents,
          savedBirthdays,
          savedHabits,
          savedCheckins,
          savedNotes,
          savedSessions,
          savedNotifs,
          savedSettingsRecord,
          savedGoals,
          savedBucket,
          savedMemories,
          savedSpecialDates,
          savedCourses,
          savedSkills,
          savedJobs,
          savedKnowledge,
          savedExpenses,
          savedSavings,
          savedWishlist,
          savedSubs,
          savedWorkouts,
          savedWellness,
          savedBooks,
          savedTrips,
          savedMeals,
          savedChores,
          savedVault,
          savedDecisions,
          savedReviews,
        ] = await Promise.all([
          db.getAll<Task>(STORES.TASKS),
          db.getAll<CalendarEvent>(STORES.EVENTS),
          db.getAll<Birthday>(STORES.BIRTHDAYS),
          db.getAll<Habit>(STORES.HABITS),
          db.getAll<HabitCheckin>(STORES.HABIT_CHECKINS),
          db.getAll<Note>(STORES.NOTES),
          db.getAll<FocusSession>(STORES.FOCUS_SESSIONS),
          db.getAll<AppNotification>(STORES.NOTIFICATIONS),
          db.getById<{ key: string; value: UserSettings }>(STORES.SETTINGS, 'user_settings'),
          db.getAll<LifeGoal>(STORES.GOALS),
          db.getAll<BucketListItem>(STORES.BUCKET_LIST),
          db.getAll<TimelineMemory>(STORES.TIMELINE_MEMORIES),
          db.getAll<SpecialDate>(STORES.SPECIAL_DATES),
          db.getAll<StudentCourse>(STORES.STUDENT_COURSES),
          db.getAll<SkillCert>(STORES.SKILLS_CERTS),
          db.getAll<JobApplication>(STORES.JOB_APPLICATIONS),
          db.getAll<KnowledgeItem>(STORES.KNOWLEDGE_ITEMS),
          db.getAll<ExpenseTransaction>(STORES.EXPENSES),
          db.getAll<SavingsGoal>(STORES.SAVINGS_GOALS),
          db.getAll<WishlistItem>(STORES.WISHLIST),
          db.getAll<Subscription>(STORES.SUBSCRIPTIONS),
          db.getAll<WorkoutLog>(STORES.WORKOUTS),
          db.getAll<WellnessLog>(STORES.WELLNESS_LOGS),
          db.getAll<ReadingBook>(STORES.READING_BOOKS),
          db.getAll<TripPlan>(STORES.TRIP_PLANS),
          db.getAll<MealPlanItem>(STORES.MEAL_PLANS),
          db.getAll<HouseholdChore>(STORES.HOUSEHOLD_CHORES),
          db.getAll<VaultDocument>(STORES.VAULT_DOCUMENTS),
          db.getAll<DecisionItem>(STORES.DECISION_ITEMS),
          db.getAll<ReviewRecord>(STORES.REVIEW_RECORDS),
        ]);

        if (!isMounted) return;

        // If completely empty first launch, populate sample demo data
        if (savedTasks.length === 0 && savedGoals.length === 0 && savedHabits.length === 0) {
          const sample = generateSampleData();
          await Promise.all([
            db.putMany(STORES.TASKS, sample.tasks),
            db.putMany(STORES.EVENTS, sample.events),
            db.putMany(STORES.BIRTHDAYS, sample.birthdays),
            db.putMany(STORES.HABITS, sample.habits),
            db.putMany(STORES.HABIT_CHECKINS, sample.habitCheckins),
            db.putMany(STORES.NOTES, sample.notes),
            db.putMany(STORES.FOCUS_SESSIONS, sample.focusSessions),
            db.putMany(STORES.GOALS, sample.goals),
            db.putMany(STORES.BUCKET_LIST, sample.bucketList),
            db.putMany(STORES.TIMELINE_MEMORIES, sample.timelineMemories),
            db.putMany(STORES.SPECIAL_DATES, sample.specialDates),
            db.putMany(STORES.STUDENT_COURSES, sample.studentCourses),
            db.putMany(STORES.SKILLS_CERTS, sample.skillsCerts),
            db.putMany(STORES.JOB_APPLICATIONS, sample.jobApplications),
            db.putMany(STORES.KNOWLEDGE_ITEMS, sample.knowledgeItems),
            db.putMany(STORES.EXPENSES, sample.expenses),
            db.putMany(STORES.SAVINGS_GOALS, sample.savingsGoals),
            db.putMany(STORES.WISHLIST, sample.wishlist),
            db.putMany(STORES.SUBSCRIPTIONS, sample.subscriptions),
            db.putMany(STORES.WORKOUTS, sample.workouts),
            db.putMany(STORES.WELLNESS_LOGS, sample.wellnessLogs),
            db.putMany(STORES.READING_BOOKS, sample.readingBooks),
            db.putMany(STORES.TRIP_PLANS, sample.tripPlans),
            db.putMany(STORES.MEAL_PLANS, sample.mealPlans),
            db.putMany(STORES.HOUSEHOLD_CHORES, sample.householdChores),
            db.putMany(STORES.VAULT_DOCUMENTS, sample.vaultDocuments),
            db.putMany(STORES.DECISION_ITEMS, sample.decisionItems),
            db.putMany(STORES.REVIEW_RECORDS, sample.reviewRecords),
          ]);
          setTasks(sample.tasks);
          setEvents(sample.events);
          setBirthdays(sample.birthdays);
          setHabits(sample.habits);
          setHabitCheckins(sample.habitCheckins);
          setNotes(sample.notes);
          setFocusSessions(sample.focusSessions);
          setGoals(sample.goals);
          setBucketList(sample.bucketList);
          setTimelineMemories(sample.timelineMemories);
          setSpecialDates(sample.specialDates);
          setStudentCourses(sample.studentCourses);
          setSkillsCerts(sample.skillsCerts);
          setJobApplications(sample.jobApplications);
          setKnowledgeItems(sample.knowledgeItems);
          setExpenses(sample.expenses);
          setSavingsGoals(sample.savingsGoals);
          setWishlist(sample.wishlist);
          setSubscriptions(sample.subscriptions);
          setWorkouts(sample.workouts);
          setWellnessLogs(sample.wellnessLogs);
          setReadingBooks(sample.readingBooks);
          setTripPlans(sample.tripPlans);
          setMealPlans(sample.mealPlans);
          setHouseholdChores(sample.householdChores);
          setVaultDocuments(sample.vaultDocuments);
          setDecisionItems(sample.decisionItems);
          setReviewRecords(sample.reviewRecords);
        } else {
          setTasks(savedTasks);
          setEvents(savedEvents);
          setBirthdays(savedBirthdays);
          setHabits(savedHabits);
          setHabitCheckins(savedCheckins);
          setNotes(savedNotes);
          setFocusSessions(savedSessions);
          setGoals(savedGoals);
          setBucketList(savedBucket);
          setTimelineMemories(savedMemories);
          setSpecialDates(savedSpecialDates);
          setStudentCourses(savedCourses);
          setSkillsCerts(savedSkills);
          setJobApplications(savedJobs);
          setKnowledgeItems(savedKnowledge);
          setExpenses(savedExpenses);
          setSavingsGoals(savedSavings);
          setWishlist(savedWishlist);
          setSubscriptions(savedSubs);
          setWorkouts(savedWorkouts);
          setWellnessLogs(savedWellness);
          setReadingBooks(savedBooks);
          setTripPlans(savedTrips);
          setMealPlans(savedMeals);
          setHouseholdChores(savedChores);
          setVaultDocuments(savedVault);
          setDecisionItems(savedDecisions);
          setReviewRecords(savedReviews);
        }

        setNotifications(savedNotifs);
        if (savedSettingsRecord && savedSettingsRecord.value) {
          setSettings((prev) => ({ ...prev, ...savedSettingsRecord.value }));
        }
      } catch (err) {
        console.error('Error initializing DayFlow data:', err);
        if (isMounted) {
          setStorageError(
            'Unable to connect to local browser storage (IndexedDB). Data may not persist if browser is in extreme privacy mode.'
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initializeData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Persist due reminders so the notification panel has a useful history as well as live alerts.
  useEffect(() => {
    if (isLoading) return;

    notifications.forEach((notification) => processedReminderIdsRef.current.add(notification.id));

    const createDueReminders = () => {
      const today = getTodayDateString();
      const dueReminders: AppNotification[] = [
        ...tasks
          .filter((task) => task.reminder && task.status !== 'completed' && task.dueDate === today)
          .map((task) => ({
            id: `task-reminder:${task.id}:${task.dueDate}`,
            title: 'Task due today',
            message: task.title,
            type: 'task' as const,
            timestamp: new Date().toISOString(),
            read: false,
            linkView: 'tasks' as const,
            entityId: task.id,
          })),
        ...events
          .filter((event) => event.reminder && event.date === today)
          .map((event) => ({
            id: `event-reminder:${event.id}:${event.date}`,
            title: 'Event scheduled today',
            message: `${event.startTime ? `${event.startTime} · ` : ''}${event.title}`,
            type: 'event' as const,
            timestamp: new Date().toISOString(),
            read: false,
            linkView: 'calendar' as const,
            entityId: event.id,
          })),
        ...birthdays
          .filter((birthday) => {
            const reminderDays: Record<string, number> = {
              day_of: 0,
              '1_day_before': 1,
              '3_days_before': 3,
              '1_week_before': 7,
            };
            const daysBefore = reminderDays[birthday.reminder];
            return daysBefore !== undefined && calculateBirthdayInfo(birthday).daysUntil === daysBefore;
          })
          .map((birthday) => {
            const info = calculateBirthdayInfo(birthday);
            return {
              id: `birthday-reminder:${birthday.id}:${today}`,
              title: info.isToday ? 'Birthday today' : 'Upcoming birthday',
              message: `${birthday.name}: ${info.displayText}`,
              type: 'birthday' as const,
              timestamp: new Date().toISOString(),
              read: false,
              linkView: 'birthdays' as const,
              entityId: birthday.id,
            };
          }),
      ];

      dueReminders.forEach((notification) => {
        if (processedReminderIdsRef.current.has(notification.id)) return;
        processedReminderIdsRef.current.add(notification.id);

        db.put(STORES.NOTIFICATIONS, notification)
          .then(() => {
            setNotifications((previous) =>
              [notification, ...previous].sort((a, b) => b.timestamp.localeCompare(a.timestamp))
            );
            if (
              settings.browserNotifications &&
              'Notification' in window &&
              Notification.permission === 'granted'
            ) {
              new Notification(notification.title, { body: notification.message, icon: '/favicon.ico' });
            }
          })
          .catch((error) => {
            processedReminderIdsRef.current.delete(notification.id);
            console.error('Unable to save reminder notification:', error);
          });
      });
    };

    createDueReminders();
    const interval = window.setInterval(createDueReminders, 60_000);
    return () => window.clearInterval(interval);
  }, [isLoading, tasks, events, birthdays, notifications, settings.browserNotifications]);

  // Ambient sound controller
  useEffect(() => {
    if (ambientSound === 'none') {
      soundService.stopAmbient();
    } else {
      soundService.startAmbient(ambientSound);
    }
    return () => {
      soundService.stopAmbient();
    };
  }, [ambientSound]);

  // Pomodoro interval drift-proof timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isTimerRunning) {
      if (!timerEndTimeRef.current) {
        timerEndTimeRef.current = Date.now() + timeLeft * 1000;
      }

      interval = setInterval(() => {
        if (!timerEndTimeRef.current) return;
        const remaining = Math.round((timerEndTimeRef.current - Date.now()) / 1000);

        if (remaining <= 0) {
          setTimeLeft(0);
          setIsTimerRunning(false);
          timerEndTimeRef.current = null;

          if (settings.soundEnabled) {
            soundService.playChime(timerMode === 'focus' ? 'complete' : 'break');
          }
          triggerCelebration();

          const duration =
            timerMode === 'focus'
              ? settings.pomodoro.focusDuration
              : timerMode === 'short_break'
              ? settings.pomodoro.shortBreak
              : settings.pomodoro.longBreak;

          const linkedTask = tasks.find((t) => t.id === linkedTaskId);

          const newSession: FocusSession = {
            id: `focus-${Date.now()}`,
            duration,
            type: timerMode,
            completed: true,
            taskId: linkedTaskId || undefined,
            taskTitle: linkedTask ? linkedTask.title : undefined,
            timestamp: new Date().toISOString(),
          };

          db.put(STORES.FOCUS_SESSIONS, newSession).catch(() => {});
          setFocusSessions((prev) => [newSession, ...prev]);

          if (settings.browserNotifications && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('DayFlow Focus Session Finished! ⏱️', {
              body:
                timerMode === 'focus'
                  ? 'Great focus session completed! Time for a refreshing break.'
                  : 'Break completed. Ready to get back into flow?',
              icon: '/favicon.ico',
            });
          }

          if (timerMode === 'focus') {
            setTimerMode('short_break');
            setTimeLeft(settings.pomodoro.shortBreak * 60);
          } else {
            setTimerMode('focus');
            setTimeLeft(settings.pomodoro.focusDuration * 60);
          }
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);
    } else {
      timerEndTimeRef.current = null;
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerMode, settings, linkedTaskId, tasks]);

  // Pomodoro timer document title
  useEffect(() => {
    if (isTimerRunning) {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      document.title = `(${formatted}) DayFlow Focus`;
    } else {
      document.title = 'DayFlow – Personal Productivity & Life Management';
    }
  }, [isTimerRunning, timeLeft]);

  // Timer controls
  const startTimer = useCallback(() => {
    timerEndTimeRef.current = Date.now() + timeLeft * 1000;
    setIsTimerRunning(true);
    if (settings.soundEnabled) {
      soundService.playChime('start');
    }
  }, [timeLeft, settings.soundEnabled]);

  const pauseTimer = useCallback(() => {
    setIsTimerRunning(false);
    timerEndTimeRef.current = null;
  }, []);

  const resetTimer = useCallback(() => {
    setIsTimerRunning(false);
    timerEndTimeRef.current = null;
    const duration =
      timerMode === 'focus'
        ? settings.pomodoro.focusDuration
        : timerMode === 'short_break'
        ? settings.pomodoro.shortBreak
        : settings.pomodoro.longBreak;
    setTimeLeft(duration * 60);
  }, [timerMode, settings.pomodoro]);

  const skipTimer = useCallback(() => {
    pauseTimer();
    if (timerMode === 'focus') {
      setTimerMode('short_break');
      setTimeLeft(settings.pomodoro.shortBreak * 60);
    } else {
      setTimerMode('focus');
      setTimeLeft(settings.pomodoro.focusDuration * 60);
    }
  }, [pauseTimer, timerMode, settings.pomodoro]);

  const changeTimerMode = useCallback(
    (mode: FocusSessionType) => {
      pauseTimer();
      setTimerMode(mode);
      const duration =
        mode === 'focus'
          ? settings.pomodoro.focusDuration
          : mode === 'short_break'
          ? settings.pomodoro.shortBreak
          : settings.pomodoro.longBreak;
      setTimeLeft(duration * 60);
    },
    [pauseTimer, settings.pomodoro]
  );

  // Generic generic entity generator helper
  const createEntity = <T extends { id: string }>(data: any, prefix: string): T => ({
    ...data,
    id: `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  });

  // Base Tasks CRUD
  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt'>): Promise<Task> => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    await db.put(STORES.TASKS, newTask);
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  }, []);

  const updateTask = useCallback(async (updated: Task): Promise<void> => {
    await db.put(STORES.TASKS, updated);
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }, []);

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    await db.delete(STORES.TASKS, id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleTaskComplete = useCallback(
    async (id: string): Promise<void> => {
      const target = tasks.find((t) => t.id === id);
      if (!target) return;

      const isNowCompleted = target.status !== 'completed';
      const updated: Task = {
        ...target,
        status: isNowCompleted ? 'completed' : 'todo',
        completedAt: isNowCompleted ? new Date().toISOString() : undefined,
      };

      await db.put(STORES.TASKS, updated);

      if (isNowCompleted) {
        triggerCelebration();
        if (target.recurrence && target.recurrence !== 'none') {
          const nextDueDate = getNextRecurringDate(target.dueDate, target.recurrence);
          const nextTask: Task = {
            ...target,
            id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            dueDate: nextDueDate,
            status: 'todo',
            completedAt: undefined,
            createdAt: new Date().toISOString(),
            subtasks: target.subtasks.map((s) => ({ ...s, completed: false })),
          };
          await db.put(STORES.TASKS, nextTask);
          setTasks((prev) => [nextTask, ...prev.map((t) => (t.id === id ? updated : t))]);
          return;
        }
      }

      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    },
    [tasks]
  );

  const moveTaskStatus = useCallback(
    async (id: string, status: Task['status']): Promise<void> => {
      const target = tasks.find((t) => t.id === id);
      if (!target) return;
      const updated: Task = {
        ...target,
        status,
        completedAt: status === 'completed' ? new Date().toISOString() : undefined,
      };
      await db.put(STORES.TASKS, updated);
      if (status === 'completed') triggerCelebration();
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    },
    [tasks]
  );

  // Calendar Events CRUD
  const addEvent = useCallback(async (eventData: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> => {
    const newEvent: CalendarEvent = createEntity(eventData, 'event');
    await db.put(STORES.EVENTS, newEvent);
    setEvents((prev) => [...prev, newEvent]);
    return newEvent;
  }, []);

  const updateEvent = useCallback(async (updated: CalendarEvent): Promise<void> => {
    await db.put(STORES.EVENTS, updated);
    setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  }, []);

  const deleteEvent = useCallback(async (id: string): Promise<void> => {
    await db.delete(STORES.EVENTS, id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // Birthdays CRUD
  const addBirthday = useCallback(async (bdayData: Omit<Birthday, 'id'>): Promise<Birthday> => {
    const newBirthday: Birthday = createEntity(bdayData, 'bday');
    await db.put(STORES.BIRTHDAYS, newBirthday);
    setBirthdays((prev) => [...prev, newBirthday]);
    return newBirthday;
  }, []);

  const updateBirthday = useCallback(async (updated: Birthday): Promise<void> => {
    await db.put(STORES.BIRTHDAYS, updated);
    setBirthdays((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  }, []);

  const deleteBirthday = useCallback(async (id: string): Promise<void> => {
    await db.delete(STORES.BIRTHDAYS, id);
    setBirthdays((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // Habits CRUD
  const addHabit = useCallback(async (habitData: Omit<Habit, 'id' | 'createdAt'>): Promise<Habit> => {
    const newHabit: Habit = {
      ...habitData,
      id: `habit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    await db.put(STORES.HABITS, newHabit);
    setHabits((prev) => [...prev, newHabit]);
    return newHabit;
  }, []);

  const updateHabit = useCallback(async (updated: Habit): Promise<void> => {
    await db.put(STORES.HABITS, updated);
    setHabits((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
  }, []);

  const deleteHabit = useCallback(async (id: string): Promise<void> => {
    await db.delete(STORES.HABITS, id);
    setHabits((prev) => prev.filter((h) => h.id !== id));
    setHabitCheckins((prev) => prev.filter((c) => c.habitId !== id));
  }, []);

  const toggleHabitCheckin = useCallback(
    async (habitId: string, dateStr?: string): Promise<void> => {
      const targetDate = dateStr || getTodayDateString();
      const existing = habitCheckins.find((c) => c.habitId === habitId && c.date === targetDate);

      if (existing) {
        if (existing.completed) {
          await db.delete(STORES.HABIT_CHECKINS, existing.id);
          setHabitCheckins((prev) => prev.filter((c) => c.id !== existing.id));
        } else {
          const updated: HabitCheckin = { ...existing, completed: true };
          await db.put(STORES.HABIT_CHECKINS, updated);
          triggerCelebration();
          setHabitCheckins((prev) => prev.map((c) => (c.id === existing.id ? updated : c)));
        }
      } else {
        const newCheckin: HabitCheckin = {
          id: `checkin-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          habitId,
          date: targetDate,
          completed: true,
        };
        await db.put(STORES.HABIT_CHECKINS, newCheckin);
        triggerCelebration();
        setHabitCheckins((prev) => [...prev, newCheckin]);
      }
    },
    [habitCheckins]
  );

  // Notes CRUD
  const addNote = useCallback(async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> => {
    const nowStr = new Date().toISOString();
    const newNote: Note = {
      ...noteData,
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: nowStr,
      updatedAt: nowStr,
    };
    await db.put(STORES.NOTES, newNote);
    setNotes((prev) => [newNote, ...prev]);
    return newNote;
  }, []);

  const updateNote = useCallback(async (updated: Note): Promise<void> => {
    const toSave: Note = { ...updated, updatedAt: new Date().toISOString() };
    await db.put(STORES.NOTES, toSave);
    setNotes((prev) => prev.map((n) => (n.id === updated.id ? toSave : n)));
  }, []);

  const deleteNote = useCallback(async (id: string): Promise<void> => {
    await db.delete(STORES.NOTES, id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const togglePinNote = useCallback(async (id: string): Promise<void> => {
    setNotes((prev) => {
      const target = prev.find((n) => n.id === id);
      if (!target) return prev;
      const updated = { ...target, pinned: !target.pinned, updatedAt: new Date().toISOString() };
      db.put(STORES.NOTES, updated).catch(() => {});
      return prev.map((n) => (n.id === id ? updated : n));
    });
  }, []);

  // ---------------------------------------------------------------------------
  // EXPANSION MODULES CRUD
  // ---------------------------------------------------------------------------

  // Goals
  const addGoal = useCallback(async (goalData: Omit<LifeGoal, 'id'>): Promise<LifeGoal> => {
    const item: LifeGoal = createEntity(goalData, 'goal');
    await db.put(STORES.GOALS, item);
    setGoals((prev) => [item, ...prev]);
    return item;
  }, []);
  const updateGoal = useCallback(async (updated: LifeGoal) => {
    await db.put(STORES.GOALS, updated);
    setGoals((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
  }, []);
  const deleteGoal = useCallback(async (id: string) => {
    await db.delete(STORES.GOALS, id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  // Bucket List
  const addBucketItem = useCallback(async (data: Omit<BucketListItem, 'id'>): Promise<BucketListItem> => {
    const item: BucketListItem = createEntity(data, 'bucket');
    await db.put(STORES.BUCKET_LIST, item);
    setBucketList((prev) => [item, ...prev]);
    return item;
  }, []);
  const updateBucketItem = useCallback(async (updated: BucketListItem) => {
    await db.put(STORES.BUCKET_LIST, updated);
    setBucketList((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  }, []);
  const deleteBucketItem = useCallback(async (id: string) => {
    await db.delete(STORES.BUCKET_LIST, id);
    setBucketList((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // Memories
  const addMemory = useCallback(async (data: Omit<TimelineMemory, 'id'>): Promise<TimelineMemory> => {
    const item: TimelineMemory = createEntity(data, 'mem');
    await db.put(STORES.TIMELINE_MEMORIES, item);
    setTimelineMemories((prev) => [item, ...prev]);
    return item;
  }, []);
  const updateMemory = useCallback(async (updated: TimelineMemory) => {
    await db.put(STORES.TIMELINE_MEMORIES, updated);
    setTimelineMemories((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  }, []);
  const deleteMemory = useCallback(async (id: string) => {
    await db.delete(STORES.TIMELINE_MEMORIES, id);
    setTimelineMemories((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // Special Dates
  const addSpecialDate = useCallback(async (data: Omit<SpecialDate, 'id'>): Promise<SpecialDate> => {
    const item: SpecialDate = createEntity(data, 'sd');
    await db.put(STORES.SPECIAL_DATES, item);
    setSpecialDates((prev) => [...prev, item]);
    return item;
  }, []);
  const updateSpecialDate = useCallback(async (updated: SpecialDate) => {
    await db.put(STORES.SPECIAL_DATES, updated);
    setSpecialDates((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  }, []);
  const deleteSpecialDate = useCallback(async (id: string) => {
    await db.delete(STORES.SPECIAL_DATES, id);
    setSpecialDates((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Student Courses
  const addCourse = useCallback(async (data: Omit<StudentCourse, 'id'>): Promise<StudentCourse> => {
    const item: StudentCourse = createEntity(data, 'course');
    await db.put(STORES.STUDENT_COURSES, item);
    setStudentCourses((prev) => [...prev, item]);
    return item;
  }, []);
  const updateCourse = useCallback(async (updated: StudentCourse) => {
    await db.put(STORES.STUDENT_COURSES, updated);
    setStudentCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }, []);
  const deleteCourse = useCallback(async (id: string) => {
    await db.delete(STORES.STUDENT_COURSES, id);
    setStudentCourses((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // Skills & Certs
  const addSkillCert = useCallback(async (data: Omit<SkillCert, 'id'>): Promise<SkillCert> => {
    const item: SkillCert = createEntity(data, 'sc');
    await db.put(STORES.SKILLS_CERTS, item);
    setSkillsCerts((prev) => [...prev, item]);
    return item;
  }, []);
  const updateSkillCert = useCallback(async (updated: SkillCert) => {
    await db.put(STORES.SKILLS_CERTS, updated);
    setSkillsCerts((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  }, []);
  const deleteSkillCert = useCallback(async (id: string) => {
    await db.delete(STORES.SKILLS_CERTS, id);
    setSkillsCerts((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Job Applications
  const addJob = useCallback(async (data: Omit<JobApplication, 'id'>): Promise<JobApplication> => {
    const item: JobApplication = createEntity(data, 'job');
    await db.put(STORES.JOB_APPLICATIONS, item);
    setJobApplications((prev) => [item, ...prev]);
    return item;
  }, []);
  const updateJob = useCallback(async (updated: JobApplication) => {
    await db.put(STORES.JOB_APPLICATIONS, updated);
    setJobApplications((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
  }, []);
  const deleteJob = useCallback(async (id: string) => {
    await db.delete(STORES.JOB_APPLICATIONS, id);
    setJobApplications((prev) => prev.filter((j) => j.id !== id));
  }, []);
  const updateJobStatus = useCallback(async (id: string, status: JobStatus) => {
    setJobApplications((prev) => {
      const target = prev.find((j) => j.id === id);
      if (!target) return prev;
      const updated = { ...target, status };
      db.put(STORES.JOB_APPLICATIONS, updated).catch(() => {});
      return prev.map((j) => (j.id === id ? updated : j));
    });
  }, []);

  // Knowledge Items
  const addKnowledge = useCallback(async (data: Omit<KnowledgeItem, 'id' | 'createdAt'>): Promise<KnowledgeItem> => {
    const item: KnowledgeItem = {
      ...data,
      id: `kn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    await db.put(STORES.KNOWLEDGE_ITEMS, item);
    setKnowledgeItems((prev) => [item, ...prev]);
    return item;
  }, []);
  const updateKnowledge = useCallback(async (updated: KnowledgeItem) => {
    await db.put(STORES.KNOWLEDGE_ITEMS, updated);
    setKnowledgeItems((prev) => prev.map((k) => (k.id === updated.id ? updated : k)));
  }, []);
  const deleteKnowledge = useCallback(async (id: string) => {
    await db.delete(STORES.KNOWLEDGE_ITEMS, id);
    setKnowledgeItems((prev) => prev.filter((k) => k.id !== id));
  }, []);

  // Expenses & Budget
  const addExpense = useCallback(async (data: Omit<ExpenseTransaction, 'id'>): Promise<ExpenseTransaction> => {
    const item: ExpenseTransaction = createEntity(data, 'exp');
    await db.put(STORES.EXPENSES, item);
    setExpenses((prev) => [item, ...prev]);
    return item;
  }, []);
  const updateExpense = useCallback(async (updated: ExpenseTransaction) => {
    await db.put(STORES.EXPENSES, updated);
    setExpenses((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  }, []);
  const deleteExpense = useCallback(async (id: string) => {
    await db.delete(STORES.EXPENSES, id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // Savings Goals
  const addSavingsGoal = useCallback(async (data: Omit<SavingsGoal, 'id'>): Promise<SavingsGoal> => {
    const item: SavingsGoal = createEntity(data, 'sav');
    await db.put(STORES.SAVINGS_GOALS, item);
    setSavingsGoals((prev) => [...prev, item]);
    return item;
  }, []);
  const updateSavingsGoal = useCallback(async (updated: SavingsGoal) => {
    await db.put(STORES.SAVINGS_GOALS, updated);
    setSavingsGoals((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  }, []);
  const deleteSavingsGoal = useCallback(async (id: string) => {
    await db.delete(STORES.SAVINGS_GOALS, id);
    setSavingsGoals((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Wishlist
  const addWishlistItem = useCallback(async (data: Omit<WishlistItem, 'id'>): Promise<WishlistItem> => {
    const item: WishlistItem = createEntity(data, 'wish');
    await db.put(STORES.WISHLIST, item);
    setWishlist((prev) => [item, ...prev]);
    return item;
  }, []);
  const updateWishlistItem = useCallback(async (updated: WishlistItem) => {
    await db.put(STORES.WISHLIST, updated);
    setWishlist((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
  }, []);
  const deleteWishlistItem = useCallback(async (id: string) => {
    await db.delete(STORES.WISHLIST, id);
    setWishlist((prev) => prev.filter((w) => w.id !== id));
  }, []);

  // Subscriptions
  const addSubscription = useCallback(async (data: Omit<Subscription, 'id'>): Promise<Subscription> => {
    const item: Subscription = createEntity(data, 'sub');
    await db.put(STORES.SUBSCRIPTIONS, item);
    setSubscriptions((prev) => [...prev, item]);
    return item;
  }, []);
  const updateSubscription = useCallback(async (updated: Subscription) => {
    await db.put(STORES.SUBSCRIPTIONS, updated);
    setSubscriptions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  }, []);
  const deleteSubscription = useCallback(async (id: string) => {
    await db.delete(STORES.SUBSCRIPTIONS, id);
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Workouts
  const addWorkout = useCallback(async (data: Omit<WorkoutLog, 'id'>): Promise<WorkoutLog> => {
    const item: WorkoutLog = createEntity(data, 'wo');
    await db.put(STORES.WORKOUTS, item);
    setWorkouts((prev) => [item, ...prev]);
    return item;
  }, []);
  const updateWorkout = useCallback(async (updated: WorkoutLog) => {
    await db.put(STORES.WORKOUTS, updated);
    setWorkouts((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
  }, []);
  const deleteWorkout = useCallback(async (id: string) => {
    await db.delete(STORES.WORKOUTS, id);
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  }, []);

  // Wellness Logs
  const addWellnessLog = useCallback(async (data: Omit<WellnessLog, 'id'>): Promise<WellnessLog> => {
    const item: WellnessLog = createEntity(data, 'well');
    await db.put(STORES.WELLNESS_LOGS, item);
    setWellnessLogs((prev) => [item, ...prev]);
    return item;
  }, []);
  const updateWellnessLog = useCallback(async (updated: WellnessLog) => {
    await db.put(STORES.WELLNESS_LOGS, updated);
    setWellnessLogs((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
  }, []);
  const deleteWellnessLog = useCallback(async (id: string) => {
    await db.delete(STORES.WELLNESS_LOGS, id);
    setWellnessLogs((prev) => prev.filter((w) => w.id !== id));
  }, []);

  // Reading Books
  const addBook = useCallback(async (data: Omit<ReadingBook, 'id'>): Promise<ReadingBook> => {
    const item: ReadingBook = createEntity(data, 'book');
    await db.put(STORES.READING_BOOKS, item);
    setReadingBooks((prev) => [item, ...prev]);
    return item;
  }, []);
  const updateBook = useCallback(async (updated: ReadingBook) => {
    await db.put(STORES.READING_BOOKS, updated);
    setReadingBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  }, []);
  const deleteBook = useCallback(async (id: string) => {
    await db.delete(STORES.READING_BOOKS, id);
    setReadingBooks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // Trip Plans
  const addTrip = useCallback(async (data: Omit<TripPlan, 'id'>): Promise<TripPlan> => {
    const item: TripPlan = createEntity(data, 'trip');
    await db.put(STORES.TRIP_PLANS, item);
    setTripPlans((prev) => [item, ...prev]);
    return item;
  }, []);
  const updateTrip = useCallback(async (updated: TripPlan) => {
    await db.put(STORES.TRIP_PLANS, updated);
    setTripPlans((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }, []);
  const deleteTrip = useCallback(async (id: string) => {
    await db.delete(STORES.TRIP_PLANS, id);
    setTripPlans((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Meal Plans
  const addMeal = useCallback(async (data: Omit<MealPlanItem, 'id'>): Promise<MealPlanItem> => {
    const item: MealPlanItem = createEntity(data, 'meal');
    await db.put(STORES.MEAL_PLANS, item);
    setMealPlans((prev) => [...prev, item]);
    return item;
  }, []);
  const updateMeal = useCallback(async (updated: MealPlanItem) => {
    await db.put(STORES.MEAL_PLANS, updated);
    setMealPlans((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  }, []);
  const deleteMeal = useCallback(async (id: string) => {
    await db.delete(STORES.MEAL_PLANS, id);
    setMealPlans((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // Household Chores
  const addChore = useCallback(async (data: Omit<HouseholdChore, 'id'>): Promise<HouseholdChore> => {
    const item: HouseholdChore = createEntity(data, 'chore');
    await db.put(STORES.HOUSEHOLD_CHORES, item);
    setHouseholdChores((prev) => [...prev, item]);
    return item;
  }, []);
  const updateChore = useCallback(async (updated: HouseholdChore) => {
    await db.put(STORES.HOUSEHOLD_CHORES, updated);
    setHouseholdChores((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }, []);
  const deleteChore = useCallback(async (id: string) => {
    await db.delete(STORES.HOUSEHOLD_CHORES, id);
    setHouseholdChores((prev) => prev.filter((c) => c.id !== id));
  }, []);
  const toggleChoreDone = useCallback(async (id: string) => {
    setHouseholdChores((prev) => {
      const target = prev.find((c) => c.id === id);
      if (!target) return prev;
      const today = getTodayDateString();
      const updated: HouseholdChore = {
        ...target,
        lastCompleted: today,
        nextDue: getNextRecurringDate(today, target.frequency === 'daily' ? 'daily' : target.frequency === 'weekly' ? 'weekly' : 'monthly'),
      };
      db.put(STORES.HOUSEHOLD_CHORES, updated).catch(() => {});
      triggerCelebration();
      return prev.map((c) => (c.id === id ? updated : c));
    });
  }, []);

  // Vault Documents
  const addVaultDoc = useCallback(async (data: Omit<VaultDocument, 'id'>): Promise<VaultDocument> => {
    const item: VaultDocument = createEntity(data, 'doc');
    await db.put(STORES.VAULT_DOCUMENTS, item);
    setVaultDocuments((prev) => [item, ...prev]);
    return item;
  }, []);
  const updateVaultDoc = useCallback(async (updated: VaultDocument) => {
    await db.put(STORES.VAULT_DOCUMENTS, updated);
    setVaultDocuments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  }, []);
  const deleteVaultDoc = useCallback(async (id: string) => {
    await db.delete(STORES.VAULT_DOCUMENTS, id);
    setVaultDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  // Decision Items
  const addDecision = useCallback(async (data: Omit<DecisionItem, 'id'>): Promise<DecisionItem> => {
    const item: DecisionItem = createEntity(data, 'dec');
    await db.put(STORES.DECISION_ITEMS, item);
    setDecisionItems((prev) => [item, ...prev]);
    return item;
  }, []);
  const updateDecision = useCallback(async (updated: DecisionItem) => {
    await db.put(STORES.DECISION_ITEMS, updated);
    setDecisionItems((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  }, []);
  const deleteDecision = useCallback(async (id: string) => {
    await db.delete(STORES.DECISION_ITEMS, id);
    setDecisionItems((prev) => prev.filter((d) => d.id !== id));
  }, []);

  // Review Records
  const addReview = useCallback(async (data: Omit<ReviewRecord, 'id'>): Promise<ReviewRecord> => {
    const item: ReviewRecord = createEntity(data, 'rev');
    await db.put(STORES.REVIEW_RECORDS, item);
    setReviewRecords((prev) => [item, ...prev]);
    return item;
  }, []);
  const updateReview = useCallback(async (updated: ReviewRecord) => {
    await db.put(STORES.REVIEW_RECORDS, updated);
    setReviewRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }, []);
  const deleteReview = useCallback(async (id: string) => {
    await db.delete(STORES.REVIEW_RECORDS, id);
    setReviewRecords((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // Routines & Preferences
  const toggleMorningRoutineItem = useCallback(async (id: string) => {
    const updated = settings.morningRoutine.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    await updateSettings({ morningRoutine: updated });
    triggerCelebration();
  }, [settings.morningRoutine, updateSettings]);

  const toggleEveningRoutineItem = useCallback(async (id: string) => {
    const updated = settings.eveningRoutine.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    await updateSettings({ eveningRoutine: updated });
    triggerCelebration();
  }, [settings.eveningRoutine, updateSettings]);

  const toggleModuleEnabled = useCallback(async (moduleKey: string) => {
    const current = settings.enabledModules[moduleKey] !== false;
    const updated = { ...settings.enabledModules, [moduleKey]: !current };
    await updateSettings({ enabledModules: updated });
  }, [settings.enabledModules, updateSettings]);

  // Notifications
  const markNotificationRead = useCallback(async (id: string) => {
    const target = notifications.find((n) => n.id === id);
    if (!target) return;
    const updated = { ...target, read: true };
    await db.put(STORES.NOTIFICATIONS, updated);
    setNotifications((prev) => prev.map((n) => (n.id === id ? updated : n)));
  }, [notifications]);

  const markAllNotificationsRead = useCallback(async () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    await db.putMany(STORES.NOTIFICATIONS, updated);
    setNotifications(updated);
  }, [notifications]);

  const clearNotifications = useCallback(async () => {
    await db.clear(STORES.NOTIFICATIONS);
    setNotifications([]);
  }, []);

  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;
    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      await updateSettings({ browserNotifications: granted });
      return granted;
    } catch {
      return false;
    }
  }, [updateSettings]);

  // Demo data and Backup operations
  const loadSampleData = useCallback(async () => {
    const sample = generateSampleData();
    await Promise.all([
      db.putMany(STORES.TASKS, sample.tasks),
      db.putMany(STORES.EVENTS, sample.events),
      db.putMany(STORES.BIRTHDAYS, sample.birthdays),
      db.putMany(STORES.HABITS, sample.habits),
      db.putMany(STORES.HABIT_CHECKINS, sample.habitCheckins),
      db.putMany(STORES.NOTES, sample.notes),
      db.putMany(STORES.FOCUS_SESSIONS, sample.focusSessions),
      db.putMany(STORES.GOALS, sample.goals),
      db.putMany(STORES.BUCKET_LIST, sample.bucketList),
      db.putMany(STORES.TIMELINE_MEMORIES, sample.timelineMemories),
      db.putMany(STORES.SPECIAL_DATES, sample.specialDates),
      db.putMany(STORES.STUDENT_COURSES, sample.studentCourses),
      db.putMany(STORES.SKILLS_CERTS, sample.skillsCerts),
      db.putMany(STORES.JOB_APPLICATIONS, sample.jobApplications),
      db.putMany(STORES.KNOWLEDGE_ITEMS, sample.knowledgeItems),
      db.putMany(STORES.EXPENSES, sample.expenses),
      db.putMany(STORES.SAVINGS_GOALS, sample.savingsGoals),
      db.putMany(STORES.WISHLIST, sample.wishlist),
      db.putMany(STORES.SUBSCRIPTIONS, sample.subscriptions),
      db.putMany(STORES.WORKOUTS, sample.workouts),
      db.putMany(STORES.WELLNESS_LOGS, sample.wellnessLogs),
      db.putMany(STORES.READING_BOOKS, sample.readingBooks),
      db.putMany(STORES.TRIP_PLANS, sample.tripPlans),
      db.putMany(STORES.MEAL_PLANS, sample.mealPlans),
      db.putMany(STORES.HOUSEHOLD_CHORES, sample.householdChores),
      db.putMany(STORES.VAULT_DOCUMENTS, sample.vaultDocuments),
      db.putMany(STORES.DECISION_ITEMS, sample.decisionItems),
      db.putMany(STORES.REVIEW_RECORDS, sample.reviewRecords),
    ]);

    setTasks(sample.tasks);
    setEvents(sample.events);
    setBirthdays(sample.birthdays);
    setHabits(sample.habits);
    setHabitCheckins(sample.habitCheckins);
    setNotes(sample.notes);
    setFocusSessions(sample.focusSessions);
    setGoals(sample.goals);
    setBucketList(sample.bucketList);
    setTimelineMemories(sample.timelineMemories);
    setSpecialDates(sample.specialDates);
    setStudentCourses(sample.studentCourses);
    setSkillsCerts(sample.skillsCerts);
    setJobApplications(sample.jobApplications);
    setKnowledgeItems(sample.knowledgeItems);
    setExpenses(sample.expenses);
    setSavingsGoals(sample.savingsGoals);
    setWishlist(sample.wishlist);
    setSubscriptions(sample.subscriptions);
    setWorkouts(sample.workouts);
    setWellnessLogs(sample.wellnessLogs);
    setReadingBooks(sample.readingBooks);
    setTripPlans(sample.tripPlans);
    setMealPlans(sample.mealPlans);
    setHouseholdChores(sample.householdChores);
    setVaultDocuments(sample.vaultDocuments);
    setDecisionItems(sample.decisionItems);
    setReviewRecords(sample.reviewRecords);
  }, []);

  const purgeDemoData = useCallback(async () => {
    const stats = await db.purgeDemoData();
    // Filter local memory states
    setTasks((p) => p.filter((x) => !x.isDemo));
    setEvents((p) => p.filter((x) => !x.isDemo));
    setBirthdays((p) => p.filter((x) => !x.isDemo));
    setHabits((p) => p.filter((x) => !x.isDemo));
    setNotes((p) => p.filter((x) => !x.isDemo));
    setGoals((p) => p.filter((x) => !x.isDemo));
    setBucketList((p) => p.filter((x) => !x.isDemo));
    setTimelineMemories((p) => p.filter((x) => !x.isDemo));
    setSpecialDates((p) => p.filter((x) => !x.isDemo));
    setStudentCourses((p) => p.filter((x) => !x.isDemo));
    setSkillsCerts((p) => p.filter((x) => !x.isDemo));
    setJobApplications((p) => p.filter((x) => !x.isDemo));
    setKnowledgeItems((p) => p.filter((x) => !x.isDemo));
    setExpenses((p) => p.filter((x) => !x.isDemo));
    setSavingsGoals((p) => p.filter((x) => !x.isDemo));
    setWishlist((p) => p.filter((x) => !x.isDemo));
    setSubscriptions((p) => p.filter((x) => !x.isDemo));
    setWorkouts((p) => p.filter((x) => !x.isDemo));
    setWellnessLogs((p) => p.filter((x) => !x.isDemo));
    setReadingBooks((p) => p.filter((x) => !x.isDemo));
    setTripPlans((p) => p.filter((x) => !x.isDemo));
    setMealPlans((p) => p.filter((x) => !x.isDemo));
    setHouseholdChores((p) => p.filter((x) => !x.isDemo));
    setVaultDocuments((p) => p.filter((x) => !x.isDemo));
    setDecisionItems((p) => p.filter((x) => !x.isDemo));
    setReviewRecords((p) => p.filter((x) => !x.isDemo));
    return stats;
  }, []);

  const resetAllData = useCallback(async () => {
    await db.clearAllData();
    setTasks([]);
    setEvents([]);
    setBirthdays([]);
    setHabits([]);
    setHabitCheckins([]);
    setNotes([]);
    setFocusSessions([]);
    setNotifications([]);
    setGoals([]);
    setBucketList([]);
    setTimelineMemories([]);
    setSpecialDates([]);
    setStudentCourses([]);
    setSkillsCerts([]);
    setJobApplications([]);
    setKnowledgeItems([]);
    setExpenses([]);
    setSavingsGoals([]);
    setWishlist([]);
    setSubscriptions([]);
    setWorkouts([]);
    setWellnessLogs([]);
    setReadingBooks([]);
    setTripPlans([]);
    setMealPlans([]);
    setHouseholdChores([]);
    setVaultDocuments([]);
    setDecisionItems([]);
    setReviewRecords([]);
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem('dayflow_settings');
    } catch {}
  }, []);

  const exportBackup = useCallback(async (): Promise<BackupData> => {
    return await db.exportFullBackup(settings);
  }, [settings]);

  const importBackup = useCallback(
    async (backup: BackupData, mode: 'replace' | 'merge' = 'replace') => {
      await db.restoreFullBackup(backup, mode);
      const [
        t, e, b, h, hc, n, f, notifs,
        g, bl, tm, sd, sc, sk, ja, ki, exp, sav, wish, sub, wo, wel, rb, tp, mp, hcCh, vd, di, rev
      ] = await Promise.all([
        db.getAll<Task>(STORES.TASKS),
        db.getAll<CalendarEvent>(STORES.EVENTS),
        db.getAll<Birthday>(STORES.BIRTHDAYS),
        db.getAll<Habit>(STORES.HABITS),
        db.getAll<HabitCheckin>(STORES.HABIT_CHECKINS),
        db.getAll<Note>(STORES.NOTES),
        db.getAll<FocusSession>(STORES.FOCUS_SESSIONS),
        db.getAll<AppNotification>(STORES.NOTIFICATIONS),
        db.getAll<LifeGoal>(STORES.GOALS),
        db.getAll<BucketListItem>(STORES.BUCKET_LIST),
        db.getAll<TimelineMemory>(STORES.TIMELINE_MEMORIES),
        db.getAll<SpecialDate>(STORES.SPECIAL_DATES),
        db.getAll<StudentCourse>(STORES.STUDENT_COURSES),
        db.getAll<SkillCert>(STORES.SKILLS_CERTS),
        db.getAll<JobApplication>(STORES.JOB_APPLICATIONS),
        db.getAll<KnowledgeItem>(STORES.KNOWLEDGE_ITEMS),
        db.getAll<ExpenseTransaction>(STORES.EXPENSES),
        db.getAll<SavingsGoal>(STORES.SAVINGS_GOALS),
        db.getAll<WishlistItem>(STORES.WISHLIST),
        db.getAll<Subscription>(STORES.SUBSCRIPTIONS),
        db.getAll<WorkoutLog>(STORES.WORKOUTS),
        db.getAll<WellnessLog>(STORES.WELLNESS_LOGS),
        db.getAll<ReadingBook>(STORES.READING_BOOKS),
        db.getAll<TripPlan>(STORES.TRIP_PLANS),
        db.getAll<MealPlanItem>(STORES.MEAL_PLANS),
        db.getAll<HouseholdChore>(STORES.HOUSEHOLD_CHORES),
        db.getAll<VaultDocument>(STORES.VAULT_DOCUMENTS),
        db.getAll<DecisionItem>(STORES.DECISION_ITEMS),
        db.getAll<ReviewRecord>(STORES.REVIEW_RECORDS),
      ]);

      setTasks(t);
      setEvents(e);
      setBirthdays(b);
      setHabits(h);
      setHabitCheckins(hc);
      setNotes(n);
      setFocusSessions(f);
      setNotifications(notifs);
      setGoals(g);
      setBucketList(bl);
      setTimelineMemories(tm);
      setSpecialDates(sd);
      setStudentCourses(sc);
      setSkillsCerts(sk);
      setJobApplications(ja);
      setKnowledgeItems(ki);
      setExpenses(exp);
      setSavingsGoals(sav);
      setWishlist(wish);
      setSubscriptions(sub);
      setWorkouts(wo);
      setWellnessLogs(wel);
      setReadingBooks(rb);
      setTripPlans(tp);
      setMealPlans(mp);
      setHouseholdChores(hcCh);
      setVaultDocuments(vd);
      setDecisionItems(di);
      setReviewRecords(rev);

      if (backup.settings) {
        await updateSettings(backup.settings);
      }
    },
    [updateSettings]
  );

  return (
    <AppContext.Provider
      value={{
        tasks,
        events,
        birthdays,
        habits,
        habitCheckins,
        notes,
        focusSessions,
        notifications,
        settings,
        isLoading,
        storageError,
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
        activeView,
        setActiveView,
        sidebarCollapsed,
        setSidebarCollapsed,
        isSearchOpen,
        setIsSearchOpen,
        isQuickAddOpen,
        setIsQuickAddOpen,
        quickAddTab,
        openQuickAddWithTab,
        editingTask,
        setEditingTask,
        editingEvent,
        setEditingEvent,
        editingBirthday,
        setEditingBirthday,
        editingHabit,
        setEditingHabit,
        editingNote,
        setEditingNote,
        timerMode,
        timeLeft,
        isTimerRunning,
        linkedTaskId,
        ambientSound,
        startTimer,
        pauseTimer,
        resetTimer,
        skipTimer,
        changeTimerMode,
        setLinkedTaskId,
        setAmbientSound,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        moveTaskStatus,
        addEvent,
        updateEvent,
        deleteEvent,
        addBirthday,
        updateBirthday,
        deleteBirthday,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleHabitCheckin,
        addNote,
        updateNote,
        deleteNote,
        togglePinNote,
        addGoal,
        updateGoal,
        deleteGoal,
        addBucketItem,
        updateBucketItem,
        deleteBucketItem,
        addMemory,
        updateMemory,
        deleteMemory,
        addSpecialDate,
        updateSpecialDate,
        deleteSpecialDate,
        addCourse,
        updateCourse,
        deleteCourse,
        addSkillCert,
        updateSkillCert,
        deleteSkillCert,
        addJob,
        updateJob,
        deleteJob,
        updateJobStatus,
        addKnowledge,
        updateKnowledge,
        deleteKnowledge,
        addExpense,
        updateExpense,
        deleteExpense,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        addWishlistItem,
        updateWishlistItem,
        deleteWishlistItem,
        addSubscription,
        updateSubscription,
        deleteSubscription,
        addWorkout,
        updateWorkout,
        deleteWorkout,
        addWellnessLog,
        updateWellnessLog,
        deleteWellnessLog,
        addBook,
        updateBook,
        deleteBook,
        addTrip,
        updateTrip,
        deleteTrip,
        addMeal,
        updateMeal,
        deleteMeal,
        addChore,
        updateChore,
        deleteChore,
        toggleChoreDone,
        addVaultDoc,
        updateVaultDoc,
        deleteVaultDoc,
        addDecision,
        updateDecision,
        deleteDecision,
        addReview,
        updateReview,
        deleteReview,
        toggleMorningRoutineItem,
        toggleEveningRoutineItem,
        toggleModuleEnabled,
        updateSettings,
        setThemeMode,
        setAccentColor,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        requestNotificationPermission,
        loadSampleData,
        purgeDemoData,
        resetAllData,
        exportBackup,
        importBackup,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
