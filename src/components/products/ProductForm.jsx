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
  thumbnail: '',
  images: [],
};

const mapInitialValues = (values) => ({
  title: values.title || '',
  description: values.description || '',
  price: values.price ?? '',
  stock: values.stock ?? '',
  category: values.category || '',
  brand: values.brand || '',
  thumbnail: values.thumbnail || '',
  images: Array.isArray(values.images) ? values.images : [],
});

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

/** Reads a File as a base64 data URL. */
const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

/** Downscales an image via canvas so it fits within maxDim and compresses as JPEG. */
const downscaleImage = (dataUrl, maxDim = 600, quality = 0.8) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl); // fallback — return original
    img.src = dataUrl;
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
  const [imageError, setImageError] = useState('');
  const appliedValuesRef = useRef(initialValues);

  useEffect(() => {
    const prev = appliedValuesRef.current;
    const next = initialValues;
    if (!next) return;
    const sameProduct = prev && next && (prev.id === next.id || prev === next);
    if (sameProduct) return;
    appliedValuesRef.current = next;
    setForm(mapInitialValues(next));
    setErrors({});
    setImageError('');
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

  // ✅ Image upload handler
  const handleImageChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError('');

    if (!file.type.startsWith('image/')) {
      setImageError('Please choose an image file.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setImageError(`Image is too large. Max ${MAX_FILE_SIZE / 1024 / 1024} MB.`);
      return;
    }

    try {
      const raw = await fileToDataUrl(file);
      const compressed = await downscaleImage(raw);
      setForm((prev) => ({
        ...prev,
        thumbnail: compressed,
        images: [compressed],
      }));
    } catch {
      setImageError('Could not read the image file.');
    }
  }, []);

  const handleRemoveImage = useCallback(() => {
    setForm((prev) => ({ ...prev, thumbnail: '', images: [] }));
    setImageError('');
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
        thumbnail: form.thumbnail || '',
        images: form.images || [],
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
      {/* ✅ Image upload */}
      <div>
        <label htmlFor="product-image" className="block text-sm font-medium text-gray-700 mb-1">
          Product Image
        </label>

        {form.thumbnail ? (
          <div className="flex items-center gap-4">
            <img
              src={form.thumbnail}
              alt="Selected preview"
              className="w-24 h-24 object-cover rounded-md border border-gray-200 bg-gray-50"
            />
            <div className="flex flex-col gap-2">
              <label
                htmlFor="product-image"
                className="cursor-pointer text-blue-600 hover:underline text-sm"
              >
                Change image
              </label>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="text-red-600 hover:underline text-sm text-left"
              >
                Remove image
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-md border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 text-xs text-center">
              No image
            </div>
            <label
              htmlFor="product-image"
              className="cursor-pointer px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              Choose image
            </label>
          </div>
        )}

        <input
          id="product-image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          disabled={submitting}
          className="sr-only"
        />

        {imageError && (
          <p className="text-red-600 text-xs mt-1" role="alert">{imageError}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          Max 2 MB. Larger images are resized automatically.
        </p>
      </div>

      {/* Title */}
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

      {/* Description */}
      <div>
        <label htmlFor="product-description" className="block text-sm font-medium text-gray-700 mb-1">
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
        {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description}</p>}
      </div>

      {/* Price + Stock */}
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

      {/* Category + Brand */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="product-category" className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>

          {categories.length > 0 ? (
            <select
              id="product-category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className={fieldClass('category')}
              disabled={submitting}
            >
              <option value="">Select a category…</option>
              {categories.map((c) => {
                const value = typeof c === 'string' ? c : c.slug;
                const label = typeof c === 'string' ? c : (c.name || c.slug);
                return (
                  <option key={value} value={value}>
                    {label}
                  </option>
                );
              })}
            </select>
          ) : (
            <input
              id="product-category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className={fieldClass('category')}
              placeholder="e.g. smartphones"
              autoComplete="off"
              disabled={submitting}
            />
          )}

          {errors.category && <p className="text-red-600 text-xs mt-1">{errors.category}</p>}
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