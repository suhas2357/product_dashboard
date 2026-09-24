import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from './constants.js';

/**
 * Safely parse a positive integer from a URL search param.
 * Falls back to the default if invalid.
 */
export const parsePositiveInt = (value, fallback) => {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 1 || !Number.isInteger(num)) {
    return fallback;
  }
  return num;
};

/**
 * Compute pagination metadata.
 */
export const getPaginationMeta = ({ total, page, pageSize }) => {
  const safePageSize = pageSize || DEFAULT_PAGE_SIZE;
  const safePage = page || DEFAULT_PAGE;
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const start = total === 0 ? 0 : (safePage - 1) * safePageSize + 1;
  const end = Math.min(safePage * safePageSize, total);
  return { totalPages, start, end };
};

/**
 * Generate a compact list of page numbers with ellipsis.
 * Example: [1, '...', 4, 5, 6, '...', 20]
 */
export const getPageNumbers = (current, total) => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = [];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  pages.push(1);
  if (left > 2) pages.push('...');
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push('...');
  pages.push(total);

  return pages;
};