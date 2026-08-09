@echo off
:: Get the directory where this script is located (includes trailing slash)
set "BASE_DIR=%~dp0"

echo ===================================================
echo   Starting Infrastructure (MySQL, MongoDB, etc.)
echo ===================================================

:: Spin up Docker containers for all services that have a docker-compose.yml
echo Starting Docker containers...
start "Docker - Api Gateway" /D "%BASE_DIR%api-gateway" /wait cmd /c "docker compose up -d"
start "Docker - Inv Service" /D "%BASE_DIR%inventory-service" /wait cmd /c "docker compose up -d"
start "Docker - Order Service" /D "%BASE_DIR%order-service" /wait cmd /c "docker compose up -d"
start "Docker - Product Service" /D "%BASE_DIR%product-service" /wait cmd /c "docker compose up -d"
start "Docker - User Service" /D "%BASE_DIR%user-service" /wait cmd /c "docker compose up -d"

echo.
echo Waiting 25 seconds for MySQL & MongoDB to fully initialize...
timeout /t 25 /nobreak

echo.
echo ===================================================
echo   Launching Microservices
echo ===================================================

start "Service Registry" /D "%BASE_DIR%service-registry" /min cmd /k "mvn spring-boot:run"

:: Small delay to let Eureka Registry start first
timeout /t 10 /nobreak

start "Api Gateway" /D "%BASE_DIR%api-gateway" /min cmd /k "mvn spring-boot:run"
start "Inv Service" /D "%BASE_DIR%inventory-service" /min cmd /k "mvn spring-boot:run"
start "Order Service" /D "%BASE_DIR%order-service" /min cmd /k "mvn spring-boot:run"
start "Product Service" /D "%BASE_DIR%product-service" /min cmd /k "mvn spring-boot:run"
start "Notification Service" /D "%BASE_DIR%notification-service" /min cmd /k "mvn spring-boot:run"
start "User Service" /D "%BASE_DIR%user-service" /min cmd /k "mvn spring-boot:run"

echo All services dispatched!