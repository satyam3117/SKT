import AuthenticatedImage from "../AuthenticatedImage";
import { getPrimaryProductImageUrl, getProductPlaceholderUrl } from "../../utils/productImages";

function ProductThumbnail({ product, keycloak }) {
  const imageSource = getPrimaryProductImageUrl(product) || getProductPlaceholderUrl(product);
  const placeholderSource = getProductPlaceholderUrl(product);

  return (
    <AuthenticatedImage
      keycloak={keycloak}
      className="product-thumbnail"
      src={imageSource}
      fallbackSrc={placeholderSource}
      alt={`${product.name || "Product"} thumbnail`}
      loading="lazy"
    />
  );
}

export default ProductThumbnail;
