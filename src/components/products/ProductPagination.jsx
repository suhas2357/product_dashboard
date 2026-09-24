import { memo, useCallback, useMemo } from 'react';
import { PAGE_SIZE_OPTIONS } from '../../utils/constants.js';
import { getPageNumbers, getPaginationMeta } from '../../utils/pagination.js';


const ChevronLeft = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRight = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const ChevronsLeft = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
  </svg>
);

const ChevronsRight = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
  </svg>
);

const ProductPagination = ({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}) => {
  
  const { totalPages, start, end } = useMemo(
    () => getPaginationMeta({ total, page, pageSize }),
    [total, page, pageSize]
  );

  const pages = useMemo(
    () => getPageNumbers(page, totalPages),
    [page, totalPages]
  );

  const canPrev = page > 1;
  const canNext = page < totalPages;


  const goFirst = useCallback(() => onPageChange(1), [onPageChange]);
  const goPrev = useCallback(() => onPageChange(page - 1), [onPageChange, page]);
  const goNext = useCallback(() => onPageChange(page + 1), [onPageChange, page]);
  const goLast = useCallback(
    () => onPageChange(totalPages),
    [onPageChange, totalPages]
  );
  const handlePageSizeChange = useCallback(
    (e) => onPageSizeChange(Number(e.target.value)),
    [onPageSizeChange]
  );

  return (
    <nav
      aria-label="Pagination"
      className="mt-6 bg-white rounded-lg border border-gray-200 px-4 py-3 flex flex-col lg:flex-row items-center justify-between gap-4"
    >
      {/* Results summary */}
      <div className="text-sm text-gray-600 order-2 lg:order-1">
        {total === 0 ? (
          <span>No results</span>
        ) : (
          <>
            Showing{' '}
            <span className="font-semibold text-gray-800">{start}</span>–
            <span className="font-semibold text-gray-800">{end}</span> of{' '}
            <span className="font-semibold text-gray-800">{total}</span> results
          </>
        )}
      </div>

      {/* Page navigation */}
      <div className="flex items-center gap-1 order-1 lg:order-2">
        <button
          type="button"
          onClick={goFirst}
          disabled={!canPrev}
          aria-label="First page"
          className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronsLeft />
        </button>

        <button
          type="button"
          onClick={goPrev}
          disabled={!canPrev}
          aria-label="Previous page"
          className="inline-flex items-center justify-center gap-1 h-9 px-3 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <div className="flex items-center gap-1 mx-1">
          {pages.map((p, idx) =>
            p === '...' ? (
              <span
                key={`ellipsis-${idx}`}
                className="w-9 h-9 inline-flex items-center justify-center text-gray-400 select-none"
                aria-hidden="true"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={p === page ? 'page' : undefined}
                aria-label={`Page ${p}`}
                className={`min-w-[36px] h-9 px-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition ${
                  p === page
                    ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-600'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        <button
          type="button"
          onClick={goNext}
          disabled={!canNext}
          aria-label="Next page"
          className="inline-flex items-center justify-center gap-1 h-9 px-3 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight />
        </button>

        <button
          type="button"
          onClick={goLast}
          disabled={!canNext}
          aria-label="Last page"
          className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronsRight />
        </button>
      </div>

      {/* Page size selector */}
      <div className="flex items-center gap-2 order-3">
        <label
          htmlFor="page-size"
          className="text-sm text-gray-600 whitespace-nowrap"
        >
          Rows per page:
        </label>
        <select
          id="page-size"
          value={pageSize}
          onChange={handlePageSizeChange}
          className="h-9 border border-gray-300 rounded-md px-2 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
    </nav>
  );
};

export default memo(ProductPagination);