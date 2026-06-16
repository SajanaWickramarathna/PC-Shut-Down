@echo off
set "SCRIPT_DIR=%~dp0"
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SHORTCUT_NAME=PCRemoteService.lnk"
set "VBS_PATH=%SCRIPT_DIR%start-hidden.vbs"

echo Creating startup shortcut...

powershell -Command "$wshell = New-Object -ComObject WScript.Shell; $shortcut = $wshell.CreateShortcut('%STARTUP_FOLDER%\%SHORTCUT_NAME%'); $shortcut.TargetPath = 'wscript.exe'; $shortcut.Arguments = '\"%VBS_PATH%\"'; $shortcut.WorkingDirectory = '%SCRIPT_DIR%'; $shortcut.Save()"

echo Startup shortcut created successfully!
echo PC Remote Service will now start automatically in the background when you log in.
pause
