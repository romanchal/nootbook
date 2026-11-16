@echo off
setlocal EnableDelayedExpansion
title Nootbook Server [cmd.exe]
cd /d "%~dp0"

echo =====================================================================
echo                NOOTBOOK - WINDOWS CMD LAUNCHER                       
echo =====================================================================
echo.
echo [1/3] Checking environment...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found in PATH!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo [2/3] Opening browser at http://localhost:3000 ...
start "" "http://localhost:3000"

echo [3/3] Starting development server...
echo.
echo ---------------------------------------------------------------------
echo  Local URL : http://localhost:3000
echo  Console   : Windows Command Prompt (cmd.exe)
echo  To Stop   : Press Ctrl+C in this window
echo ---------------------------------------------------------------------
echo.

call pnpm dev
if %errorlevel% neq 0 (
    echo [INFO] Trying npm run dev...
    call npm run dev
)

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] The server stopped unexpectedly.
    pause
)
