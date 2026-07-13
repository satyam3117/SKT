import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import ApiResultCard from "../components/ApiResultCard";
import { placeOrder } from "../services/orderApi";

const initialForm = {
  id: "",
  orderNumber: "",
  skuCode: "",
  price: "",
  quantity: "",
};

function PlaceOrderPage() {
  const { keycloak } = useOutletContext();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult("");

    try {
      const payload = {
        id: Number(form.id),
        orderNumber: form.orderNumber,
        skuCode: form.skuCode,
        price: Number(form.price),
        quantity: Number(form.quantity),
      };

      const response = await placeOrder(keycloak, payload);
      setResult(response);
      setForm(initialForm);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-card">
      <h2>POST /api/order</h2>
      <p className="status">Place an order with the fields from OrderRequest.</p>

      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          ID
          <input type="number" min="1" name="id" value={form.id} onChange={handleChange} required />
        </label>

        <label>
          Order Number
          <input name="orderNumber" value={form.orderNumber} onChange={handleChange} required />
        </label>

        <label>
          SKU Code
          <input name="skuCode" value={form.skuCode} onChange={handleChange} required />
        </label>

        <label>
          Price
          <input
            type="number"
            min="0"
            step="0.01"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Quantity
          <input type="number" min="1" name="quantity" value={form.quantity} onChange={handleChange} required />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Placing..." : "Place Order"}
        </button>
      </form>

      {error && <p className="status error">{error}</p>}
      <ApiResultCard title="Order API Response" value={result} />
    </section>
  );
}

export default PlaceOrderPage;

