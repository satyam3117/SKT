import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import ApiResultCard from "../components/ApiResultCard";
import { checkInventory } from "../services/inventoryApi";
import { placeOrder } from "../services/orderApi";

const initialForm = {
  customerName: "",
  address: "",
  paymentMethod: "COD",
};

function PlaceOrderPage() {
  const { keycloak, cartItems, cartSummary, updateCartItemQuantity, removeFromCart, clearCart } = useOutletContext();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (cartItems.length === 0) {
      setError("Your cart is empty. Add products from Shop before checkout.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      for (const item of cartItems) {
        const inStock = await checkInventory(keycloak, item.id, item.quantity);
        if (!inStock) {
          throw new Error(`Item ${item.name} (SKU ${item.id}) is not in stock for quantity ${item.quantity}.`);
        }
      }

      const orderSeed = Date.now();
      const responses = [];

      for (let index = 0; index < cartItems.length; index += 1) {
        const item = cartItems[index];
        const payload = {
          id: orderSeed + index,
          orderNumber: `ORD-${orderSeed}-${index + 1}`,
          skuCode: item.id,
          price: Number(item.price),
          quantity: Number(item.quantity),
        };

        const response = await placeOrder(keycloak, payload);
        responses.push({ skuCode: item.id, apiResponse: response });
      }

      setResult({
        customer: {
          name: form.customerName,
          address: form.address,
          paymentMethod: form.paymentMethod,
        },
        orders: responses,
      });
      clearCart();
      setForm(initialForm);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-card">
      <h2>Checkout</h2>
      <p className="status">This screen uses `GET /api/inventory` for stock checks and `POST /api/order` for placement.</p>

      {cartItems.length === 0 ? (
        <p className="status">Cart is empty.</p>
      ) : (
        <div className="checkout-grid">
          <section className="cart-list">
            {cartItems.map((item) => (
              <article className="cart-item" key={item.id}>
                <div>
                  <h3>{item.name}</h3>
                  <p>SKU: {item.id}</p>
                  <p>${Number(item.price).toFixed(2)} each</p>
                </div>
                <div className="cart-item-actions">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(event) => updateCartItemQuantity(item.id, event.target.value)}
                  />
                  <button type="button" className="ghost-button" onClick={() => removeFromCart(item.id)}>
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </section>

          <section className="order-summary">
            <h3>Order Summary</h3>
            <p>Total Items: {cartSummary.totalItems}</p>
            <p>Total Price: ${cartSummary.totalPrice.toFixed(2)}</p>

            <form className="form-grid" onSubmit={handleSubmit}>
              <label>
                Full Name
                <input name="customerName" value={form.customerName} onChange={handleChange} required />
              </label>

              <label>
                Delivery Address
                <textarea name="address" value={form.address} onChange={handleChange} rows={3} required />
              </label>

              <label>
                Payment Method
                <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange}>
                  <option value="COD">Cash on Delivery</option>
                  <option value="CARD">Card</option>
                  <option value="UPI">UPI</option>
                </select>
              </label>

              <button type="submit" disabled={loading}>
                {loading ? "Placing Orders..." : "Place Order Now"}
              </button>
            </form>
          </section>
        </div>
      )}

      {error && <p className="status error">{error}</p>}
      <ApiResultCard title="Order Result" value={result} />
    </section>
  );
}

export default PlaceOrderPage;


