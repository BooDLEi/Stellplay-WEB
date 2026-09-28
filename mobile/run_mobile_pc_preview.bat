@echo off
chcp 65001 > nul
title StellPlay Mobile (PC 모니터링)
cd /d "%~dp0"
python mobile_simulator.py
pause
