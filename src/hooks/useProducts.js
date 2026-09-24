import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchProducts,
  searchProducts,
  fetchProductsByCategory,
} from '../services/productService.js';
import { getErrorMessage } from '../services/api/apiErrorHandler.js';

/**
 * Fetches products based on query params.
 * - Uses AbortController so old requests can't overwrite newer ones.
 * - Falls back across search / category / plain list.
 */
export const useProducts = ({ page, pageSize, search, category }) => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const abortRef = useRef(null);
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // Increment request id; only latest wins
    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);

    const skip = (page - 1) * pageSize;

    try {
      let data;
      if (search) {
        // Search takes priority — DummyJSON can't combine search + category
        data = await searchProducts({
          q: search,
          limit: pageSize,
          skip,
          signal: controller.signal,
        });
      } else if (category) {
        data = await fetchProductsByCategory({
          category,
          limit: pageSize,
          skip,
        });
      } else {
        data = await fetchProducts({ limit: pageSize, skip });
      }

      // Ignore stale responses
      if (requestId !== requestIdRef.current) return;

      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch (err) {
      // Ignore aborted requests
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
      if (requestId !== requestIdRef.current) return;
      setError(getErrorMessage(err));
      setProducts([]);
      setTotal(0);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [page, pageSize, search, category]);

  useEffect(() => {
    load();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [load, reloadKey]);

  const retry = useCallback(() => setReloadKey((k) => k + 1), []);

  return { products, total, loading, error, retry };
};