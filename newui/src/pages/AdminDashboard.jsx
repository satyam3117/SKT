import { Link } from "react-router-dom";
import {
    Boxes,
    ClipboardList,
    Package,
    Plus,
    RefreshCw,
    ShieldCheck,
    ShoppingBag,
    Warehouse,
    ArrowRight,
    LogOut,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";

const styles = {
    page: {
        minHeight: "100vh",
        background: "#f5f7fb",
        color: "#172033",
        fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    },
    header: {
        background: "#ffffff",
        borderBottom: "1px solid #e5e9f2",
        padding: "16px 5%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
    },
    brand: { display: "flex", alignItems: "center", gap: 12 },
    logo: {
        width: 42,
        height: 42,
        borderRadius: 12,
        background: "#172554",
        color: "#ffffff",
        display: "grid",
        placeItems: "center",
    },
    main: {
        width: "min(1180px, 90%)",
        margin: "0 auto",
        padding: "36px 0 56px",
    },
    eyebrow: {
        color: "#64748b",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
    },
    title: { fontSize: "clamp(28px, 4vw, 38px)", margin: "8px 0", letterSpacing: "-0.04em" },
    subtitle: { color: "#64748b", lineHeight: 1.7, margin: 0, maxWidth: 720 },
    sectionTitle: { fontSize: 19, margin: "32px 0 16px" },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
        gap: 18,
    },
    card: {
        background: "#ffffff",
        border: "1px solid #e5e9f2",
        borderRadius: 16,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        boxShadow: "0 4px 18px rgba(15, 23, 42, 0.035)",
    },
    iconBox: {
        width: 46,
        height: 46,
        borderRadius: 12,
        background: "#eef2ff",
        color: "#3730a3",
        display: "grid",
        placeItems: "center",
    },
    cardTitle: { fontSize: 18, margin: 0 },
    cardText: { color: "#64748b", lineHeight: 1.65, margin: 0, flex: 1 },
    link: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "11px 14px",
        borderRadius: 10,
        background: "#172554",
        color: "#ffffff",
        textDecoration: "none",
        fontWeight: 650,
        fontSize: 14,
    },
    secondaryLink: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 13px",
        border: "1px solid #dbe2ee",
        borderRadius: 10,
        color: "#334155",
        background: "#ffffff",
        textDecoration: "none",
        fontWeight: 600,
        fontSize: 14,
    },
    panel: {
        marginTop: 24,
        background: "#ffffff",
        border: "1px solid #e5e9f2",
        borderRadius: 16,
        padding: 22,
    },
    infoGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))",
        gap: 16,
    },
    infoLabel: { color: "#64748b", fontSize: 12, marginBottom: 6 },
    infoValue: { color: "#172033", fontSize: 14, fontWeight: 650, overflowWrap: "anywhere" },
    badge: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        borderRadius: 999,
        padding: "6px 10px",
        background: "#ecfdf5",
        color: "#047857",
        fontSize: 12,
        fontWeight: 700,
    },
};

function AdminCard({ icon: Icon, title, description, to, actionLabel }) {
    return (
        <article style={styles.card}>
            <div style={styles.iconBox}>
                <Icon size={23} />
            </div>
            <h2 style={styles.cardTitle}>{title}</h2>
            <p style={styles.cardText}>{description}</p>
            <Link to={to} style={styles.link}>
                <span>{actionLabel}</span>
                <ArrowRight size={17} />
            </Link>
        </article>
    );
}

export default function AdminDashboard() {
    const { user, roles, logout, ready, authenticated, isAdmin } = useAuth();

    const username =
        user?.username ||
        user?.preferred_username ||
        user?.name ||
        "Admin user";

    const email = user?.email || "No email available";
    const roleList = Array.isArray(roles) ? roles : [];

    if (!ready) {
        return (
            <main style={{ ...styles.page, display: "grid", placeItems: "center", padding: 24 }}>
                <p>Checking your administrator session…</p>
            </main>
        );
    }

    if (!authenticated) {
        return (
            <main style={{ ...styles.page, display: "grid", placeItems: "center", padding: 24 }}>
                <section style={styles.card}>
                    <h1 style={styles.cardTitle}>Sign-in required</h1>
                    <p style={styles.cardText}>Sign in with your Keycloak account to access the administration area.</p>
                    <Link to="/login" style={styles.link}>Go to sign in</Link>
                </section>
            </main>
        );
    }

    if (!isAdmin) {
        return (
            <main style={{ ...styles.page, display: "grid", placeItems: "center", padding: 24 }}>
                <section style={{ ...styles.card, maxWidth: 520, width: "100%" }}>
                    <div style={styles.iconBox}><ShieldCheck size={23} /></div>
                    <h1 style={styles.cardTitle}>Administrator access required</h1>
                    <p style={styles.cardText}>
                        Your account is signed in, but the application has not identified the ADMIN role.
                        Ask your Keycloak administrator to assign the role, then sign in again.
                    </p>
                    <p style={{ ...styles.cardText, fontSize: 13 }}>
                        Detected roles: {roleList.length ? roleList.join(", ") : "None"}
                    </p>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <Link to="/" style={styles.secondaryLink}>Return to store</Link>
                        <button
                            type="button"
                            onClick={() => logout()}
                            style={{ ...styles.link, border: 0, cursor: "pointer" }}
                        >
                            <LogOut size={16} /> Sign out
                        </button>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <div style={styles.page}>
            <header style={styles.header}>
                <div style={styles.brand}>
                    <div style={styles.logo}><ShoppingBag size={23} /></div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 18 }}>SKT Admin</div>
                        <div style={{ color: "#64748b", fontSize: 12 }}>SaiKripaTraders · Store operations</div>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <span style={styles.badge}><ShieldCheck size={14} /> Administrator</span>
                    <Link to="/" style={styles.secondaryLink}>View storefront</Link>
                    <button
                        type="button"
                        onClick={() => logout()}
                        style={{ ...styles.secondaryLink, cursor: "pointer" }}
                    >
                        <LogOut size={16} /> Sign out
                    </button>
                </div>
            </header>

            <main style={styles.main}>
                <div style={styles.eyebrow}>Administration workspace</div>
                <h1 style={styles.title}>Store operations</h1>
                <p style={styles.subtitle}>
                    Manage your product catalogue and inventory from one place. Product changes should
                    go through the product service, while stock changes should use the inventory service.
                </p>

                <h2 style={styles.sectionTitle}>Catalogue and inventory</h2>
                <div style={styles.grid}>
                    <AdminCard
                        icon={Package}
                        title="Product management"
                        description="Create products, review the catalogue, update product details, manage images, and remove products when appropriate."
                        to="/admin/products"
                        actionLabel="Manage products"
                    />
                    <AdminCard
                        icon={Plus}
                        title="Add a product"
                        description="Start a new product entry for a laptop, desktop, component, or another supported product type."
                        to="/admin/products/new"
                        actionLabel="Create product"
                    />
                    <AdminCard
                        icon={Warehouse}
                        title="Inventory management"
                        description="Use the inventory workspace to review stock levels and manage quantity changes separately from product details."
                        to="/admin/inventory"
                        actionLabel="Manage inventory"
                    />
                    <AdminCard
                        icon={Package}
                        title="Product brands"
                        description="Create and maintain brands such as ASUS, MSI, Dell, HP, and Lenovo."
                        to="/admin/brands"
                        actionLabel="Manage brands"
                    />

                    <AdminCard
                        icon={ClipboardList}
                        title="Product categories"
                        description="Create root categories and nested categories for laptops, GPUs, storage, peripherals, and other products."
                        to="/admin/categories"
                        actionLabel="Manage categories"
                    />
                </div>

                <section style={styles.panel}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                        <ClipboardList size={20} />
                        <h2 style={{ fontSize: 18, margin: 0 }}>Administrator session</h2>
                    </div>

                    <div style={styles.infoGrid}>
                        <div>
                            <div style={styles.infoLabel}>Signed-in user</div>
                            <div style={styles.infoValue}>{username}</div>
                        </div>
                        <div>
                            <div style={styles.infoLabel}>Email</div>
                            <div style={styles.infoValue}>{email}</div>
                        </div>
                        <div>
                            <div style={styles.infoLabel}>Assigned application roles</div>
                            <div style={styles.infoValue}>{roleList.length ? roleList.join(", ") : "No roles detected"}</div>
                        </div>
                        <div>
                            <div style={styles.infoLabel}>Session status</div>
                            <div style={styles.infoValue}>Authenticated</div>
                        </div>
                    </div>
                </section>

                <section style={{ ...styles.panel, background: "#f8fafc" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <RefreshCw size={19} />
                        <h2 style={{ fontSize: 16, margin: 0 }}>Operational note</h2>
                    </div>
                    <p style={{ ...styles.cardText, fontSize: 14 }}>
                        The admin UI is not a substitute for backend authorization. The gateway and each
                        relevant service must enforce administrator permissions for create, update, delete,
                        and inventory mutations.
                    </p>
                    <p style={{ ...styles.cardText, fontSize: 14, marginTop: 8 }}>
                        The product and inventory links will work once their corresponding pages and routes
                        are added to the application.
                    </p>
                </section>
            </main>
        </div>
    );
}
