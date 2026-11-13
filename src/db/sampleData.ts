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

export function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, days: number): Date {
  const res = new Date(date);
  res.setDate(res.getDate() + days);
  return res;
}

export const DEFAULT_SETTINGS: UserSettings = {
  name: 'Alex Rivera',
  avatarEmoji: '⚡',
  themeMode: 'dark',
  accentColor: 'blue',
  firstDayOfWeek: 'monday',
  timeFormat: '12h',
  dateFormat: 'YYYY-MM-DD',
  currency: 'USD',
  sidebarSections: {
    productivity: true,
    lifeRelationships: true,
    financeWealth: true,
    healthLifestyle: true,
    growthCareer: true,
    recordsAnalytics: true,
  },
  defaultTaskPriority: 'medium',
  defaultCalendarView: 'month',
  browserNotifications: false,
  soundEnabled: true,
  pomodoro: {
    focusDuration: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
  },
  dashboardWidgets: [
    { id: 'todayTasks', label: "Today's Tasks", visible: true, order: 0, size: 'wide' },
    { id: 'dailyProgress', label: 'Daily Progress Ring', visible: true, order: 1, size: 'normal' },
    { id: 'dailyQuote', label: 'Daily Inspiration Quote', visible: true, order: 2, size: 'normal' },
    { id: 'upcomingEvents', label: 'Upcoming Events', visible: true, order: 3, size: 'normal' },
    { id: 'upcomingBirthdays', label: 'Upcoming Birthdays', visible: true, order: 4, size: 'normal' },
    { id: 'habitOverview', label: 'Habit Streaks', visible: true, order: 5, size: 'normal' },
    { id: 'goalProgress', label: 'Life Goals Progress', visible: true, order: 6, size: 'normal' },
    { id: 'budgetOverview', label: 'Monthly Budget Summary', visible: true, order: 7, size: 'normal' },
    { id: 'fitnessSummary', label: 'Fitness & Workouts', visible: true, order: 8, size: 'normal' },
    { id: 'dailyChecklist', label: 'Daily Quick Checklist', visible: true, order: 9, size: 'normal' },
    { id: 'upcomingTrips', label: 'Upcoming Trips & Travel', visible: true, order: 10, size: 'normal' },
    { id: 'focusTimer', label: 'Focus Pomodoro Widget', visible: true, order: 11, size: 'normal' },
    { id: 'overdueTasks', label: 'Overdue Alerts', visible: true, order: 12, size: 'wide' },
    { id: 'quickNotes', label: 'Scratchpad Note', visible: true, order: 13, size: 'normal' },
  ],
  enabledModules: {
    goals: true,
    bucketList: true,
    timeline: true,
    specialDates: true,
    student: true,
    skills: true,
    career: true,
    knowledge: true,
    finances: true,
    savings: true,
    wishlist: true,
    subscriptions: true,
    fitness: true,
    wellness: true,
    reading: true,
    travel: true,
    meals: true,
    chores: true,
    vault: true,
    decisions: true,
    briefing: true,
    reviews: true,
    eisenhower: true,
    timeblocking: true,
    routines: true,
    countdowns: true,
  },
  morningRoutine: [
    { id: 'mr-1', title: 'Hydrate with 500ml lemon water', durationMins: 2, completed: true },
    { id: 'mr-2', title: 'Mindfulness & 4-7-8 breathing session', durationMins: 10, completed: true },
    { id: 'mr-3', title: 'Review DayFlow command center & Top 3 Focus items', durationMins: 5, completed: false },
    { id: 'mr-4', title: 'Morning sunlight & 15m mobility stretch', durationMins: 15, completed: false },
  ],
  eveningRoutine: [
    { id: 'er-1', title: 'Triage pending tasks & inbox zero clean-up', durationMins: 10, completed: false },
    { id: 'er-2', title: 'Log daily gratitude & retrospective in Notes', durationMins: 5, completed: false },
    { id: 'er-3', title: 'Screen shutdown & 20m paper book reading', durationMins: 20, completed: false },
  ],
};

export function generateSampleData() {
  const now = new Date();
  const today = formatLocalDate(now);
  const tomorrow = formatLocalDate(addDays(now, 1));
  const yesterday = formatLocalDate(addDays(now, -1));
  const in3Days = formatLocalDate(addDays(now, 3));
  const in5Days = formatLocalDate(addDays(now, 5));
  const in10Days = formatLocalDate(addDays(now, 10));

  // 1. Tasks
  const tasks: Task[] = [
    {
      id: 'demo-task-1',
      title: 'Review Q4 Product Roadmap & milestones',
      description: 'Prepare executive summary deck and verify feature sprint commitments with the leads.',
      dueDate: today,
      dueTime: '14:00',
      priority: 'high',
      status: 'in_progress',
      category: 'Work',
      tags: ['Strategy', 'Roadmap'],
      subtasks: [
        { id: 'sub-1', title: 'Audit pending backlog deliverables', completed: true },
        { id: 'sub-2', title: 'Align resource allocation with engineering', completed: false },
        { id: 'sub-3', title: 'Publish final slide deck to drive', completed: false },
      ],
      recurrence: 'none',
      reminder: true,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      isDemo: true,
    },
    {
      id: 'demo-task-2',
      title: 'Finalize DayFlow design system tokens',
      description: 'Ensure dark mode contrast meets AAA standards and verify accent color tokens across all widgets.',
      dueDate: today,
      dueTime: '17:30',
      priority: 'urgent',
      status: 'todo',
      category: 'Design',
      tags: ['UI', 'Tailwind', 'Tokens'],
      subtasks: [
        { id: 'sub-4', title: 'Test contrast in light mode', completed: true },
        { id: 'sub-5', title: 'Verify modal and popover styles in dark mode', completed: false },
      ],
      recurrence: 'none',
      reminder: true,
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      isDemo: true,
    },
    {
      id: 'demo-task-3',
      title: 'Morning workout & mobility routine',
      description: '30 mins kettlebell workout followed by hamstrings & shoulder mobility exercises.',
      dueDate: today,
      dueTime: '08:00',
      priority: 'medium',
      status: 'completed',
      category: 'Health',
      tags: ['Fitness', 'Routine'],
      subtasks: [],
      recurrence: 'daily',
      reminder: false,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      completedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      isDemo: true,
    },
    {
      id: 'demo-task-4',
      title: 'Send monthly team sync notes',
      description: 'Summarize key takeaways, action items, and next release target dates.',
      dueDate: tomorrow,
      dueTime: '11:00',
      priority: 'medium',
      status: 'todo',
      category: 'Work',
      tags: ['Team', 'Follow-up'],
      subtasks: [],
      recurrence: 'weekly',
      reminder: true,
      createdAt: new Date().toISOString(),
      isDemo: true,
    },
    {
      id: 'demo-task-5',
      title: 'Submit quarterly tax & expense receipts',
      description: 'Match credit card receipts to bookkeeping ledger for accountant review.',
      dueDate: yesterday,
      dueTime: '18:00',
      priority: 'high',
      status: 'todo',
      category: 'Finance',
      tags: ['Accounting', 'Receipts'],
      subtasks: [
        { id: 'sub-6', title: 'Download bank statements', completed: true },
        { id: 'sub-7', title: 'Categorize software subscriptions', completed: false },
      ],
      recurrence: 'monthly',
      reminder: true,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      isDemo: true,
    },
    {
      id: 'demo-task-6',
      title: 'Buy fresh Ethiopian whole-bean coffee',
      description: 'Light roast washed process from local roastery.',
      dueDate: in3Days,
      priority: 'low',
      status: 'todo',
      category: 'Personal',
      tags: ['Errands'],
      subtasks: [],
      recurrence: 'none',
      reminder: false,
      createdAt: new Date().toISOString(),
      isDemo: true,
    },
  ];

  // 2. Events
  const events: CalendarEvent[] = [
    {
      id: 'demo-event-1',
      title: 'Sprint Planning & Backlog Grooming',
      description: 'Discuss sprint goals, story point estimates, and assign sprint tasks.',
      date: today,
      startTime: '10:00',
      endTime: '11:30',
      allDay: false,
      category: 'meeting',
      location: 'Virtual Room A',
      reminder: true,
      recurrence: 'weekly',
      isDemo: true,
    },
    {
      id: 'demo-event-2',
      title: 'Design Review: Desktop Multi-column Layout',
      description: 'Present widget layout customizer and collapsible sidebar state machine.',
      date: today,
      startTime: '15:00',
      endTime: '16:00',
      allDay: false,
      category: 'work',
      location: 'Design Studio & Hangout',
      reminder: true,
      recurrence: 'none',
      isDemo: true,
    },
    {
      id: 'demo-event-3',
      title: 'Dinner with Mom & Dad',
      description: 'Italian trattoria reservation for 4.',
      date: tomorrow,
      startTime: '19:00',
      endTime: '21:30',
      allDay: false,
      category: 'personal',
      location: 'Osteria Bellini, Downtown',
      reminder: true,
      recurrence: 'none',
      isDemo: true,
    },
    {
      id: 'demo-event-4',
      title: 'Annual Tech Summit Keynote',
      description: 'Opening remarks on local-first architectures and browser persistence.',
      date: in5Days,
      startTime: '09:00',
      endTime: '18:00',
      allDay: true,
      category: 'work',
      location: 'Convention Center',
      reminder: true,
      recurrence: 'none',
      isDemo: true,
    },
  ];

  // 3. Birthdays
  const birthdays: Birthday[] = [
    {
      id: 'demo-bday-1',
      name: 'Elena Rostova',
      birthdate: formatLocalDate(addDays(now, 2)),
      birthYear: 1996,
      relationship: 'partner',
      avatarColor: 'bg-rose-500',
      notes: 'Loves mechanical keyboards, specialty matcha, and studio ceramics.',
      giftIdeas: ['Ceramic pour-over dripper', 'Custom tactile switches keyboard kit', 'Matcha ceremony bowl'],
      reminder: '3_days_before',
      isDemo: true,
    },
    {
      id: 'demo-bday-2',
      name: 'Marcus Chen',
      birthdate: formatLocalDate(addDays(now, 6)),
      birthYear: 1992,
      relationship: 'friend',
      avatarColor: 'bg-blue-500',
      notes: 'Avid rock climber and board game enthusiast.',
      giftIdeas: ['Climbing chalk bucket', 'Wingspan Asia expansion', 'Theragun mini'],
      reminder: '1_week_before',
      isDemo: true,
    },
    {
      id: 'demo-bday-3',
      name: 'Mom (Claire)',
      birthdate: formatLocalDate(addDays(now, 14)),
      birthYear: 1968,
      relationship: 'family',
      avatarColor: 'bg-purple-500',
      notes: 'Enjoys gardening, historical biographies, and botanical art.',
      giftIdeas: ['High quality Japanese pruning shears', 'Botanical garden annual pass', 'Cashmere scarf'],
      reminder: '1_week_before',
      isDemo: true,
    },
  ];

  // 4. Habits & Checkins
  const habits: Habit[] = [
    {
      id: 'demo-habit-1',
      title: 'Read 20+ Pages of Non-Fiction',
      description: 'Architecture, psychology, or history books before sleep.',
      category: 'Learning',
      color: 'indigo',
      frequency: 'daily',
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      isDemo: true,
    },
    {
      id: 'demo-habit-2',
      title: 'Drink 2.5 Liters of Water',
      description: 'Keep water bottle filled at desk during deep work sprints.',
      category: 'Health',
      color: 'cyan',
      frequency: 'daily',
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      isDemo: true,
    },
    {
      id: 'demo-habit-3',
      title: 'Deep Focus Pomodoro Block',
      description: 'At least 2 uninterrupted 50-minute deep work intervals.',
      category: 'Productivity',
      color: 'amber',
      frequency: 'weekdays',
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      isDemo: true,
    },
    {
      id: 'demo-habit-4',
      title: 'Daily Evening Walk (5,000 steps)',
      description: 'Unwind without screen time around sunset.',
      category: 'Wellness',
      color: 'emerald',
      frequency: 'daily',
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      isDemo: true,
    },
  ];

  const habitCheckins: HabitCheckin[] = [];
  for (let i = 0; i < 14; i++) {
    const d = formatLocalDate(addDays(now, -i));
    if (i !== 4 && i !== 10) {
      habitCheckins.push({
        id: `demo-checkin-1-${d}`,
        habitId: 'demo-habit-1',
        date: d,
        completed: true,
      });
    }
    if (i !== 8) {
      habitCheckins.push({
        id: `demo-checkin-2-${d}`,
        habitId: 'demo-habit-2',
        date: d,
        completed: true,
      });
    }
    const dayOfWeek = addDays(now, -i).getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5 && i !== 2) {
      habitCheckins.push({
        id: `demo-checkin-3-${d}`,
        habitId: 'demo-habit-3',
        date: d,
        completed: true,
      });
    }
    if (i % 3 !== 2) {
      habitCheckins.push({
        id: `demo-checkin-4-${d}`,
        habitId: 'demo-habit-4',
        date: d,
        completed: true,
      });
    }
  }

  // 5. Notes
  const notes: Note[] = [
    {
      id: 'demo-note-1',
      title: 'DayFlow Architecture & Engineering Principles',
      content: `# DayFlow Principles

- **Zero-Cloud Dependency**: Runs 100% locally in user's browser using IndexedDB.
- **Fast Micro-Interactions**: Instant optimistic updates with seamless persistence.
- **Privacy First**: Sensitive data never leaves client device.`,
      category: 'work',
      tags: ['Architecture', 'Philosophy'],
      pinned: true,
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      isDemo: true,
    },
    {
      id: 'demo-note-2',
      title: 'Today’s Journal & Gratitude Reflection',
      content: `### Morning Intention
Stay composed during the roadmap review. Prioritize energy management over simply checking items off.

### Three Things I am Grateful For
1. Fresh crisp morning air during my run.
2. The team's creative breakthrough on the theme tokens system.
3. Uninterrupted coffee time before emails started coming in.`,
      category: 'journal',
      tags: ['Journal', 'Reflection', 'Mindset'],
      pinned: true,
      createdAt: today,
      updatedAt: today,
      isDemo: true,
    },
  ];

  // 6. Focus Sessions
  const focusSessions: FocusSession[] = [
    {
      id: 'demo-focus-1',
      duration: 25,
      type: 'focus',
      completed: true,
      taskId: 'demo-task-1',
      taskTitle: 'Review Q4 Product Roadmap & milestones',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'demo-focus-2',
      duration: 25,
      type: 'focus',
      completed: true,
      taskId: 'demo-task-2',
      taskTitle: 'Finalize DayFlow design system tokens',
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
  ];

  // 7. Life Goals & Milestones
  const goals: LifeGoal[] = [
    {
      id: 'goal-1',
      title: 'Launch DayFlow OS to 10,000 active users',
      description: 'Build the most polished, private, local-first productivity tool on the web.',
      category: 'Career',
      targetDate: formatLocalDate(addDays(now, 90)),
      progress: 65,
      status: 'in_progress',
      milestones: [
        { id: 'm-1', title: 'Complete local IndexedDB architecture', completed: true },
        { id: 'm-2', title: 'Implement 20 life management modules', completed: true },
        { id: 'm-3', title: 'Launch on Product Hunt & Hacker News', completed: false, dueDate: formatLocalDate(addDays(now, 30)) },
      ],
      isDemo: true,
    },
    {
      id: 'goal-2',
      title: 'Run a Half Marathon in under 1h 50m',
      description: 'Consistent progressive cardiovascular training and nutrition plan.',
      category: 'Health',
      targetDate: formatLocalDate(addDays(now, 120)),
      progress: 40,
      status: 'in_progress',
      milestones: [
        { id: 'm-4', title: 'Build base to 10k continuous running', completed: true },
        { id: 'm-5', title: 'Complete 15k weekend long run', completed: false },
        { id: 'm-6', title: 'Race day pace simulation', completed: false },
      ],
      isDemo: true,
    },
    {
      id: 'goal-3',
      title: 'Build $25,000 Emergency Safety Reserve',
      description: '6 months of living expenses in high-yield liquid savings.',
      category: 'Financial',
      targetDate: formatLocalDate(addDays(now, 180)),
      progress: 75,
      status: 'in_progress',
      milestones: [
        { id: 'm-7', title: 'Reach $10k milestone', completed: true },
        { id: 'm-8', title: 'Reach $20k milestone', completed: true },
        { id: 'm-9', title: 'Reach $25k full reserve', completed: false },
      ],
      isDemo: true,
    },
  ];

  // 8. Bucket List
  const bucketList: BucketListItem[] = [
    {
      id: 'bucket-1',
      title: 'See the Northern Lights from a glass igloo in Lapland',
      category: 'Travel',
      targetYear: 2027,
      completed: false,
      location: 'Rovaniemi, Finland',
      notes: 'Best months are October through March. Bring thermal camera gear.',
      isDemo: true,
    },
    {
      id: 'bucket-2',
      title: 'Obtain Private Pilot License (PPL)',
      category: 'Skills',
      targetYear: 2028,
      completed: false,
      notes: 'Requires 40+ flight hours and ground school exams.',
      isDemo: true,
    },
    {
      id: 'bucket-3',
      title: 'Hike Mount Fuji to watch sunrise (Goraiko)',
      category: 'Adventure',
      targetYear: 2026,
      completed: true,
      completedDate: '2026-08-15',
      location: 'Mount Fuji, Japan',
      notes: 'Summited via Yoshida Trail at 4:30 AM. Truly unforgettable.',
      isDemo: true,
    },
  ];

  // 9. Timeline & Memories
  const timelineMemories: TimelineMemory[] = [
    {
      id: 'mem-1',
      title: 'Started Building DayFlow Application',
      date: formatLocalDate(addDays(now, -60)),
      description: 'Decided to create an all-in-one local-first productivity workspace with no cloud lock-in.',
      category: 'Milestone',
      imageEmoji: '🚀',
      tags: ['Engineering', 'Building', 'Milestone'],
      rating: 5,
      isDemo: true,
    },
    {
      id: 'mem-2',
      title: 'Explored Kyoto Bamboo Groves & Fushimi Inari',
      date: formatLocalDate(addDays(now, -180)),
      description: 'Walked through thousand torii gates at dusk. Matcha soft serve and quiet temple gardens.',
      category: 'Travel',
      imageEmoji: '⛩️',
      tags: ['Japan', 'Travel', 'Kyoto'],
      rating: 5,
      isDemo: true,
    },
    {
      id: 'mem-3',
      title: 'Promoted to Senior Product Lead',
      date: formatLocalDate(addDays(now, -300)),
      description: 'Stepped into leadership role heading product strategy and architecture.',
      category: 'Career',
      imageEmoji: '💼',
      tags: ['Career', 'Promotion'],
      rating: 5,
      isDemo: true,
    },
  ];

  // 10. Special Dates & Relationships
  const specialDates: SpecialDate[] = [
    {
      id: 'sd-1',
      personName: 'Elena Rostova',
      relationship: 'Partner',
      date: formatLocalDate(addDays(now, 24)),
      type: 'anniversary',
      frequency: 'yearly',
      notes: 'Our 4-year anniversary. Reservation at the waterfront conservatory.',
      lastContactDate: today,
      isDemo: true,
    },
    {
      id: 'sd-2',
      personName: 'David Kim (Best Friend)',
      relationship: 'Friend',
      date: formatLocalDate(addDays(now, 10)),
      type: 'check_in',
      frequency: 'monthly',
      notes: 'Monthly catchup coffee and catch up on side projects.',
      lastContactDate: formatLocalDate(addDays(now, -14)),
      isDemo: true,
    },
  ];

  // 11. Student Courses & Assignments
  const studentCourses: StudentCourse[] = [
    {
      id: 'course-1',
      code: 'CS-401',
      name: 'Distributed Systems & Local-First Architecture',
      professor: 'Dr. Evelyn Vance',
      credits: 4,
      grade: 'A',
      semester: 'Fall 2026',
      status: 'active',
      assignments: [
        { id: 'as-1', title: 'Raft Consensus Protocol Simulation', dueDate: in5Days, weight: 25, score: 96, maxScore: 100, status: 'graded' },
        { id: 'as-2', title: 'CRDT vs OT Conflict Resolution Paper', dueDate: in10Days, weight: 35, maxScore: 100, status: 'pending' },
      ],
      isDemo: true,
    },
    {
      id: 'course-2',
      code: 'UX-310',
      name: 'Interaction Design & Ergonomics',
      professor: 'Prof. Julian Lee',
      credits: 3,
      semester: 'Fall 2026',
      status: 'active',
      assignments: [
        { id: 'as-3', title: 'Desktop Dashboard Ergonomics Case Study', dueDate: in3Days, weight: 30, maxScore: 100, status: 'pending' },
      ],
      isDemo: true,
    },
  ];

  // 12. Skills & Certifications
  const skillsCerts: SkillCert[] = [
    {
      id: 'skill-1',
      name: 'TypeScript & System Architecture',
      category: 'Technical',
      type: 'skill',
      proficiency: 5,
      status: 'expert',
      isDemo: true,
    },
    {
      id: 'skill-2',
      name: 'AWS Solutions Architect Associate',
      category: 'Technical',
      type: 'certification',
      issuer: 'Amazon Web Services',
      issueDate: '2025-06-10',
      expiryDate: '2028-06-10',
      proficiency: 4,
      status: 'certified',
      credentialUrl: 'https://aws.amazon.com/certification',
      isDemo: true,
    },
    {
      id: 'skill-3',
      name: 'Japanese Conversation (JLPT N3)',
      category: 'Languages',
      type: 'skill',
      proficiency: 3,
      status: 'learning',
      isDemo: true,
    },
  ];

  // 13. Career & Job Applications
  const jobApplications: JobApplication[] = [
    {
      id: 'job-1',
      company: 'Linear Labs',
      role: 'Staff Product Engineer',
      location: 'Remote (US/Global)',
      salary: '$190,000 - $220,000',
      status: 'interviewing',
      appliedDate: formatLocalDate(addDays(now, -12)),
      interviewDate: in3Days,
      notes: 'System architecture interview scheduled with VP of Engineering.',
      link: 'https://linear.app/careers',
      isDemo: true,
    },
    {
      id: 'job-2',
      company: 'Stripe',
      role: 'Lead Frontend Infrastructure Engineer',
      location: 'San Francisco, CA (Hybrid)',
      salary: '$210,000 - $240,000',
      status: 'applied',
      appliedDate: formatLocalDate(addDays(now, -4)),
      notes: 'Referred by alumni colleague in developer infrastructure.',
      isDemo: true,
    },
  ];

  // 14. Knowledge Hub / Second Brain
  const knowledgeItems: KnowledgeItem[] = [
    {
      id: 'kn-1',
      title: 'Local-First Software: You own your data, in spite of the cloud',
      sourceUrl: 'https://www.inkandswitch.com/local-first/',
      category: 'article',
      summary: 'Foundational paper on the principles of local-first computing: seamless offline usage, instant response, multi-device synchronization, and user ownership.',
      tags: ['Architecture', 'LocalFirst', 'Offline'],
      keyTakeaways: [
        'No spinners: all operations write directly to local storage first.',
        'Data ownership: user files are stored locally in standard formats.',
        'Network optional: application functions indefinitely without connectivity.',
      ],
      createdAt: formatLocalDate(addDays(now, -10)),
      isDemo: true,
    },
    {
      id: 'kn-2',
      title: 'Atomic Habits by James Clear',
      category: 'book',
      summary: 'Framework on compounding tiny 1% gains, environment design, and identity-based habit loops (Cue, Craving, Response, Reward).',
      tags: ['Productivity', 'Psychology', 'Habits'],
      keyTakeaways: [
        'You do not rise to the level of your goals, you fall to the level of your systems.',
        'Make cues obvious, attractive, easy, and satisfying.',
      ],
      createdAt: formatLocalDate(addDays(now, -20)),
      isDemo: true,
    },
  ];

  // 15. Expenses & Budget Tracker
  const expenses: ExpenseTransaction[] = [
    {
      id: 'exp-1',
      description: 'Monthly Apartment Rent & Utilities',
      amount: 1850,
      type: 'expense',
      category: 'Housing',
      date: formatLocalDate(addDays(now, -3)),
      paymentMethod: 'Bank Transfer',
      isDemo: true,
    },
    {
      id: 'exp-2',
      description: 'Client Engineering Retainer',
      amount: 5200,
      type: 'income',
      category: 'Income',
      date: formatLocalDate(addDays(now, -2)),
      paymentMethod: 'Direct Deposit',
      isDemo: true,
    },
    {
      id: 'exp-3',
      description: 'Organic Groceries & Produce Market',
      amount: 142.5,
      type: 'expense',
      category: 'Food',
      date: today,
      paymentMethod: 'Apple Pay',
      isDemo: true,
    },
    {
      id: 'exp-4',
      description: 'High Speed Fiber Internet',
      amount: 70,
      type: 'expense',
      category: 'Utilities',
      date: yesterday,
      paymentMethod: 'Credit Card',
      isDemo: true,
    },
  ];

  // 16. Savings Goals
  const savingsGoals: SavingsGoal[] = [
    {
      id: 'sav-1',
      title: 'Emergency Rainy Day Fund',
      targetAmount: 25000,
      currentAmount: 18750,
      deadline: formatLocalDate(addDays(now, 150)),
      category: 'Safety',
      isDemo: true,
    },
    {
      id: 'sav-2',
      title: 'Kyoto & Tokyo Autumn Trip',
      targetAmount: 4500,
      currentAmount: 3200,
      deadline: formatLocalDate(addDays(now, 80)),
      category: 'Travel',
      isDemo: true,
    },
  ];

  // 17. Wishlist & Purchases
  const wishlist: WishlistItem[] = [
    {
      id: 'wish-1',
      title: 'Herman Miller Embody Ergonomic Chair',
      estimatedCost: 1650,
      priority: 'high',
      reason: 'Essential for posture and preventing back strain during 8+ hour coding blocks.',
      purchased: false,
      url: 'https://store.hermanmiller.com',
      isDemo: true,
    },
    {
      id: 'wish-2',
      title: 'Sony WH-1000XM5 Noise Canceling Headphones',
      estimatedCost: 399,
      priority: 'medium',
      reason: 'Deep focus in coffee shops and travel flights.',
      purchased: true,
      purchasedDate: formatLocalDate(addDays(now, -15)),
      isDemo: true,
    },
  ];

  // 18. Subscriptions
  const subscriptions: Subscription[] = [
    {
      id: 'sub-1',
      name: 'GitHub Copilot & Enterprise',
      amount: 19,
      billingCycle: 'monthly',
      nextRenewal: formatLocalDate(addDays(now, 18)),
      category: 'Software',
      active: true,
      isDemo: true,
    },
    {
      id: 'sub-2',
      name: 'Spotify Premium Family',
      amount: 16.99,
      billingCycle: 'monthly',
      nextRenewal: formatLocalDate(addDays(now, 8)),
      category: 'Entertainment',
      active: true,
      isDemo: true,
    },
    {
      id: 'sub-3',
      name: 'Bouldering Gym Annual Pass',
      amount: 850,
      billingCycle: 'yearly',
      nextRenewal: formatLocalDate(addDays(now, 120)),
      category: 'Health',
      active: true,
      isDemo: true,
    },
  ];

  // 19. Fitness & Workout Tracker
  const workouts: WorkoutLog[] = [
    {
      id: 'wo-1',
      date: today,
      workoutType: 'Strength',
      durationMinutes: 55,
      caloriesBurned: 420,
      exercises: [
        { name: 'Barbell Deadlifts', sets: 4, reps: 6, weight: 140 },
        { name: 'Overhead Press', sets: 4, reps: 8, weight: 60 },
        { name: 'Pull-ups', sets: 3, reps: 10 },
      ],
      notes: 'Form felt solid on deadlifts. Kept rest under 90 seconds.',
      isDemo: true,
    },
    {
      id: 'wo-2',
      date: formatLocalDate(addDays(now, -2)),
      workoutType: 'Cardio',
      durationMinutes: 45,
      caloriesBurned: 480,
      exercises: [
        { name: 'Zone 2 Outdoor Run (8.2 km)', sets: 1, reps: 1 },
      ],
      notes: 'Paced comfortably at 5:25 min/km in cool weather.',
      isDemo: true,
    },
  ];

  // 20. Wellness Tracker
  const wellnessLogs: WellnessLog[] = [
    {
      id: 'well-1',
      date: today,
      sleepHours: 7.8,
      sleepQuality: 5,
      mood: 5,
      waterLiters: 2.4,
      energyLevel: 5,
      notes: 'Woke up naturally before alarm. Felt refreshed and energized.',
      isDemo: true,
    },
    {
      id: 'well-2',
      date: yesterday,
      sleepHours: 7.1,
      sleepQuality: 4,
      mood: 4,
      waterLiters: 2.1,
      energyLevel: 4,
      isDemo: true,
    },
  ];

  // 21. Reading Tracker
  const readingBooks: ReadingBook[] = [
    {
      id: 'book-1',
      title: 'Designing Data-Intensive Applications',
      author: 'Martin Kleppmann',
      totalPages: 616,
      currentPage: 382,
      status: 'reading',
      rating: 5,
      format: 'physical',
      startDate: formatLocalDate(addDays(now, -30)),
      review: 'The definitive guide to distributed databases, replication, partitioning, and stream processing.',
      isDemo: true,
    },
    {
      id: 'book-2',
      title: 'Four Thousand Weeks: Time Management for Mortals',
      author: 'Oliver Burkeman',
      totalPages: 288,
      currentPage: 288,
      status: 'completed',
      rating: 5,
      format: 'ebook',
      startDate: formatLocalDate(addDays(now, -60)),
      finishDate: formatLocalDate(addDays(now, -40)),
      review: 'Profound perspective on embracing finitude rather than optimizing every single second to burnout.',
      isDemo: true,
    },
    {
      id: 'book-3',
      title: 'Crafting Interpreters',
      author: 'Robert Nystrom',
      totalPages: 640,
      currentPage: 90,
      status: 'reading',
      format: 'physical',
      isDemo: true,
    },
  ];

  // 22. Travel Planner
  const tripPlans: TripPlan[] = [
    {
      id: 'trip-1',
      destination: 'Swiss Alps & Dolomites',
      startDate: formatLocalDate(addDays(now, 45)),
      endDate: formatLocalDate(addDays(now, 55)),
      budget: 3500,
      status: 'planning',
      itinerary: [
        { day: 1, activity: 'Arrive in Zurich, train to Lauterbrunnen Valley', location: 'Lauterbrunnen' },
        { day: 2, activity: 'Hike Northface Trail & Murren mountain village', location: 'Murren' },
        { day: 3, activity: 'Climb via ferrata and cable car to Schilthorn', location: 'Schilthorn' },
      ],
      packingList: [
        { id: 'p-1', item: 'Trekking boots (broken in)', packed: true },
        { id: 'p-2', item: 'Waterproof Gore-Tex hardshell jacket', packed: true },
        { id: 'p-3', item: 'Passport & International driving permit', packed: false },
        { id: 'p-4', item: 'Universal electrical plug adapter', packed: false },
      ],
      isDemo: true,
    },
  ];

  // 23. Meal Planner
  const mealPlans: MealPlanItem[] = [
    {
      id: 'meal-1',
      date: today,
      mealType: 'breakfast',
      dishName: 'Avocado Sourdough Toast & Poached Eggs',
      recipeNotes: 'With chili flakes, sea salt, and baby arugula.',
      groceriesNeeded: ['Sourdough bread', 'Avocados', 'Free-range eggs'],
      isDemo: true,
    },
    {
      id: 'meal-2',
      date: today,
      mealType: 'lunch',
      dishName: 'Mediterranean Quinoa Salad with Lemon Vinaigrette',
      groceriesNeeded: ['Quinoa', 'Cucumbers', 'Cherry tomatoes', 'Feta cheese'],
      isDemo: true,
    },
    {
      id: 'meal-3',
      date: today,
      mealType: 'dinner',
      dishName: 'Pan-seared Salmon with Roasted Asparagus',
      groceriesNeeded: ['Wild salmon fillets', 'Fresh asparagus', 'Garlic', 'Lemons'],
      isDemo: true,
    },
  ];

  // 24. Household Chores
  const householdChores: HouseholdChore[] = [
    {
      id: 'chore-1',
      title: 'Run dishwasher & wipe kitchen counters',
      frequency: 'daily',
      room: 'Kitchen',
      lastCompleted: yesterday,
      nextDue: today,
      isDemo: true,
    },
    {
      id: 'chore-2',
      title: 'Vacuum and steam mop living room hardwood',
      frequency: 'weekly',
      room: 'Living Room',
      lastCompleted: formatLocalDate(addDays(now, -6)),
      nextDue: tomorrow,
      isDemo: true,
    },
    {
      id: 'chore-3',
      title: 'Wash bed linens & pillowcases',
      frequency: 'weekly',
      room: 'Bedroom',
      lastCompleted: formatLocalDate(addDays(now, -5)),
      nextDue: in3Days,
      isDemo: true,
    },
  ];

  // 25. Document Vault
  const vaultDocuments: VaultDocument[] = [
    {
      id: 'doc-1',
      title: 'International Passport',
      category: 'Identity',
      documentNumber: 'P89421092',
      issueDate: '2021-04-12',
      expiryDate: '2031-04-12',
      notes: 'Stored in fireproof home safe. Check visa rules 6 months before expiry.',
      tags: ['Travel', 'Identification'],
      isDemo: true,
    },
    {
      id: 'doc-2',
      title: 'Homeowners Property & Contents Insurance',
      category: 'Insurance',
      documentNumber: 'POL-772910-US',
      expiryDate: formatLocalDate(addDays(now, 160)),
      notes: 'Comprehensive fire, theft, and water damage coverage.',
      tags: ['Insurance', 'Housing'],
      isDemo: true,
    },
  ];

  // 26. Decision Journal
  const decisionItems: DecisionItem[] = [
    {
      id: 'dec-1',
      title: 'Adopt Local-First Architecture for DayFlow',
      decisionDate: formatLocalDate(addDays(now, -30)),
      context: 'Deciding whether to build with cloud backend (Firebase/Supabase) or local IndexedDB.',
      optionsConsidered: [
        'Cloud-hosted Firestore (requires accounts, latency, ongoing costs)',
        'Local IndexedDB (instant offline, 100% privacy, zero cloud lock-in)',
      ],
      chosenOption: 'Local-first IndexedDB with JSON backup and export portability.',
      expectedOutcome: 'Sub-millisecond UI response, zero cloud downtime, highest possible user trust and data ownership.',
      actualOutcome: 'Instant performance and completely eliminates backend outage risks.',
      reflectionRating: 5,
      isDemo: true,
    },
  ];

  // 27. Review Records
  const reviewRecords: ReviewRecord[] = [
    {
      id: 'rev-1',
      periodType: 'weekly',
      periodDate: '2026-W44',
      wins: [
        'Finished DayFlow core theme tokens and IndexedDB persistence engine',
        'Maintained 100% daily hydration habit streak',
      ],
      challenges: [
        'Distracted by email context-switching on Tuesday morning',
      ],
      improvements: [
        'Protect first 90 minutes of the morning for deep focus before opening communications',
      ],
      rating: 5,
      isDemo: true,
    },
  ];

  return {
    tasks,
    events,
    birthdays,
    habits,
    habitCheckins,
    notes,
    focusSessions,
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
