import { useCallback, useEffect, useRef, useState } from 'react';
import Button from '../common/Button.jsx';
import { validateProduct } from '../../utils/validators.js';


const EMPTY_PRODUCT = {
  title: '',
  description: '',
  price: '',
  stock: '',
  category: '',
  brand: '',
};

const mapInitialValues = (values) => ({
  title: values.title || '',
  description: values.description || '',
  price: values.price ?? '',
  stock: values.stock ?? '',
  category: values.category || '',
  brand: values.brand || '',
});

const ProductForm = ({
  initialValues,
  categories,
  onSubmit,
  submitting,
  submitLabel = 'Save',
}) => {
  const [form, setForm] = useState(() =>
    initialValues ? mapInitialValues(initialValues) : EMPTY_PRODUCT
  );
  const [errors, setErrors] = useState({});


  const appliedValuesRef = useRef(initialValues);

  useEffect(() => {

    const prev = appliedValuesRef.current;
    const next = initialValues;

    if (!next) return;

    const sameProduct =
      prev && next && (prev.id === next.id || prev === next);

    if (sameProduct) return;

    appliedValuesRef.current = next;
    setForm(mapInitialValues(next));
    setErrors({});
  }, [initialValues]);

 
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

   
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (submitting) return;

      const validationErrors = validateProduct(form);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      onSubmit({
        title: form.title.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        category: form.category.trim(),
        brand: form.brand.trim(),
      });
    },
    [form, submitting, onSubmit]
  );

 
  const fieldClass = useCallback(
    (name) =>
      `w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
        errors[name] ? 'border-red-400' : 'border-gray-300'
      }`,
    [errors]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 space-y-4"
      noValidate
    >
      <div>
        <label htmlFor="product-title" className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input
          id="product-title"
          name="title"
          value={form.title}
          onChange={handleChange}
          className={fieldClass('title')}
          placeholder="Product title"
          autoComplete="off"
          disabled={submitting}
        />
        {errors.title && <p className="text-red-600 text-xs mt-1">{errors.title}</p>}
      </div>

      <div>
        <label
          htmlFor="product-description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description *
        </label>
        <textarea
          id="product-description"
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          className={fieldClass('description')}
          placeholder="Describe the product"
          disabled={submitting}
        />
        {errors.description && (
          <p className="text-red-600 text-xs mt-1">{errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="product-price" className="block text-sm font-medium text-gray-700 mb-1">
            Price *
          </label>
          <input
            id="product-price"
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            className={fieldClass('price')}
            placeholder="0.00"
            inputMode="decimal"
            disabled={submitting}
          />
          {errors.price && <p className="text-red-600 text-xs mt-1">{errors.price}</p>}
        </div>

        <div>
          <label htmlFor="product-stock" className="block text-sm font-medium text-gray-700 mb-1">
            Stock *
          </label>
          <input
            id="product-stock"
            type="number"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            min="0"
            step="1"
            className={fieldClass('stock')}
            placeholder="0"
            inputMode="numeric"
            disabled={submitting}
          />
          {errors.stock && <p className="text-red-600 text-xs mt-1">{errors.stock}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="product-category"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Category *
          </label>
          <input
            id="product-category"
            name="category"
            value={form.category}
            onChange={handleChange}
            className={fieldClass('category')}
            placeholder="e.g. smartphones"
            list="category-options"
            autoComplete="off"
            disabled={submitting}
          />
          <datalist id="category-options">
            {categories.map((c) => {
              const value = typeof c === 'string' ? c : c.slug;
              return <option key={value} value={value} />;
            })}
          </datalist>
          {errors.category && (
            <p className="text-red-600 text-xs mt-1">{errors.category}</p>
          )}
        </div>

        <div>
          <label htmlFor="product-brand" className="block text-sm font-medium text-gray-700 mb-1">
            Brand *
          </label>
          <input
            id="product-brand"
            name="brand"
            value={form.brand}
            onChange={handleChange}
            className={fieldClass('brand')}
            placeholder="Brand name"
            autoComplete="off"
            disabled={submitting}
          />
          {errors.brand && <p className="text-red-600 text-xs mt-1">{errors.brand}</p>}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={submitting}>
          {submitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
};


export default ProductForm;