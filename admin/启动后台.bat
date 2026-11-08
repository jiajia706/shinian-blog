@echo off
chcp 65001 >nul
cd /d "C:/Users/Administrator/WorkBuddy/2026-11-01-16-44-20/shinian-blog"
echo 正在启动十年博客发布后台…
node admin/admin-server.js
pause
