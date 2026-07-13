import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import ApiResultCard from "../components/ApiResultCard";
import { checkInventory } from "../services/inventoryApi";

function InventoryCheckPage() {
  const { keycloak } = useOutletContext();
  const [skuCode, setSkuCode] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await checkInventory(keycloak, skuCode, Number(quantity));
      setResult({ skuCode, quantity: Number(quantity), inStock: Boolean(response) });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-card">
      <h2>GET /api/inventory</h2>
      <p className="status">Check if a quantity is currently in stock.</p>

      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          SKU Code
          <input value={skuCode} onChange={(event) => setSkuCode(event.target.value)} required />
        </label>

        <label>
          Quantity
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Checking..." : "Check Inventory"}
        </button>
      </form>

      {error && <p className="status error">{error}</p>}
      <ApiResultCard title="Inventory Result" value={result} />
    </section>
  );
}

export default InventoryCheckPage;

