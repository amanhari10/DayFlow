# DayFlow

DayFlow is a local-first personal productivity and life-management dashboard built with React, TypeScript, and Vite. It includes daily planning, tasks, calendar, habits, notes, focus tools, finance, and other personal modules.

## Data and privacy

DayFlow stores its data in the browser's IndexedDB. There is no app backend. Use the same browser origin each time (by default, `http://localhost:3000`) to access the same local data.

## Run locally

**Prerequisite:** Node.js LTS

```powershell
npm install
npm run dev -- --host 127.0.0.1
```

Open [http://localhost:3000](http://localhost:3000).

To create and preview a production build:

```powershell
npx vite build
npx vite preview --host 127.0.0.1 --port 3000 --strictPort
```

The Windows `run-server.bat` script builds the app if needed and serves it on port 3000. `install-autostart.bat` and `uninstall-autostart.bat` manage optional Windows sign-in startup.

## GitHub sync

This working copy is configured to push to GitHub after each successful commit. Saving a file alone does not publish it; commit your changes first. After cloning the repository on another computer, enable the same behavior with:

```powershell
git config core.hooksPath .githooks
```

To disable automatic pushing in a working copy:

```powershell
git config --unset core.hooksPath
```

## Checks

```powershell
npx tsc --noEmit
npx vite build
```
