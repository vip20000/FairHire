# Stop Django Backend
Get-Process | Where-Object {$_.ProcessName -eq "python" -and $_.Path -like "*fairhire_backend_dev*"} | Stop-Process -Force

# Stop Proctoring Service
Get-Process | Where-Object {$_.ProcessName -eq "python" -and $_.Path -like "*proctoring_service*"} | Stop-Process -Force

# Stop Qgen Service
Get-Process | Where-Object {$_.ProcessName -eq "python" -and $_.Path -like "*qgen_service*"} | Stop-Process -Force

# Stop React Frontend
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force

# Stop all extra PowerShell windows
Get-Process | Where-Object {$_.ProcessName -eq "powershell"} | Stop-Process -Force
