Set WshShell = CreateObject("WScript.Shell")
' Run the node index.js script silently (0 means hide window)
WshShell.Run "cmd.exe /c npm run dev", 0, False
