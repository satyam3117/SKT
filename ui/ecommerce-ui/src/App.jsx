import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout";
import CreateProductPage from "./pages/CreateProductPage";
import InventoryCheckPage from "./pages/InventoryCheckPage";
import PlaceOrderPage from "./pages/PlaceOrderPage";
import ProductListPage from "./pages/ProductListPage";

function App({ keycloak }) {
  if (!keycloak || !keycloak.tokenParsed) {
    return <div className="loading">Loading authentication...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout keycloak={keycloak} />}>
        <Route index element={<Navigate to="/products" replace />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="products/create" element={<CreateProductPage />} />
        <Route path="orders/create" element={<PlaceOrderPage />} />
        <Route path="inventory/check" element={<InventoryCheckPage />} />
        <Route path="*" element={<Navigate to="/products" replace />} />
      </Route>
    </Routes>
  );
}

export default App;