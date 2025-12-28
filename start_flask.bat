@echo off
echo Iniciando servidor Flask...
echo.
echo Certifique-se de que o arquivo .env esta configurado corretamente!
echo.

REM Usa o Python do ambiente virtual se existir; caso contrário, cai para o Python global.
SETLOCAL
SET VENV_PY=%~dp0.venv\Scripts\python.exe

IF EXIST "%VENV_PY%" (
	echo Usando venv: %VENV_PY%
	"%VENV_PY%" app.py
) ELSE (
	echo Venv nao encontrado, usando python global...
	python app.py
)

ENDLOCAL
pause

