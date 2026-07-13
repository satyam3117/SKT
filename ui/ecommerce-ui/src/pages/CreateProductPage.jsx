import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import ApiResultCard from "../components/ApiResultCard";
import { createProduct } from "../services/productApi";

const initialForm = {
  id: "",
  name: "",
  description: "",
  price: "",
};

function CreateProductPage() {
  const { keycloak } = useOutletContext();
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
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const payload = {
        id: form.id,
        name: form.name,
        description: form.description,
        price: Number(form.price),
      };

      const response = await createProduct(keycloak, payload);
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
      <h2>POST /api/product</h2>
      <p className="status">Create a new product using the same payload fields from ProductRequest.</p>

      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Product ID
          <input name="id" value={form.id} onChange={handleChange} required />
        </label>

        <label>
          Name
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>

        <label>
          Description
          <input name="description" value={form.description} onChange={handleChange} required />
        </label>

        <label>
          Price
          <input
            type="number"
            step="0.01"
            min="0"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Product"}
        </button>
      </form>

      {error && <p className="status error">{error}</p>}
      <ApiResultCard title="Created Product" value={result} />
    </section>
  );
}

export default CreateProductPage;

