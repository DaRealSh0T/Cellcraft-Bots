@echo off

node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed. Please download and install it from https://nodejs.org/
    pause
    exit /b 
)

if not exist node_modules (

    pnpm -v >nul 2>&1
    if %errorlevel% equ 0 (
        echo Using pnpm to install dependencies.
        pnpm install
    ) else (
      yarn version >nul 2>&1
      if %errorlevel% equ 0 (
          echo Using Yarn to install dependencies.
          yarn install
      ) else (
          echo Using npm to install dependencies.
          npm install
      )
    )

    echo Dependencies installed successfully.
)

node src/ 
pause