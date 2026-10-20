
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Boxes, LoaderCircle, Search } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import {
    addStock,
    adjustInventory,
    checkAvailability,
    createInventory,
    getInventoryBySku,
} from "../services/inventoryApi";

const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    border: "1px solid #dbe2ee",
    borderRadius: 9,
    fontSize: 14,
    background: "#fff",
    color: "#172033",
};

const labelStyle = {
    display: "block",
    fontSize: 13,
    fontWeight: 650,
    marginBottom: 7,
    color: "#334155",
};

const panelStyle = {
    background: "#fff",
    border: "1px solid #e5e9f2",
    borderRadius: 14,
    padding: 22,
    marginTop: 18,
};

function errorMessage(error) {
    const data = error?.response?.data;
    if (typeof data === "string") return data;
    return data?.message || data?.detail || error?.message || "Request failed.";
}

export default function InventoryManagement() {
    const { getAccessToken } = useAuth();

    const [skuCode, setSkuCode] = useState("");
    const [warehouse, setWarehouse] = useState("KOLKATA-WH-01");
    const [quantity, setQuantity] = useState("1");
    const [reason, setReason] = useState("");
    const [availabilityQuantity, setAvailabilityQuantity] = useState("1");
    const [inventory, setInventory] = useState(null);
    const [availability, setAvailability] = useState(null);
    const [loading, setLoading] = useState(false);
    const [busyAction, setBusyAction] = useState("");
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    async function runAction(action, successMessage) {
        const sku = skuCode.trim();
        if (!sku) {
            setError("Enter a product SKU first.");
            return;
        }

        setLoading(true);
        setError("");
        setNotice("");

        try {
            const token = await getAccessToken();
            const result = await action(token);

            if (result && typeof result === "object" && "skuCode" in result) {
                setInventory(result);
            }

            setNotice(successMessage);

            // Refresh inventory after mutations; don't mask the mutation result
            // if the follow-up lookup fails.
            try {
                const refreshed = await getInventoryBySku(sku, token);
                setInventory(refreshed);
            } catch {
                // The operation may have succeeded even if refresh fails.
            }
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setLoading(false);
            setBusyAction("");
        }
    }

    async function lookup(event) {
        event.preventDefault();
        setAvailability(null);
        await runAction(
            (token) => getInventoryBySku(skuCode.trim(), token),
            "Inventory record loaded."
        );
    }

    async function submitCreate(event) {
        event.preventDefault();

        const initialQuantity = Number(quantity);
        if (!Number.isInteger(initialQuantity) || initialQuantity < 0) {
            setError("Initial quantity must be a whole number of zero or more.");
            return;
        }

        await runAction(
            (token) =>
                createInventory(
                    {
                        skuCode: skuCode.trim(),
                        quantity: initialQuantity,
                        reservedQuantity: 0,
                        availableQuantity: initialQuantity,
                        warehouse: warehouse.trim(),
                    },
                    token
                ),
            "Inventory record created."
        );
    }

    async function submitAddStock(event) {
        event?.preventDefault();

        const amount = Number(quantity);
        if (!Number.isInteger(amount) || amount <= 0) {
            setError("Quantity to add must be a positive whole number.");
            return;
        }

        setBusyAction("add");
        await runAction(
            (token) =>
                addStock(
                    skuCode.trim(),
                    { quantity: amount, warehouse: warehouse.trim() },
                    token
                ),
            "Stock addition request completed."
        );
    }

    async function submitAdjustment(event) {
        event.preventDefault();

        const amount = Number(quantity);
        if (!Number.isInteger(amount) || amount === 0) {
            setError("Adjustment must be a non-zero whole number. Use a negative number to reduce stock.");
            return;
        }
        if (!reason.trim()) {
            setError("Enter a reason for the adjustment.");
            return;
        }

        setBusyAction("adjust");
        await runAction(
            (token) =>
                adjustInventory(
                    skuCode.trim(),
                    { quantity: amount, reason: reason.trim() },
                    token
                ),
            "Stock adjustment request completed."
        );
    }

    async function submitAvailability(event) {
        event.preventDefault();

        const requested = Number(availabilityQuantity);
        if (!Number.isInteger(requested) || requested <= 0) {
            setError("Availability quantity must be a positive whole number.");
            return;
        }

        setLoading(true);
        setError("");
        setNotice("");
        setAvailability(null);

        try {
            const token = await getAccessToken();
            const result = await checkAvailability(skuCode.trim(), requested, token);
            setAvailability(result);
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setLoading(false);
        }
    }

    const cardButton = {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "11px 14px",
        borderRadius: 9,
        background: "#172554",
        color: "#fff",
        border: "1px solid #172554",
        fontWeight: 650,
        fontSize: 14,
        cursor: loading ? "wait" : "pointer",
        opacity: loading ? 0.65 : 1,
    };

    const secondaryButton = {
        ...cardButton,
        background: "#fff",
        color: "#334155",
        borderColor: "#dbe2ee",
    };

    const gridStyle = {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
        gap: 16,
    };

    return (
        <div style={{ minHeight: "100vh", background: "#f5f7fb", color: "#172033", fontFamily: "Inter, system-ui, sans-serif" }}>
            <header style={{ background: "#fff", borderBottom: "1px solid #e5e9f2", padding: "16px 5%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 42, height: 42, display: "grid", placeItems: "center", borderRadius: 12, background: "#eef2ff", color: "#3730a3" }}>
                        <Boxes size={22} />
                    </div>
                    <div>
                        <div style={{ fontSize: 18, fontWeight: 800 }}>Inventory management</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>SKT · Stock operations</div>
                    </div>
                </div>
                <Link to="/admin" style={{ ...secondaryButton, textDecoration: "none" }}><ArrowLeft size={16} /> Dashboard</Link>
            </header>

            <main style={{ width: "min(1000px, 92%)", margin: "0 auto", padding: "28px 0 48px" }}>
                <h1 style={{ fontSize: 30, letterSpacing: "-.04em", margin: "0 0 8px" }}>Stock control</h1>
                <p style={{ color: "#64748b", lineHeight: 1.6, marginTop: 0 }}>
                    Look up a stock record by SKU, add stock, record a quantity adjustment, or check availability.
                </p>

                {error && <div role="alert" style={{ padding: 14, borderRadius: 10, background: "#fff1f2", color: "#9f1239", border: "1px solid #fecdd3", marginTop: 16, whiteSpace: "pre-wrap" }}>{error}</div>}
                {notice && <div role="status" style={{ padding: 14, borderRadius: 10, background: "#ecfdf5", color: "#065f46", marginTop: 16 }}>{notice}</div>}

                <section style={panelStyle}>
                    <h2 style={{ fontSize: 18, margin: "0 0 16px" }}>Find inventory by SKU</h2>
                    <form onSubmit={lookup} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <input
                            aria-label="Product SKU"
                            value={skuCode}
                            onChange={(event) => setSkuCode(event.target.value)}
                            placeholder="Enter SKU, e.g. SKU generated by product service"
                            required
                            style={{ ...inputStyle, flex: "1 1 280px" }}
                        />
                        <button type="submit" disabled={loading} style={cardButton}>
                            {loading ? <LoaderCircle size={16} /> : <Search size={16} />} Find stock
                        </button>
                    </form>
                    <p style={{ color: "#64748b", fontSize: 12, lineHeight: 1.5, marginBottom: 0 }}>
                        Your inventory controller currently supports SKU lookup, not listing every inventory record.
                    </p>
                </section>

                {inventory && (
                    <section style={panelStyle}>
                        <h2 style={{ fontSize: 18, margin: "0 0 18px" }}>Current inventory</h2>
                        <div style={gridStyle}>
                            {[
                                ["SKU", inventory.skuCode],
                                ["Total quantity", inventory.quantity],
                                ["Reserved quantity", inventory.reservedQuantity],
                                ["Available quantity", inventory.availableQuantity],
                                ["Warehouse", inventory.warehouse || "Not assigned"],
                            ].map(([label, value]) => (
                                <div key={label} style={{ padding: 15, border: "1px solid #e5e9f2", borderRadius: 10, background: "#f8fafc" }}>
                                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>{label}</div>
                                    <div style={{ fontSize: 20, fontWeight: 750, overflowWrap: "anywhere" }}>{value ?? "—"}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <section style={panelStyle}>
                    <h2 style={{ fontSize: 18, margin: "0 0 6px" }}>Warehouse and quantity</h2>
                    <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 18px" }}>
                        The add-stock and adjustment endpoints treat quantity as a change, not a replacement total.
                    </p>
                    <div style={gridStyle}>
                        <div>
                            <label htmlFor="warehouse" style={labelStyle}>Warehouse</label>
                            <input id="warehouse" value={warehouse} onChange={(event) => setWarehouse(event.target.value)} required style={inputStyle} />
                        </div>
                        <div>
                            <label htmlFor="quantity" style={labelStyle}>Quantity / adjustment</label>
                            <input id="quantity" type="number" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} required style={inputStyle} />
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
                        <button type="button" disabled={loading} onClick={submitAddStock} style={cardButton}>
                            {loading && busyAction === "add" ? <LoaderCircle size={16} /> : null} Add stock
                        </button>
                    </div>
                </section>

                <section style={panelStyle}>
                    <h2 style={{ fontSize: 18, margin: "0 0 6px" }}>Adjust stock</h2>
                    <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 16px" }}>
                        Enter a positive number to increase quantity or a negative number to reduce it. Verify the resulting quantities after adjustment.
                    </p>
                    <form onSubmit={submitAdjustment}>
                        <label htmlFor="reason" style={labelStyle}>Reason for adjustment *</label>
                        <input id="reason" value={reason} onChange={(event) => setReason(event.target.value)} required placeholder="e.g. Physical stock count correction" style={inputStyle} />
                        <button type="submit" disabled={loading} style={{ ...cardButton, marginTop: 14 }}>
                            {loading && busyAction === "adjust" ? <LoaderCircle size={16} /> : null} Apply adjustment
                        </button>
                    </form>
                </section>

                <section style={panelStyle}>
                    <h2 style={{ fontSize: 18, margin: "0 0 16px" }}>Initialize inventory</h2>
                    <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.6 }}>
                        Product creation already publishes an event that can initialize inventory asynchronously. Use this only if a stock record does not already exist; the backend rejects duplicate SKU records.
                    </p>
                    <form onSubmit={submitCreate} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button type="submit" disabled={loading} style={secondaryButton}>
                            {loading ? <LoaderCircle size={16} /> : null} Create inventory record
                        </button>
                    </form>
                </section>

                <section style={panelStyle}>
                    <h2 style={{ fontSize: 18, margin: "0 0 16px" }}>Check availability</h2>
                    <form onSubmit={submitAvailability} style={{ display: "flex", alignItems: "end", gap: 10, flexWrap: "wrap" }}>
                        <div style={{ flex: "1 1 200px" }}>
                            <label htmlFor="availabilityQuantity" style={labelStyle}>Requested quantity</label>
                            <input id="availabilityQuantity" type="number" min="1" step="1" value={availabilityQuantity} onChange={(event) => setAvailabilityQuantity(event.target.value)} required style={inputStyle} />
                        </div>
                        <button type="submit" disabled={loading} style={cardButton}>
                            {loading ? <LoaderCircle size={16} /> : null} Check availability
                        </button>
                    </form>
                    {availability && (
                        <div role="status" style={{ marginTop: 16, padding: 14, borderRadius: 10, background: availability.available ? "#ecfdf5" : "#fff7ed", color: availability.available ? "#065f46" : "#9a3412" }}>
                            {availability.available ? "Available" : "Not available"} — SKU {availability.skuCode}, requested {availability.requestedQuantity}, available {availability.availableQuantity}.
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
