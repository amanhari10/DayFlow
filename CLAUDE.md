# CLAUDE.md — DayFlow project notes

Read this first when the project folder is uploaded again. It records what the app is, what has been done, what is left, and how to continue.

## About the project
- **DayFlow**: a local-first personal productivity and life-management dashboard.
- Originally exported from Google AI Studio (uploaded as `111.zip`).
- Stack: React 19, TypeScript, Vite 8, Tailwind CSS v4, lucide-react, motion.
- All data is stored in the browser's **IndexedDB** (see `src/db/indexedDB.ts`). There is no backend.
- Owner runs it on **Windows 11** at **http://localhost:3000** for daily use.

## How it is run
- Node.js LTS must be installed.
- **GitHub:** [amanhari10/DayFlow](https://github.com/amanhari10/DayFlow) is the public repository.
- This working copy uses `.githooks/post-commit` to push each successful commit to `origin`. Saving a file does not push it; commit changes first. For another clone, enable the hook with `git config core.hooksPath .githooks`.
- **Daily use (built version):** `run-server.bat` builds if `dist` is missing, then runs `vite preview` on port 3000 (`--strictPort`).
- **Auto-start on sign-in:** `install-autostart.bat` adds a shortcut to the Windows Startup folder that launches `start-hidden.vbs`, which runs `run-server.bat` hidden. `uninstall-autostart.bat` removes it.
- **Live editing:** `npm run dev -- --host 127.0.0.1` (port 3000). Saved changes reload the browser automatically.
- After code changes in built mode, delete the `dist` folder and restart so it rebuilds.
- Checks: `npx tsc --noEmit` (type-check) and `npx vite build`.
- **Always use `localhost:3000`.** IndexedDB data is tied to the origin, so a different host or port shows empty data.

## Project layout
- `src/App.tsx`: view switching and layout shell.
- `src/context/AppContext.tsx`: shared state and logic (very large, ~67 KB).
- `src/db/`: `indexedDB.ts` (storage layer) and `sampleData.ts` (default settings and demo data).
- `src/views/`: core pages (MyDay, Calendar, Tasks, Birthdays, Habits, Notes, Focus, Analytics, Settings).
- `src/views/modules/`: life modules (Goals, BucketList, Timeline, SpecialDates, Student, Skills, Career, Knowledge, Finance, Savings, Wishlist, Subscriptions, Fitness, Wellness, Reading, Travel, Meals, Chores, Vault, Decisions).
- `src/views/productivity/`: DailyBriefing, EisenhowerMatrix, TimeBlocking, Routines, Reviews, Countdowns.
- `src/components/`: Sidebar, Header, NotificationPanel, QuickLinksPanel, and modals.
- `src/data/quotes.ts`: generated original 300-quote reflection collection.
- `src/components/MarkdownEditor.tsx`: reusable Markdown toolbar and safe formatted preview.
- Sidebar modules can be turned on or off via `settings.enabledModules` (see `Sidebar.tsx`).

## Done so far
1. **Made it run locally**
   - `npm install` failed because `esbuild` was pinned to `^0.25.0`; Vite 8 needs `^0.28`. Changed it to `^0.28.0` in `package.json`.
   - Verified the project type-checks and builds.
2. **Windows launch tooling:** `start.bat`, `start.sh`, `run-server.bat`, `start-hidden.vbs`, `install-autostart.bat`, `uninstall-autostart.bat`.
3. **Removed features (requested by owner)**
   - My Day dashboard widgets: **Weather**, **World Clock**, **Currently Reading**.
   - The hard-coded weather box on the Daily Briefing page, and the "Weather" wording in the global search command for it.
4. **Fixed the Dashboard Widget Marketplace (My Day → "Widget Marketplace")**
   - Show/hide checkboxes work as before.
   - Move up/down now really changes the dashboard order (each widget is wrapped in `WidgetSlot`, which applies the saved `order`).
   - Normal/Wide now applies to every widget (it only worked for Today's Tasks before).
   - Added `DEFAULT_WIDGETS` in `MyDayView.tsx`. Saved layouts are merged with it on load: unknown or removed widget IDs are dropped and missing ones are added back.
   - Removed three entries that were listed but never implemented: `miniCalendar`, `studyProgress`, `weeklyOverview`.
   - Added `dailyChecklist` to the default list in `sampleData.ts` (it was missing, so it could be hidden on a fresh install).
   - `sampleData.ts` defaults now match `DEFAULT_WIDGETS`.
5. **Improved notifications and finance currency**
   - Reminder-enabled tasks and events now create a saved notification on their due date; birthdays create one according to the selected reminder preference.
   - Clicking a saved notification marks it read and opens its related page. Browser notifications are sent when permission is granted and enabled.
   - Currency selection is in Settings and persists across sessions. Finance, dashboard budget summary, savings, subscriptions, and wishlist amounts use the selected display currency; existing numbers are not converted.
   - The Finance page's net cashflow icon displays the selected currency symbol.
6. **Added sidebar customization in Settings**
   - Settings can hide or restore whole optional sidebar sections, including Growth & Career.
   - Each section's individual modules can also be shown or hidden without deleting their data.
7. **Added productivity and content tools**
   - Kanban task cards can be dragged between To Do, In Progress, and Completed; changes use the existing persisted task status.
   - Header shortcuts display `⌘K` / `⌘⌥N` on Mac and `Ctrl+K` / `Ctrl+Alt+N` on Windows.
   - Document Vault records can store and open image/PDF attachments locally in IndexedDB (10 MB per file, 20 MB per record).
   - Added 300 original money, productivity, and motivation quotes in `src/data/quotes.ts`; Daily Reflection and Daily Briefing select a random quote on view load and avoid repeating the last quote after refresh.
   - Notes and journal editors have toolbar actions for bold, italic, bullet/numbered lists, and Markdown tables, with formatted preview in both the inline editor and note modal.
8. **Published to GitHub**
   - Created the public `amanhari10/DayFlow` repository and pushed the project to `main`.
   - Configured automatic push after each local commit using `.githooks/post-commit`.
   - Replaced the original AI Studio README with DayFlow setup, data-storage, and sync instructions.
9. **Task dates, overdue actions, links, footer, and quotes**
   - Quick Add refreshes a new task's due date from the local system date each time the modal opens. The full task form also defaults to the current local date.
   - Each overdue task on My Day has a **Move to today** action.
   - Added persistent user-managed Quick Links on the dashboard and in the sidebar, with a Settings toggle to hide the sidebar links.
   - Added an app footer crediting Aman and linking to LinkedIn, Instagram, and GitHub.
   - Quote sections now display only the quote and its attribution. The generated originals are attributed to DayFlow; category labels are not displayed.
   - Browser-checked task date, overdue rescheduling, Quick Links add/sidebar visibility, footer links, and quote display on an isolated local origin.
10. **Calendar event deletion**
   - Existing events can be deleted from the event edit dialog, with a confirmation prompt and visible error feedback if deletion fails.
11. **Theme-aware pickers and task shortcut**
   - Native date/time picker controls follow the app's light/dark theme and accent color.
   - Quick Add uses `Ctrl+Alt+N` on Windows and `⌘⌥N` on Mac to avoid browser new-window shortcuts.

## Current dashboard widget IDs
`todayTasks`, `dailyProgress`, `dailyQuote`, `upcomingEvents`, `upcomingBirthdays`, `habitOverview`, `goalProgress`, `budgetOverview`, `fitnessSummary`, `dailyChecklist`, `upcomingTrips`, `focusTimer`, `overdueTasks` (banner above the grid), `quickNotes`, `quickLinks`.

To add a new widget: add it to `DEFAULT_WIDGETS` and to the defaults in `sampleData.ts`, then render it in the MyDayView grid inside `{isWidgetVisible('id') && (<WidgetSlot order={getWidgetOrder('id')} wide={getWidgetSize('id') === 'wide'}> ... </WidgetSlot>)}`.

## Left to do / open items
- Kanban dragging, Settings section visibility, currency display, quote refresh, and Markdown preview have been browser-checked.
- Manually test image/PDF upload and reopening in the Document Vault; the upload flow has not been manually browser-tested.
- Mac shortcut labels have not been visually checked on a Mac; Windows labels were checked in the Windows environment.
- **Reading module** (sidebar page) is still present. Only the dashboard "Currently Reading" widget was removed. Remove the page if the owner wants.
- Optional: build real versions of the three removed placeholder widgets (Mini Calendar, Study Progress, Weekly Activity).
- The new Settings visibility controls hide pages from the sidebar but retain their code and data. Permanently removing modules would be a separate change.
- Unused or unneeded leftovers: `GEMINI_API_KEY` and `.env.example` (no code reads the key), `@google/genai`, `express`, `dotenv` dependencies, and `metadata.json` from AI Studio. Safe to clean up if wanted.
- Not done: a data export/import backup (check Settings for an existing one first), since all data lives only in the browser.
- Build prints a bundle-size warning (~760 KB JS); harmless for local use.

## Working rules for next time
- Read this file, then check the code before changing it.
- After edits, run `npx tsc --noEmit` and `npx vite build`.
- Deliver either the full project zip or just the changed files, and update this file's "Done" and "Left to do" sections.
