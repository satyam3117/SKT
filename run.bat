@echo off

start "Api Gateway" /D "D:\SAI\SKT\api-gateway" /min cmd /k "docker compose up -d && powershell -Command "Start-Sleep -s 20" && mvn spring-boot:run"

start "Inv Service" /D "D:\SAI\SKT\inventory-service" /min cmd /k "docker compose up -d && powershell -Command "Start-Sleep -s 20" && mvn spring-boot:run"

start "Order Service" /D "D:\SAI\SKT\order-service" /min cmd /k "docker compose up -d && powershell -Command "Start-Sleep -s 20" && mvn spring-boot:run"

start "Product Service" /D "D:\SAI\SKT\product-service" /min cmd /k "docker compose up -d && powershell -Command "Start-Sleep -s 20" && mvn spring-boot:run"
