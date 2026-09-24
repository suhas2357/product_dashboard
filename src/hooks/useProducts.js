import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  fetchAllProducts,
  fetchCategories,
} from '../services/productService.js';
import { getErrorMessage } from '../services/api/apiErrorHandler.js';
import { getOverlay } from '../utils/localProducts.js';

/** Case-insensitive match across title / description / brand / category. */
const matchesSearch = (product, q) => {
  if (!q) return true;
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [
    product.title,
    product.description,
    product.brand,
    product.category,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(needle);
};

const matchesCategory = (product, category) => {
  if (!category) return true;
  return String(product.category).toLowerCase() === category.toLowerCase();
};

const sortProducts = (items, sort) => {
  if (!sort) return items;
  const [field, dir] = sort.split('-');
  const sorted = [...items].sort((a, b) => {
    let va = a[field];
    let vb = b[field];
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    if (va < vb) return -1;
    if (va > vb) return 1;
    return 0;
  });
  return dir === 'desc' ? sorted.reverse() : sorted;
};

export const useProducts = ({ page, pageSize, search, category, sort }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const abortRef = useRef(null);

  const load = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchAllProducts({ signal: controller.signal });
      if (controller.signal.aborted) return;

      const apiProducts = data.products || [];

      // Merge the local overlay (added/updated/deleted)
      const overlay = getOverlay();
      const deletedSet = new Set(overlay.deleted.map(Number));

      const merged = apiProducts
        .filter((p) => !deletedSet.has(Number(p.id)))
        .map((p) => {
          const patch = overlay.updated[p.id];
          return patch ? { ...p, ...patch } : p;
        });

      setAllProducts([...overlay.added, ...merged]);
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
      setError(getErrorMessage(err));
      setAllProducts([]);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, [load, reloadKey]);

  // 🔽 Derived: filter + sort the FULL dataset
  const filteredSorted = useMemo(() => {
    const filtered = allProducts.filter(
      (p) => matchesCategory(p, category) && matchesSearch(p, search)
    );
    return sortProducts(filtered, sort);
  }, [allProducts, category, search, sort]);

  // 🔽 Derived: slice out the current page
  const total = filteredSorted.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = useMemo(
    () => filteredSorted.slice(start, end),
    [filteredSorted, start, end]
  );

  const retry = useCallback(() => setReloadKey((k) => k + 1), []);

  return { products: pageItems, total, loading, error, retry };
};