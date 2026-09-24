import { memo } from 'react';
import ProductRow from './ProductRow.jsx';

const COLUMNS = [
  { key: 'image', label: 'Image' },
  { key: 'title', label: 'Title' },
  { key: 'category', label: 'Category' },
  { key: 'price', label: 'Price' },
  { key: 'rating', label: 'Rating' },
  { key: 'stock', label: 'Stock' },
  { key: 'actions', label: 'Actions' },
];

const ProductTable = ({ products, onDelete }) => {
  return (
    <div className="hidden md:block overflow-x-auto bg-white rounded-lg border border-gray-200">
      <table
        className="w-full text-left border-collapse"
        aria-label="Products table"
      >
        <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                scope="col"
                className="py-3 px-4 font-medium"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <ProductRow key={p.id} product={p} onDelete={onDelete} />
          ))}
        </tbody>
      </table>
    </div>
  );
};


export default memo(ProductTable);