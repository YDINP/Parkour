@echo off
chcp 65001 > nul
echo ================================
echo   TSV to JSON Converter
echo ================================
echo.

cd /d "%~dp0"
node tsv-to-json.js

echo.
echo Done! Press any key to exit...
pause > nul
