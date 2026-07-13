@echo off
setlocal enabledelayedexpansion

:: Get the directory where this script is located (includes trailing slash)
set "BASE_DIR=%~dp0"

echo Stopping Spring Boot applications and Maven launchers...

:: 1. Kill the specific Spring Boot applications
for /f "tokens=1" %%a in ('jcmd ^| findstr /i "ApiGatewayApplication InventoryServiceApplication OrderServiceApplication ProductServiceApplication"') do (
    echo Killing application PID: %%a
    taskkill /F /PID %%a
)

:: 2. Kill the Maven launchers that started them
for /f "tokens=1" %%a in ('jcmd ^| findstr /i "spring-boot:run"') do (
    echo Killing Maven launcher PID: %%a
    taskkill /F /PID %%a
)

echo.
echo Stopping all Docker containers...

echo Stopping Api Gateway Docker...
docker compose --project-directory "%BASE_DIR%api-gateway" down

echo Stopping Inventory Service Docker...
docker compose --project-directory "%BASE_DIR%inventory-service" down

echo Stopping Order Service Docker...
docker compose --project-directory "%BASE_DIR%order-service" down

echo Stopping Product Service Docker...
docker compose --project-directory "%BASE_DIR%product-service" down

echo.
echo All services stopped successfully!
pause