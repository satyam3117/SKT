import { useEffect, useState } from "react";
import { getBearerToken } from "../services/apiClient";
import { resolveProductImageUrl } from "../utils/productImages";

function isDirectImageSource(source) {
  return typeof source === "string" && /^(data:|blob:)/i.test(source);
}

function AuthenticatedImage({
  keycloak,
  src,
  fallbackSrc = "",
  alt,
  className,
  loading = "lazy",
}) {
  const resolvedSrc = isDirectImageSource(src) ? src : resolveProductImageUrl(src);
  const [imageSrc, setImageSrc] = useState(isDirectImageSource(resolvedSrc) ? resolvedSrc : fallbackSrc);

  useEffect(() => {
    if (!resolvedSrc) {
      setImageSrc(fallbackSrc);
      return undefined;
    }

    if (isDirectImageSource(resolvedSrc)) {
      setImageSrc(resolvedSrc);
      return undefined;
    }

    let active = true;
    let objectUrl = "";

    async function loadImage() {
      try {
        const token = await getBearerToken(keycloak);
        const response = await fetch(resolvedSrc, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Image request failed with status ${response.status}`);
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);

        if (active) {
          setImageSrc(objectUrl);
        }
      } catch {
        if (active) {
          setImageSrc(fallbackSrc);
        }
      }
    }

    setImageSrc(fallbackSrc);
    loadImage();

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [fallbackSrc, keycloak, resolvedSrc]);

  return <img className={className} src={imageSrc || fallbackSrc} alt={alt} loading={loading} />;
}

export default AuthenticatedImage;
