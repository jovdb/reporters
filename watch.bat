@ECHO OFF

SET ORI_DIR=%CD%
CD %~dp0

REM update versions (after hg update)
CALL npm install

CALL gulp watch

CD /D %ORI_DIR%
