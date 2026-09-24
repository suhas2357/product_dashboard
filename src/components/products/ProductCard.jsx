import { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';


const getStockBadgeClass = (stock) => {
  if (stock > 10) return 'bg-green-100 text-green-700';
  if (stock > 0) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
};


const StarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-3.5 h-3.5 text-yellow-400"
    aria-hidden="true"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.539 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.98 10.1c-.783-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
  </svg>
);

const ProductCard = ({ product, onDelete, priority = false }) => {

  const handleDelete = useCallback(() => {
    onDelete(product);
  }, [onDelete, product]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col">
      <div className="flex gap-3">
        <img
          src={product.thumbnail}
          alt={product.title}
          width={80}
          height={80}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          className="w-20 h-20 object-cover rounded-md bg-gray-100 flex-shrink-0"
        />

        <div className="flex-1 min-w-0">
          <Link
            to={`/products/${product.id}`}
            className="font-medium text-gray-800 hover:text-blue-600 line-clamp-2"
          >
            {product.title}
          </Link>

          <div className="text-xs text-gray-500 capitalize mt-1">
            {product.category}
          </div>

          <div className="mt-1 text-sm font-semibold text-gray-800">
            ${Number(product.price).toFixed(2)}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 text-xs text-gray-600">
        <span className="inline-flex items-center gap-1">
          <StarIcon />
          {Number(product.rating).toFixed(1)}
        </span>

        <span
          className={`px-2 py-0.5 rounded-full font-medium ${getStockBadgeClass(
            product.stock
          )}`}
        >
          Stock: {product.stock}
        </span>
      </div>

      <div className="flex gap-3 mt-4 pt-3 border-t border-gray-100">
        <Link
          to={`/products/${product.id}/edit`}
          className="text-blue-600 hover:underline text-sm"
          aria-label={`Edit ${product.title}`}
        >
          Edit
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          aria-label={`Delete ${product.title}`}
          className="text-red-600 hover:underline text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
};


export default memo(ProductCard);