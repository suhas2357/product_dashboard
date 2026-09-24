import { memo, useCallback, useMemo } from 'react';
import { SORT_OPTIONS } from '../../utils/constants.js';

const SELECT_CLASS =
  'border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60';

const ProductFilters = ({
  categories,
  category,
  sort,
  onCategoryChange,
  onSortChange,
}) => {

  const handleCategoryChange = useCallback(
    (e) => onCategoryChange(e.target.value),
    [onCategoryChange]
  );

  const handleSortChange = useCallback(
    (e) => onSortChange(e.target.value),
    [onSortChange]
  );


  const categoryOptions = useMemo(
    () =>
      categories.map((cat) => {
        if (typeof cat === 'string') {
          return { value: cat, label: cat };
        }
        return { value: cat.slug ?? cat.name, label: cat.name ?? cat.slug };
      }),
    [categories]
  );

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      {/* Category filter */}
      <div className="relative w-full sm:w-auto">
        <label htmlFor="filter-category" className="sr-only">
          Filter by category
        </label>
        <select
          id="filter-category"
          value={category}
          onChange={handleCategoryChange}
          aria-label="Filter by category"
          className={SELECT_CLASS}
        >
          <option value="">All Categories</option>
          {categoryOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sort filter */}
      <div className="relative w-full sm:w-auto">
        <label htmlFor="filter-sort" className="sr-only">
          Sort products
        </label>
        <select
          id="filter-sort"
          value={sort}
          onChange={handleSortChange}
          aria-label="Sort products"
          className={SELECT_CLASS}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};


export default memo(ProductFilters);