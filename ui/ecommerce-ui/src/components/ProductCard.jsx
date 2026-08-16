import AuthenticatedImage from "./AuthenticatedImage";
import { getPrimaryProductImageUrl, getProductPlaceholderUrl } from "../utils/productImages";

function ProductCard({ product, keycloak, onAddToCart }) {
  const price = Number(product.price || 0);
  const imageSource = getPrimaryProductImageUrl(product) || getProductPlaceholderUrl(product, { width: 640, height: 420 });
  const placeholderSource = getProductPlaceholderUrl(product, { width: 640, height: 420 });

  return (
    <article className="product-card">
      <div className="product-card-media">
        <AuthenticatedImage
          keycloak={keycloak}
          className="product-card-image"
          src={imageSource}
          fallbackSrc={placeholderSource}
          alt={`${product.name || "Product"} photo`}
          loading="lazy"
        />
      </div>
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
