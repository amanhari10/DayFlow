@echo off
cd /d "%~dp0"
if not exist node_modules call npm install
call npm run build
call npx vite preview --port 3000 --host 127.0.0.1 --strictPort --open
