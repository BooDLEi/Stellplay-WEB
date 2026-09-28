@echo off
chcp 65001 > nul
title StellPlay Mobile Server (Port 8280)
echo ============================================================
echo  [StellPlay Mobile] 모바일 전용 서버 실행 중...
echo ============================================================
python mobile_server.py
pause
