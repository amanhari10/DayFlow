/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type RecurrencePattern = 'none' | 'daily' | 'weekly' | 'monthly' | 'weekdays' | 'yearly';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: Priority;
  status: TaskStatus;
  category: string;
  tags: string[];
  subtasks: Subtask[];
  notes?: string;
  recurrence: RecurrencePattern;
  reminder: boolean;
  createdAt: string;
  completedAt?: string;
  isDemo?: boolean;
}

export type EventCategory = 'work' | 'personal' | 'meeting' | 'health' | 'celebration' | 'hobby' | 'other';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  allDay: boolean;
  category: EventCategory;
  location?: string;
  reminder: boolean;
  recurrence: RecurrencePattern;
  isDemo?: boolean;
}

export type RelationshipType = 'family' | 'friend' | 'colleague' | 'partner' | 'other';
export type BirthdayReminderPref = 'day_of' | '1_day_before' | '3_days_before' | '1_week_before' | 'none';

export interface Birthday {
  id: string;
  name: string;
  birthdate: string; // YYYY-MM-DD or MM-DD
  birthYear?: number;
  relationship: RelationshipType;
  avatarColor: string;
  notes?: string;
  giftIdeas: string[];
  reminder: BirthdayReminderPref;
  isDemo?: boolean;
}

export type HabitFrequency = 'daily' | 'weekdays' | 'weekends' | 'weekly_target';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: string;
  color: string;
  icon?: string;
  frequency: HabitFrequency;
  targetPerWeek?: number;
  createdAt: string;
  isDemo?: boolean;
}

export interface HabitCheckin {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  note?: string;
}

export type NoteCategory = 'general' | 'work' | 'personal' | 'ideas' | 'journal';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  tags: string[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export type FocusSessionType = 'focus' | 'short_break' | 'long_break';

export interface FocusSession {
  id: string;
  duration: number; // minutes
  type: FocusSessionType;
  completed: boolean;
  taskId?: string;
  taskTitle?: string;
  timestamp: string; // ISO string
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'task' | 'event' | 'birthday' | 'habit' | 'system' | 'goal' | 'budget';
  timestamp: string;
  read: boolean;
  linkView?: ActiveView;
  entityId?: string;
}

// ---------------------------------------------------------------------------
// LIFE MANAGEMENT EXPANSION TYPES
// ---------------------------------------------------------------------------

// 1. Life Goals & Milestones
export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

export interface LifeGoal {
  id: string;
  title: string;
  description: string;
  category: 'Career' | 'Financial' | 'Health' | 'Personal' | 'Education' | 'Spiritual';
  targetDate: string;
  progress: number; // 0 - 100
  status: 'not_started' | 'in_progress' | 'completed';
  milestones: Milestone[];
  isDemo?: boolean;
}

// 2. Bucket List
export interface BucketListItem {
  id: string;
  title: string;
  description?: string;
  category: 'Adventure' | 'Travel' | 'Skills' | 'Experiences' | 'Creative' | 'Personal';
  targetYear?: number;
  completed: boolean;
  completedDate?: string;
  location?: string;
  notes?: string;
  isDemo?: boolean;
}

// 3. Life Timeline & Memories
export interface TimelineMemory {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  description: string;
  category: 'Milestone' | 'Travel' | 'Career' | 'Family' | 'Achievement' | 'Personal';
  imageEmoji: string;
  tags: string[];
  rating: number; // 1 to 5 stars
  isDemo?: boolean;
}

// 4. Special Dates & Relationships
export interface SpecialDate {
  id: string;
  personName: string;
  relationship: string;
  date: string; // YYYY-MM-DD
  type: 'anniversary' | 'first_met' | 'milestone' | 'check_in' | 'celebration';
  frequency: 'yearly' | 'monthly' | 'once';
  notes?: string;
  lastContactDate?: string;
  isDemo?: boolean;
}

// 5. Student Dashboard
export interface CourseAssignment {
  id: string;
  title: string;
  dueDate: string;
  weight: number;
  score?: number;
  maxScore: number;
  status: 'pending' | 'submitted' | 'graded';
}

export interface StudentCourse {
  id: string;
  code: string;
  name: string;
  professor?: string;
  credits: number;
  grade?: string;
  semester: string;
  status: 'active' | 'completed';
  assignments: CourseAssignment[];
  isDemo?: boolean;
}

// 6. Certification & Skills Tracker
export interface SkillCert {
  id: string;
  name: string;
  category: 'Technical' | 'Soft Skills' | 'Languages' | 'Creative' | 'Business';
  type: 'skill' | 'certification';
  issuer?: string;
  issueDate?: string;
  expiryDate?: string;
  proficiency: number; // 1 - 5
  status: 'learning' | 'certified' | 'expert';
  credentialUrl?: string;
  isDemo?: boolean;
}

// 7. Career & Job Application Tracker
export type JobStatus = 'wishlist' | 'applied' | 'interviewing' | 'offer' | 'rejected';

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  location?: string;
  salary?: string;
  status: JobStatus;
  appliedDate: string;
  interviewDate?: string;
  notes?: string;
  link?: string;
  isDemo?: boolean;
}

// 8. Knowledge Hub / Second Brain
export interface KnowledgeItem {
  id: string;
  title: string;
  sourceUrl?: string;
  category: 'book' | 'article' | 'video' | 'framework' | 'cheat_sheet' | 'concept';
  summary: string;
  tags: string[];
  keyTakeaways: string[];
  createdAt: string;
  isDemo?: boolean;
}

// 9. Expense & Budget Tracker
export interface ExpenseTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'expense' | 'income';
  category: 'Housing' | 'Food' | 'Transport' | 'Shopping' | 'Utilities' | 'Health' | 'Entertainment' | 'Income' | 'Other';
  date: string; // YYYY-MM-DD
  paymentMethod?: string;
  isDemo?: boolean;
}

// 10. Savings Goals
export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  category: string;
  isDemo?: boolean;
}

// 11. Wishlist & Purchase Planner
export interface WishlistItem {
  id: string;
  title: string;
  estimatedCost: number;
  priority: 'low' | 'medium' | 'high';
  reason: string;
  purchased: boolean;
  purchasedDate?: string;
  url?: string;
  isDemo?: boolean;
}

// 12. Subscription Manager
export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  nextRenewal: string;
  category: string;
  active: boolean;
  websiteUrl?: string;
  isDemo?: boolean;
}

// 13. Fitness & Workout Tracker
export interface ExerciseSet {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
}

export interface WorkoutLog {
  id: string;
  date: string;
  workoutType: 'Strength' | 'Cardio' | 'HIIT' | 'Yoga' | 'Running' | 'Mobility';
  durationMinutes: number;
  caloriesBurned?: number;
  exercises: ExerciseSet[];
  notes?: string;
  isDemo?: boolean;
}

// 14. Wellness Tracker
export interface WellnessLog {
  id: string;
  date: string; // YYYY-MM-DD
  sleepHours: number;
  sleepQuality: number; // 1 - 5
  mood: number; // 1 - 5
  waterLiters: number;
  energyLevel: number; // 1 - 5
  notes?: string;
  isDemo?: boolean;
}

// 15. Reading Tracker
export interface ReadingBook {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  currentPage: number;
  status: 'to_read' | 'reading' | 'completed';
  rating?: number;
  format: 'physical' | 'ebook' | 'audiobook';
  review?: string;
  startDate?: string;
  finishDate?: string;
  isDemo?: boolean;
}

// 16. Travel Planner
export interface PackingItem {
  id: string;
  item: string;
  packed: boolean;
}

export interface TripActivity {
  day: number;
  date?: string;
  activity: string;
  location?: string;
}

export interface TripPlan {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: 'dream' | 'planning' | 'booked' | 'completed';
  itinerary: TripActivity[];
  packingList: PackingItem[];
  isDemo?: boolean;
}

// 17. Meal Planner
export interface MealPlanItem {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  dishName: string;
  recipeNotes?: string;
  groceriesNeeded: string[];
  isDemo?: boolean;
}

// 18. Household Chore Manager
export interface HouseholdChore {
  id: string;
  title: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  room: 'Kitchen' | 'Living Room' | 'Bedroom' | 'Bathroom' | 'Balcony' | 'General';
  lastCompleted?: string;
  nextDue: string;
  isDemo?: boolean;
}

// 19. Document Vault
export interface VaultAttachment {
  fileName: string;
  mimeType: string;
  dataUrl: string;
}

export interface VaultDocument {
  id: string;
  title: string;
  category: 'Identity' | 'Finance' | 'Medical' | 'Insurance' | 'Contracts' | 'Vehicle' | 'Other';
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  notes?: string;
  tags: string[];
  attachments?: VaultAttachment[];
  isDemo?: boolean;
}

// 20. Decision Journal
export interface DecisionItem {
  id: string;
  title: string;
  decisionDate: string;
  context: string;
  optionsConsidered: string[];
  chosenOption: string;
  expectedOutcome: string;
  actualOutcome?: string;
  reflectionRating?: number; // 1 to 5
  isDemo?: boolean;
}

// 21. Reviews (Weekly & Monthly Reviews)
export interface ReviewRecord {
  id: string;
  periodType: 'weekly' | 'monthly';
  periodDate: string; // e.g. YYYY-Www or YYYY-MM
  wins: string[];
  challenges: string[];
  improvements: string[];
  rating: number;
  isDemo?: boolean;
}

// ---------------------------------------------------------------------------
// VIEW & NAVIGATION ENUMS
// ---------------------------------------------------------------------------

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'blue' | 'purple' | 'green' | 'orange' | 'rose';
export type CalendarViewType = 'month' | 'week' | 'day' | 'agenda';

export type ActiveView =
  // Core
  | 'day'
  | 'briefing'
  | 'calendar'
  | 'tasks'
  | 'focus'
  | 'routines'
  // Productivity
  | 'eisenhower'
  | 'timeblocking'
  | 'reviews'
  | 'goals'
  | 'milestones'
  | 'countdowns'
  // Life & Relationships
  | 'birthdays'
  | 'special_dates'
  | 'timeline'
  | 'bucket_list'
  | 'decisions'
  // Finance
  | 'finances'
  | 'savings'
  | 'wishlist'
  | 'subscriptions'
  // Health & Lifestyle
  | 'habits'
  | 'fitness'
  | 'wellness'
  | 'reading'
  | 'meals'
  | 'chores'
  // Growth & Career
  | 'student'
  | 'skills'
  | 'career'
  | 'knowledge'
  // Records & Setup
  | 'notes'
  | 'travel'
  | 'vault'
  | 'analytics'
  | 'settings';

export type WidgetSize = 'normal' | 'wide' | 'full';

export type CurrencyCode =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'INR'
  | 'CAD'
  | 'AUD'
  | 'JPY'
  | 'CNY'
  | 'CHF'
  | 'NZD'
  | 'SGD'
  | 'HKD'
  | 'BRL'
  | 'MXN'
  | 'ZAR'
  | 'AED';

export interface SidebarSectionVisibility {
  productivity: boolean;
  lifeRelationships: boolean;
  financeWealth: boolean;
  healthLifestyle: boolean;
  growthCareer: boolean;
  recordsAnalytics: boolean;
}

export interface QuickLink {
  id: string;
  label: string;
  url: string;
}

export interface DashboardWidgetConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
  size?: WidgetSize;
}

export interface UserSettings {
  name: string;
  avatarEmoji: string;
  themeMode: ThemeMode;
  accentColor: AccentColor;
  firstDayOfWeek: 'monday' | 'sunday';
  timeFormat: '12h' | '24h';
  dateFormat: 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY';
  currency: CurrencyCode;
  sidebarSections: SidebarSectionVisibility;
  defaultTaskPriority: Priority;
  defaultCalendarView: CalendarViewType;
  browserNotifications: boolean;
  soundEnabled: boolean;
  pomodoro: {
    focusDuration: number;
    shortBreak: number;
    longBreak: number;
    longBreakInterval: number;
  };
  quickLinks: QuickLink[];
  showQuickLinksInSidebar: boolean;
  dashboardWidgets: DashboardWidgetConfig[];
  enabledModules: Record<string, boolean>;
  morningRoutine: { id: string; title: string; durationMins: number; completed: boolean }[];
  eveningRoutine: { id: string; title: string; durationMins: number; completed: boolean }[];
}

export interface BackupData {
  version: number;
  exportedAt: string;
  settings: UserSettings;
  tasks: Task[];
  events: CalendarEvent[];
  birthdays: Birthday[];
  habits: Habit[];
  habitCheckins: HabitCheckin[];
  notes: Note[];
  focusSessions: FocusSession[];
  notifications: AppNotification[];
  // Expanded stores
  goals?: LifeGoal[];
  bucketList?: BucketListItem[];
  timelineMemories?: TimelineMemory[];
  specialDates?: SpecialDate[];
  studentCourses?: StudentCourse[];
  skillsCerts?: SkillCert[];
  jobApplications?: JobApplication[];
  knowledgeItems?: KnowledgeItem[];
  expenses?: ExpenseTransaction[];
  savingsGoals?: SavingsGoal[];
  wishlist?: WishlistItem[];
  subscriptions?: Subscription[];
  workouts?: WorkoutLog[];
  wellnessLogs?: WellnessLog[];
  readingBooks?: ReadingBook[];
  tripPlans?: TripPlan[];
  mealPlans?: MealPlanItem[];
  householdChores?: HouseholdChore[];
  vaultDocuments?: VaultDocument[];
  decisionItems?: DecisionItem[];
  reviewRecords?: ReviewRecord[];
}
