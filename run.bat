@echo off
:: Get the directory where this script is located (includes trailing slash)
set "BASE_DIR=%~dp0"

start "Service Registry" /D "%BASE_DIR%service-registry" /min cmd /k "mvn spring-boot:run"

start "Api Gateway" /D "%BASE_DIR%api-gateway" /min cmd /k "docker compose up -d && timeout /t 20 /nobreak && mvn spring-boot:run"

start "Inv Service" /D "%BASE_DIR%inventory-service" /min cmd /k "docker compose up -d && timeout /t 20 /nobreak && mvn spring-boot:run"

start "Order Service" /D "%BASE_DIR%order-service" /min cmd /k "docker compose up -d && timeout /t 20 /nobreak && mvn spring-boot:run"

start "Product Service" /D "%BASE_DIR%product-service" /min cmd /k "docker compose up -d && timeout /t 20 /nobreak && mvn spring-boot:run"