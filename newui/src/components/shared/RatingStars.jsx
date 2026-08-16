import { Star, StarHalf } from "lucide-react";

function RatingStars({ rating }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;

  return (
    <div className="flex items-center text-brand">
      {Array.from({ length: full }).map((_, index) => (
        <Star key={`full-${index}`} size={14} className="fill-brand" />
      ))}
      {hasHalf && <StarHalf size={14} className="fill-brand" />}
    </div>
  );
}

export default RatingStars;
