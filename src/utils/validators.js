export const validateLogin = ({ username, password }) => {
  const errors = {};
  if (!username || !username.trim()) {
    errors.username = 'Username is required';
  }
  if (!password || !password.trim()) {
    errors.password = 'Password is required';
  }
  return errors;
};

export const validateProduct = (product) => {
  const errors = {};

  if (!product.title || !product.title.trim()) {
    errors.title = 'Title is required';
  } else if (product.title.trim().length < 2) {
    errors.title = 'Title must be at least 2 characters';
  }

  if (!product.description || !product.description.trim()) {
    errors.description = 'Description is required';
  } else if (product.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters';
  }

  const price = Number(product.price);
  if (product.price === '' || product.price === null || Number.isNaN(price)) {
    errors.price = 'Price is required';
  } else if (price <= 0) {
    errors.price = 'Price must be greater than 0';
  }

  const stock = Number(product.stock);
  if (product.stock === '' || product.stock === null || Number.isNaN(stock)) {
    errors.stock = 'Stock is required';
  } else if (stock < 0 || !Number.isInteger(stock)) {
    errors.stock = 'Stock must be a non-negative integer';
  }

  if (!product.category || !product.category.trim()) {
    errors.category = 'Category is required';
  }

  if (!product.brand || !product.brand.trim()) {
    errors.brand = 'Brand is required';
  }

  return errors;
};