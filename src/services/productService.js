import axiosInstance from './api/axiosInstance.js';

export const fetchProducts = async ({ limit, skip, delay }) => {
  const params = { limit, skip };
  if (delay) params.delay = delay;
  const response = await axiosInstance.get('/products', { params });
  return response.data;
};

export const searchProducts = async ({ q, limit, skip, delay, signal }) => {
  const params = { q, limit, skip };
  if (delay) params.delay = delay;
  const response = await axiosInstance.get('/products/search', { params, signal });
  return response.data;
};

export const fetchProductsByCategory = async ({ category, limit, skip }) => {
  const response = await axiosInstance.get(`/products/category/${category}`, {
    params: { limit, skip },
  });
  return response.data;
};

export const fetchCategories = async () => {
  const response = await axiosInstance.get('/products/categories');
  return response.data;
};

export const fetchProductById = async (id) => {
  const response = await axiosInstance.get(`/products/${id}`);
  return response.data;
};

// These are not persisted by DummyJSON, but we call them for realism.
export const addProduct = async (product) => {
  const response = await axiosInstance.post('/products/add', product);
  return response.data;
};

export const updateProduct = async (id, product) => {
  const response = await axiosInstance.put(`/products/${id}`, product);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await axiosInstance.delete(`/products/${id}`);
  return response.data;
};