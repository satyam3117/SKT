function ProductCard({ product, onAddToCart }) {
  const price = Number(product.price || 0);

  return (
    <article className="product-card">
      <div className="product-card-body">
        <p className="product-id">SKU: {product.id}</p>
        <h3>{product.name}</h3>
        <p className="product-description">{product.description}</p>
      </div>
      <div className="product-card-footer">
        <strong>${price.toFixed(2)}</strong>
        <button type="button" onClick={() => onAddToCart(product)}>
          Add to Cart
        </button>
      </div>
    </article>
  );
}

export default ProductCard;

