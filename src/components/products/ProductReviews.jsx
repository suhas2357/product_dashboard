import { memo } from 'react';

const EMPTY_REVIEWS = [];


const StarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-4 h-4 text-yellow-400"
    aria-hidden="true"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.539 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.98 10.1c-.783-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
  </svg>
);


const RatingStars = memo(({ rating = 0 }) => {
  const count = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span
      className="inline-flex items-center gap-0.5"
      role="img"
      aria-label={`${count} out of 5 stars`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <StarIcon key={i} />
      ))}
    </span>
  );
});


const formatDate = (iso) => {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return null;
  }
};

const ProductReviews = ({ reviews = EMPTY_REVIEWS }) => {
  if (!reviews.length) {
    return (
      <p className="text-sm text-gray-500">
        No reviews available for this product.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review, idx) => {
        const key =
          review._id ??
          review.id ??
          `${review.reviewerEmail ?? review.reviewerName ?? 'anon'}-${review.date ?? idx}`;

        const date = formatDate(review.date);

        return (
          <div
            key={key}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium text-gray-800 text-sm truncate">
                {review.reviewerName || 'Anonymous'}
              </span>
              <RatingStars rating={review.rating} />
            </div>

            <p className="text-sm text-gray-600 mt-2">{review.comment}</p>

            {date && (
              <p className="text-xs text-gray-400 mt-2">
                <time dateTime={review.date}>{date}</time>
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};


export default memo(ProductReviews);