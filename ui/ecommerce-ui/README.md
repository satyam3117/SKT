# SKT Ecommerce UI

This frontend is a marketplace-style UI (Amazon/Flipkart inspired) built on top of your existing backend APIs through API Gateway.

## Features

- Storefront catalog with search, category filter, and price sorting
- Product cards and add-to-cart flow
- Cart + checkout page with quantity editing and order summary
- Pre-check stock with inventory API before placing order
- Seller utility pages for creating products and manual inventory lookup
- Keycloak-authenticated API calls via gateway

## Backend Endpoint Mapping

- `GET /api/product` -> product catalog in `shop`
- `POST /api/product` -> seller page `products/create`
- `GET /api/inventory` -> inventory check page and checkout stock validation
- `POST /api/order` -> checkout order placement

## Quick Start

Run these commands in this folder (`ui/ecommerce-ui`):

```powershell
npm install
npm run dev
```

## Production Build Check

```powershell
npm run build
```

## Notes

- UI expects API Gateway at `http://localhost:7070` and Keycloak at `http://localhost:8181`.
- Checkout places one order request per cart item because the current order API accepts a single item payload (`OrderRequest`).
