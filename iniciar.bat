@echo off
chcp 65001 > nul
echo ========================================================
echo   AgendaMix — Plataforma de Agendamento Online
echo ========================================================
echo.
echo Iniciando o Backend (Node.js + Express + MySQL) na porta 5000...
start cmd /k "cd backend && npm run dev"

echo.
echo Iniciando o Frontend (React + Vite) na porta 5173...
start cmd /k "cd frontend && npm run dev"

echo.
echo Aplicação em execução!
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:5000/api
echo.
pause
