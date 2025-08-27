@echo off
:: This file automatically runs the setup with admin privileges

echo Requesting Administrator privileges...
PowerShell -Command "Start-Process '%~dp0setup_database_no_password.bat' -Verb RunAs"