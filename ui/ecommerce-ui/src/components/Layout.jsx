import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/products", label: "Product Catalog" },
  { to: "/products/create", label: "Create Product" },
  { to: "/orders/create", label: "Place Order" },
  { to: "/inventory/check", label: "Check Inventory" },
];

function Layout({ keycloak }) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>SKT Ecommerce Console</h1>
          <p className="subtitle">Frontend screens for every backend controller endpoint.</p>
        </div>
        <div className="header-actions">
          <span className="user-pill">{keycloak?.tokenParsed?.preferred_username || "Authenticated user"}</span>
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
        <Outlet context={{ keycloak }} />
      </main>
    </div>
  );
}

export default Layout;

