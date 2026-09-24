import { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';


const getStockClass = (stock) => {
  if (stock > 10) return 'bg-green-100 text-green-700';
  if (stock > 0) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
};

const ProductRow = ({ product, onDelete }) => {
  const handleDelete = useCallback(() => {
    onDelete(product);
  }, [onDelete, product]);

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="py-3 px-4">
        <img
          src={product.thumbnail}
          alt={product.title}
          width={48}
          height={48}
          loading="lazy"
          decoding="async"
          className="w-12 h-12 object-cover rounded-md bg-gray-100"
        />
      </td>

      <td className="py-3 px-4">
        <Link
          to={`/products/${product.id}`}
          className="font-medium text-gray-800 hover:text-blue-600"
        >
          {product.title}
        </Link>
        <div className="text-xs text-gray-500">{product.brand}</div>
      </td>

      <td className="py-3 px-4 text-sm text-gray-600 capitalize">
        {product.category}
      </td>

      <td className="py-3 px-4 text-sm text-gray-800 font-medium">
        ${Number(product.price).toFixed(2)}
      </td>

      <td className="py-3 px-4 text-sm text-gray-600">
        ⭐ {Number(product.rating).toFixed(1)}
      </td>

      <td className="py-3 px-4 text-sm">
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStockClass(
            product.stock
          )}`}
        >
          {product.stock}
        </span>
      </td>

      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <Link
            to={`/products/${product.id}/edit`}
            className="text-blue-600 hover:underline text-sm"
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
      </td>
    </tr>
  );
};


export default memo(ProductRow);