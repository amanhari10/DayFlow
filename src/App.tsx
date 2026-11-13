/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Github, Instagram, Linkedin } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

// Core Views
import { MyDayView } from './views/MyDayView';
import { CalendarView } from './views/CalendarView';
import { TasksView } from './views/TasksView';
import { BirthdaysView } from './views/BirthdaysView';
import { HabitsView } from './views/HabitsView';
import { NotesView } from './views/NotesView';
import { FocusView } from './views/FocusView';
import { AnalyticsView } from './views/AnalyticsView';
import { SettingsView } from './views/SettingsView';

// Productivity Views
import { DailyBriefingView } from './views/productivity/DailyBriefingView';
import { EisenhowerMatrixView } from './views/productivity/EisenhowerMatrixView';
import { TimeBlockingView } from './views/productivity/TimeBlockingView';
import { RoutinesView } from './views/productivity/RoutinesView';
import { ReviewsView } from './views/productivity/ReviewsView';
import { CountdownsView } from './views/productivity/CountdownsView';

// Expansion Modules Views
import { GoalsView } from './views/modules/GoalsView';
import { BucketListView } from './views/modules/BucketListView';
import { TimelineView } from './views/modules/TimelineView';
import { SpecialDatesView } from './views/modules/SpecialDatesView';
import { StudentView } from './views/modules/StudentView';
import { SkillsView } from './views/modules/SkillsView';
import { CareerView } from './views/modules/CareerView';
import { KnowledgeView } from './views/modules/KnowledgeView';
import { FinanceView } from './views/modules/FinanceView';
import { SavingsView } from './views/modules/SavingsView';
import { WishlistView } from './views/modules/WishlistView';
import { SubscriptionsView } from './views/modules/SubscriptionsView';
import { FitnessView } from './views/modules/FitnessView';
import { WellnessView } from './views/modules/WellnessView';
import { ReadingView } from './views/modules/ReadingView';
import { TravelView } from './views/modules/TravelView';
import { MealsView } from './views/modules/MealsView';
import { ChoresView } from './views/modules/ChoresView';
import { VaultView } from './views/modules/VaultView';
import { DecisionsView } from './views/modules/DecisionsView';

// Modals
import { QuickAddModal } from './components/modals/QuickAddModal';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import { NotificationPanel } from './components/NotificationPanel';
import { TaskModal } from './components/modals/TaskModal';
import { EventModal } from './components/modals/EventModal';
import { BirthdayModal } from './components/modals/BirthdayModal';
import { HabitModal } from './components/modals/HabitModal';
import { NoteModal } from './components/modals/NoteModal';
import { Sparkles, AlertCircle } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    activeView,
    isLoading,
    storageError,
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
  } = useApp();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-app flex flex-col items-center justify-center text-primary-theme p-4">
        <div className="w-12 h-12 rounded-2xl bg-accent-theme flex items-center justify-center text-white shadow-lg animate-bounce">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold tracking-tight mt-4">Loading DayFlow...</h2>
        <p className="text-xs text-secondary-theme mt-1">Connecting to local-first database</p>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeView) {
      // Core Views
      case 'day':
        return <MyDayView />;
      case 'calendar':
        return <CalendarView />;
      case 'tasks':
        return <TasksView />;
      case 'birthdays':
        return <BirthdaysView />;
      case 'habits':
        return <HabitsView />;
      case 'notes':
        return <NotesView />;
      case 'focus':
        return <FocusView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;

      // Productivity Views
      case 'briefing':
        return <DailyBriefingView />;
      case 'eisenhower':
        return <EisenhowerMatrixView />;
      case 'timeblocking':
        return <TimeBlockingView />;
      case 'routines':
        return <RoutinesView />;
      case 'reviews':
        return <ReviewsView />;
      case 'countdowns':
        return <CountdownsView />;

      // Life & Relationships
      case 'goals':
      case 'milestones':
        return <GoalsView />;
      case 'bucket_list':
        return <BucketListView />;
      case 'timeline':
        return <TimelineView />;
      case 'special_dates':
        return <SpecialDatesView />;
      case 'decisions':
        return <DecisionsView />;

      // Finance
      case 'finances':
        return <FinanceView />;
      case 'savings':
        return <SavingsView />;
      case 'wishlist':
        return <WishlistView />;
      case 'subscriptions':
        return <SubscriptionsView />;

      // Health & Lifestyle
      case 'fitness':
        return <FitnessView />;
      case 'wellness':
        return <WellnessView />;
      case 'reading':
        return <ReadingView />;
      case 'meals':
        return <MealsView />;
      case 'chores':
        return <ChoresView />;

      // Growth & Career
      case 'student':
        return <StudentView />;
      case 'skills':
        return <SkillsView />;
      case 'career':
        return <CareerView />;
      case 'knowledge':
        return <KnowledgeView />;

      // Records
      case 'travel':
        return <TravelView />;
      case 'vault':
        return <VaultView />;

      default:
        return <MyDayView />;
    }
  };

  return (
    <div className="min-h-screen bg-app text-primary-theme flex transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      {/* Main App Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Sticky Header */}
        <Header
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenNotifications={() => setNotificationPanelOpen(true)}
        />

        {/* Local storage warning banner if IndexedDB was unavailable */}
        {storageError && (
          <div className="mx-4 sm:mx-8 mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{storageError}</span>
          </div>
        )}

        {/* View Content */}
        <main className="flex-1 pb-16">{renderActiveView()}</main>

        <footer className="border-t border-theme px-4 py-4 sm:px-8">
          <div className="flex flex-col items-center justify-between gap-3 text-xs text-secondary-theme sm:flex-row">
            <p>Developed by <span className="font-semibold text-primary-theme">Aman</span></p>
            <nav aria-label="Aman social profiles" className="flex items-center gap-4">
              <a
                href="https://www.linkedin.com/in/amanharisaxena/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-accent-theme"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </a>
              <a
                href="https://www.instagram.com/amanhari.saxena/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-accent-theme"
              >
                <Instagram className="h-4 w-4" />
                Instagram
              </a>
              <a
                href="https://github.com/amanhari10"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-accent-theme"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </nav>
          </div>
        </footer>
      </div>

      {/* Global Interactive Modals */}
      <QuickAddModal />
      <GlobalSearchModal />
      <NotificationPanel
        isOpen={notificationPanelOpen}
        onClose={() => setNotificationPanelOpen(false)}
      />

      {/* Active Edit Modals */}
      {editingTask && (
        <TaskModal
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          task={editingTask}
        />
      )}

      {editingEvent && (
        <EventModal
          isOpen={!!editingEvent}
          onClose={() => setEditingEvent(null)}
          event={editingEvent}
        />
      )}

      {editingBirthday && (
        <BirthdayModal
          isOpen={!!editingBirthday}
          onClose={() => setEditingBirthday(null)}
          birthday={editingBirthday}
        />
      )}

      {editingHabit && (
        <HabitModal
          isOpen={!!editingHabit}
          onClose={() => setEditingHabit(null)}
          habit={editingHabit}
        />
      )}

      {editingNote && (
        <NoteModal
          isOpen={!!editingNote}
          onClose={() => setEditingNote(null)}
          note={editingNote}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
