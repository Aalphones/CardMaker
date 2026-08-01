@echo off
rem ==========================================================================
rem  CardMaker - hochladen per Doppelklick.
rem    deploy.cmd            Backend und Frontend
rem    deploy.cmd backend    nur das Backend
rem    deploy.cmd frontend   nur das Frontend
rem ==========================================================================
setlocal
chcp 65001 >nul
title CardMaker Deploy
cd /d "%~dp0"

set "TARGET=%~1"
if not defined TARGET set "TARGET=all"

if /i "%TARGET%"=="all" goto :targetOk
if /i "%TARGET%"=="backend" goto :targetOk
if /i "%TARGET%"=="frontend" goto :targetOk
echo [FEHLER] Unbekanntes Ziel "%TARGET%".
echo          Erlaubt sind: backend, frontend, oder gar keine Angabe.
goto :fail

:targetOk
if exist "deploy.env" goto :configFound
echo [FEHLER] Die Datei deploy.env fehlt.
echo          Kopiere deploy.env.example nach deploy.env und trage deine
echo          Zugangsdaten ein.
goto :fail

:configFound
rem Einlesen bewusst ohne "delayed expansion": die wuerde ein Ausrufezeichen
rem im Passwort verschlucken. Ab dem setlocal darunter ist sie an, damit
rem Werte mit & | < > beim Schreiben nicht als Befehle gelesen werden.
for /f "usebackq eol=# tokens=1,* delims==" %%A in ("deploy.env") do set "%%A=%%B"

setlocal enabledelayedexpansion

if not defined FRONTEND_DIST set "FRONTEND_DIST=frontend\dist\frontend\browser"

set "MISSING="
call :needValue WINSCP_PATH
call :needValue SFTP_PROTOCOL
call :needValue SFTP_HOST
call :needValue SFTP_USER
call :needValue SFTP_PASSWORD
call :needValue REMOTE_API_PATH
call :needValue REMOTE_APP_PATH
call :needValue DB_HOST
call :needValue DB_NAME
call :needValue DB_USER
call :needValue DB_PASSWORD
call :needValue MIGRATE_TOKEN
call :needValue CORS_ORIGINS
call :needValue PUBLIC_BASE_URL
call :needValue UPLOAD_MAX_BYTES
if defined MISSING goto :fail

if exist "!WINSCP_PATH!" goto :winscpFound
echo [FEHLER] WinSCP wurde nicht gefunden:
echo          !WINSCP_PATH!
echo          Gebraucht wird WinSCP.com aus dem portablen Paket, nicht WinSCP.exe.
goto :fail

:winscpFound
if /i not "!SFTP_PROTOCOL!"=="sftp" goto :protocolOk
if defined SFTP_HOSTKEY goto :protocolOk
echo [FEHLER] SFTP_HOSTKEY fehlt in deploy.env.
echo          WinSCP einmal von Hand starten, verbinden, den angezeigten
echo          Fingerabdruck in deploy.env eintragen.
goto :fail

:protocolOk
set "DO_BACKEND="
set "DO_FRONTEND="
if /i "!TARGET!"=="all" set "DO_BACKEND=1"
if /i "!TARGET!"=="all" set "DO_FRONTEND=1"
if /i "!TARGET!"=="backend" set "DO_BACKEND=1"
if /i "!TARGET!"=="frontend" set "DO_FRONTEND=1"

if not defined DO_FRONTEND goto :frontendReady
if exist "frontend\package.json" goto :buildFrontend
echo [HINWEIS] Es gibt noch kein Frontend - dieser Teil wird ausgelassen.
set "DO_FRONTEND="
goto :frontendReady

:buildFrontend
echo [1/4] Frontend bauen ...
call npm --prefix frontend run build
if errorlevel 1 (
    echo [FEHLER] Der Frontend-Build ist fehlgeschlagen. Es wird nichts hochgeladen.
    goto :fail
)
if exist "!FRONTEND_DIST!" goto :frontendReady
echo [FEHLER] Der gebaute Ordner fehlt:
echo          !FRONTEND_DIST!
echo          Trage in deploy.env unter FRONTEND_DIST den echten Ausgabepfad ein.
goto :fail

:frontendReady
if defined DO_BACKEND goto :writeEnv
if defined DO_FRONTEND goto :writeScript
echo [FEHLER] Es bleibt nichts zu tun.
goto :fail

:writeEnv
echo [2/4] backend\.env schreiben ...
> "backend\.env" echo DB_HOST=!DB_HOST!
>>"backend\.env" echo DB_NAME=!DB_NAME!
>>"backend\.env" echo DB_USER=!DB_USER!
>>"backend\.env" echo DB_PASSWORD=!DB_PASSWORD!
>>"backend\.env" echo MIGRATE_TOKEN=!MIGRATE_TOKEN!
>>"backend\.env" echo CORS_ORIGINS=!CORS_ORIGINS!
>>"backend\.env" echo PUBLIC_BASE_URL=!PUBLIC_BASE_URL!
>>"backend\.env" echo UPLOAD_MAX_BYTES=!UPLOAD_MAX_BYTES!

:writeScript
set "WINSCP_SCRIPT=%TEMP%\cardmaker-deploy-%RANDOM%%RANDOM%.txt"
> "!WINSCP_SCRIPT!" echo option batch abort
>>"!WINSCP_SCRIPT!" echo option confirm off
>>"!WINSCP_SCRIPT!" echo option transfer binary
rem Zugangsdaten bewusst als eigene Schalter, nicht in der Adresse: ein # oder /
rem im Passwort wuerde die Adresse zerschneiden, ein | sogar die Skriptzeile.
if /i "!SFTP_PROTOCOL!"=="sftp" goto :openSftp
>>"!WINSCP_SCRIPT!" echo open !SFTP_PROTOCOL!://!SFTP_HOST!/ -username="!SFTP_USER!" -password="!SFTP_PASSWORD!"
goto :openWritten
:openSftp
>>"!WINSCP_SCRIPT!" echo open sftp://!SFTP_HOST!/ -username="!SFTP_USER!" -password="!SFTP_PASSWORD!" -hostkey="!SFTP_HOSTKEY!"
:openWritten

if defined DO_BACKEND (
    >>"!WINSCP_SCRIPT!" echo synchronize remote -delete -filemask="|uploads/;.env.example;storage/logs/" "backend" "!REMOTE_API_PATH!"
)
if defined DO_FRONTEND (
    >>"!WINSCP_SCRIPT!" echo synchronize remote -delete "!FRONTEND_DIST!" "!REMOTE_APP_PATH!"
)
>>"!WINSCP_SCRIPT!" echo close
>>"!WINSCP_SCRIPT!" echo exit

echo [3/4] Verbinden und hochladen ...
"!WINSCP_PATH!" /ini=nul /script="!WINSCP_SCRIPT!"
set "WINSCP_EXIT=!ERRORLEVEL!"
del "!WINSCP_SCRIPT!" >nul 2>&1

if "!WINSCP_EXIT!"=="0" goto :done
echo.
echo [FEHLER] WinSCP hat abgebrochen, Code !WINSCP_EXIT!.
echo          Der Server ist eventuell nur halb aktualisiert.
echo          Meist liegt es am Passwort, am Fingerabdruck oder an einem
echo          falschen Zielpfad in deploy.env.
goto :fail

:done
echo.
echo [4/4] Fertig, alles ist oben.
if defined DO_BACKEND echo          Backend  nach !REMOTE_API_PATH!
if defined DO_FRONTEND echo          Frontend nach !REMOTE_APP_PATH!
echo.
pause
exit /b 0

:fail
echo.
pause
exit /b 1

:needValue
if not defined %~1 (
    echo [FEHLER] In deploy.env fehlt ein Wert: %~1
    set "MISSING=1"
)
exit /b 0
