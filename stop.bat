@echo off
setlocal enabledelayedexpansion

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

cd /d "D:\SAI\SKT\api-gateway"
echo Stopping Api Gateway Docker...
docker compose down

cd /d "D:\SAI\SKT\inventory-service"
echo Stopping Inventory Service Docker...
docker compose down

cd /d "D:\SAI\SKT\order-service"
echo Stopping Order Service Docker...
docker compose down

cd /d "D:\SAI\SKT\product-service"
echo Stopping Product Service Docker...
docker compose down

echo.
echo All services stopped successfully!
pause