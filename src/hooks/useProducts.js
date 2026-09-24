import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchProducts,
  searchProducts,
  fetchProductsByCategory,
} from '../services/productService.js';
import { getErrorMessage } from '../services/api/apiErrorHandler.js';
import { getOverlay } from '../utils/localProducts.js';

/** Filter + format local products so they match API shape. */
const matchLocal = (overlay, { search, category }) => {
  const q = search.trim().toLowerCase();
  const cat = category.trim().toLowerCase();

  return overlay.added.filter((p) => {
    if (cat && String(p.category).toLowerCase() !== cat) return false;
    if (!q) return true;
    const haystack = `${p.title} ${p.description} ${p.brand} ${p.category}`.toLowerCase();
    return haystack.includes(q);
  });
};

export const useProducts = ({ page, pageSize, search, category }) => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const abortRef = useRef(null);
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);

    const skip = (page - 1) * pageSize;

    try {
      let data;
      if (search) {
        data = await searchProducts({
          q: search, limit: pageSize, skip, signal: controller.signal,
        });
      } else if (category) {
        data = await fetchProductsByCategory({
          category, limit: pageSize, skip, signal: controller.signal,
        });
      } else {
        data = await fetchProducts({ limit: pageSize, skip });
      }

      if (requestId !== requestIdRef.current) return;

      const overlay = getOverlay();

      // ✅ Always merge local matches (only meaningful on page 1)
      let apiProducts = data.products || [];
      let apiTotal = data.total || 0;

      if (page === 1) {
        const localMatches = matchLocal(overlay, { search, category });
        // Add only those local products not already shown on this page
        const shownIds = new Set(apiProducts.map((p) => Number(p.id)));
        const extra = localMatches.filter((p) => !shownIds.has(Number(p.id)));

        apiProducts = [...extra, ...apiProducts];
        apiTotal = apiTotal + extra.length;
      }

      setProducts(apiProducts);
      setTotal(apiTotal);
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
      if (requestId !== requestIdRef.current) return;
      setError(getErrorMessage(err));
      setProducts([]);
      setTotal(0);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [page, pageSize, search, category]);

  useEffect(() => {
    load();
    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, [load, reloadKey]);

  const retry = useCallback(() => setReloadKey((k) => k + 1), []);

  return { products, total, loading, error, retry };
};