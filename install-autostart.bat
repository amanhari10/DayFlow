@echo off
powershell -NoProfile -Command "$s=(New-Object -ComObject WScript.Shell).CreateShortcut([Environment]::GetFolderPath('Startup')+'\DayFlow.lnk'); $s.TargetPath='%~dp0start-hidden.vbs'; $s.WorkingDirectory='%~dp0'; $s.Save()"
echo DayFlow will now start automatically when you sign in to Windows.
echo Starting it now... open http://localhost:3000 in a few seconds.
wscript "%~dp0start-hidden.vbs"
pause
