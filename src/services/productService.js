import axiosInstance from './api/axiosInstance.js';
import { getLocalProductById } from '../utils/localProducts.js';

const cache = new Map();
const TTL = 60_000;
const cacheKey = (prefix, params) => `${prefix}:${JSON.stringify(params)}`;

const withCache = async (key, fetcher) => {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.t < TTL) return hit.data;
  const data = await fetcher();
  cache.set(key, { data, t: Date.now() });
  return data;
};

export const fetchProducts = ({ limit, skip, delay }) => {
  const params = { limit, skip, ...(delay ? { delay } : {}) };
  return withCache(cacheKey('products', params), async () => {
    const { data } = await axiosInstance.get('/products', { params });
    return data;
  });
};

export const searchProducts = ({ q, limit, skip, delay, signal }) => {
  const params = { q, limit, skip, ...(delay ? { delay } : {}) };
  return axiosInstance.get('/products/search', { params, signal }).then((r) => r.data);
};

export const fetchProductsByCategory = ({ category, limit, skip, signal }) => {
  const params = { limit, skip };
  return withCache(cacheKey('category', { category, ...params }), async () => {
    const { data } = await axiosInstance.get(`/products/category/${category}`, { params, signal });
    return data;
  });
};

export const fetchCategories = ({ signal } = {}) =>
  withCache('categories', async () => {
    const { data } = await axiosInstance.get('/products/categories', { signal });
    return data;
  });

export const fetchProductById = (id, { signal } = {}) => {
  // ✅ Local products have ids >= 10_000 — serve them from the overlay
  const numericId = Number(id);
  if (Number.isInteger(numericId) && numericId >= 10_000) {
    const local = getLocalProductById(numericId);
    if (local) return Promise.resolve(local);
    return Promise.reject({ response: { status: 404 } });
  }

  return withCache(cacheKey('product', id), async () => {
    const { data } = await axiosInstance.get(`/products/${id}`, { signal });
    return data;
  });
};

export const addProduct = async (product) => {
  cache.clear();
  const { data } = await axiosInstance.post('/products/add', product);
  return data;
};

export const updateProduct = async (id, product) => {
  cache.clear();
  const numericId = Number(id);
  if (Number.isInteger(numericId) && numericId >= 10_000) {
    // Local products: no API call needed (they don't exist on the server)
    return Promise.resolve({ ...product, id: numericId });
  }
  const { data } = await axiosInstance.put(`/products/${id}`, product);
  return data;
};

export const deleteProduct = async (id) => {
  cache.clear();
  const numericId = Number(id);
  if (Number.isInteger(numericId) && numericId >= 10_000) {

    return Promise.resolve({ isDeleted: true, id: numericId });
  }
  const { data } = await axiosInstance.delete(`/products/${id}`);
  return data;
};