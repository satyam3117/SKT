import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/shop", label: "Shop" },
  { to: "/checkout", label: "Cart & Checkout" },
  { to: "/admin/products", label: "Admin: Products" },
  { to: "/inventory/check", label: "Inventory Lookup" },
];

function Layout({
  keycloak,
  cartItems,
  cartSummary,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
}) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-block">
          <span className="brand">SKT Mart</span>
          <p className="subtitle">Amazon-style storefront powered by your existing microservice endpoints.</p>
        </div>
        <div className="header-actions">
          <span className="user-pill">{keycloak?.tokenParsed?.preferred_username || "Authenticated user"}</span>
          <NavLink to="/checkout" className="cart-pill">
            Cart ({cartSummary.totalItems}) - ${cartSummary.totalPrice.toFixed(2)}
          </NavLink>
          <button type="button" onClick={() => keycloak.logout()}>
            Logout
          </button>
        </div>
      </header>

      <nav className="main-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <main className="content-area">
        <Outlet
          context={{
            keycloak,
            cartItems,
            cartSummary,
            addToCart,
            updateCartItemQuantity,
            removeFromCart,
            clearCart,
          }}
        />
      </main>
    </div>
  );
}

export default Layout;
