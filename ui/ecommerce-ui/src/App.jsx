import { useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout";
import CreateProductPage from "./pages/CreateProductPage";
import InventoryCheckPage from "./pages/InventoryCheckPage";
import PlaceOrderPage from "./pages/PlaceOrderPage";
import ProductListPage from "./pages/ProductListPage";

function App({ keycloak }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    setCartItems((previous) => {
      const existing = previous.find((item) => item.id === product.id);
      if (existing) {
        return previous.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [
        ...previous,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          quantity: 1,
        },
      ];
    });
  };

  const updateCartItemQuantity = (productId, quantity) => {
    const safeQuantity = Math.max(1, Number(quantity));
    setCartItems((previous) =>
      previous.map((item) => (item.id === productId ? { ...item, quantity: safeQuantity } : item))
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((previous) => previous.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartSummary = useMemo(() => {
    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    return { totalItems, totalPrice };
  }, [cartItems]);

  if (!keycloak || !keycloak.tokenParsed) {
    return <div className="loading">Loading authentication...</div>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout
            keycloak={keycloak}
            cartItems={cartItems}
            cartSummary={cartSummary}
            addToCart={addToCart}
            updateCartItemQuantity={updateCartItemQuantity}
            removeFromCart={removeFromCart}
            clearCart={clearCart}
          />
        }
      >
        <Route
          index
          element={<Navigate to="/shop" replace />}
        />
        <Route path="products" element={<ProductListPage />} />
        <Route path="products/create" element={<CreateProductPage />} />
        <Route path="orders/create" element={<PlaceOrderPage />} />
        <Route path="shop" element={<ProductListPage />} />
        <Route path="checkout" element={<PlaceOrderPage />} />
        <Route path="inventory/check" element={<InventoryCheckPage />} />
        <Route path="*" element={<Navigate to="/shop" replace />} />
      </Route>
    </Routes>
  );
}

export default App;