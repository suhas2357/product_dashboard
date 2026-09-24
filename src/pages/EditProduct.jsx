import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import ProductForm from "../components/products/ProductForm.jsx";
import Loader from "../components/common/Loader.jsx";
import ErrorMessage from "../components/common/ErrorMessage.jsx";
import {
  fetchProductById,
  fetchCategories,
  updateProduct,
} from "../services/productService.js";
import { getErrorMessage } from "../services/api/apiErrorHandler.js";
import { updateLocalProduct } from "../utils/localProducts.js";
const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const submittingRef = useRef(false);

  const numericId = useMemo(() => {
    const n = Number(id);
    return Number.isInteger(n) && n > 0 ? n : null;
  }, [id]);

  const load = useCallback(
    async (signal) => {
      // Invalid id → not found without a network call
      if (numericId === null) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const [productData, categoryData] = await Promise.all([
          fetchProductById(numericId, { signal }),
          fetchCategories({ signal }).catch(() => []),
        ]);

        if (signal?.aborted) return;

        setProduct(productData);
        setCategories(Array.isArray(categoryData) ? categoryData : []);
      } catch (err) {
        // Ignore aborted requests
        if (err.code === "ERR_CANCELED" || err.name === "CanceledError") return;

        if (err.response && err.response.status === 404) {
          setNotFound(true);
        } else {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [numericId],
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const handleSubmit = useCallback(
    async (values) => {
      if (submittingRef.current) return;
      submittingRef.current = true;
      setSubmitting(true);

      try {
        const updated = await updateProduct(product.id, values);
        const merged = { ...product, ...values, ...(updated || {}) };

        // Persist the edit locally so it survives refresh
        updateLocalProduct(product.id, values);

        navigate(`/products/${product.id}`, {
          state: {
            updatedProduct: merged,
            toast: `"${merged.title}" updated successfully.`,
          },
          replace: true,
        });
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        submittingRef.current = false;
        setSubmitting(false);
      }
    },
    [product, navigate],
  );

  // ---- Early returns ----
  if (loading) return <Loader text="Loading product..." />;

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <span className="text-gray-400 text-2xl" aria-hidden="true">
            ?
          </span>
        </div>
        <h1 className="text-xl font-bold text-gray-800">Product not found</h1>
        <p className="text-gray-500 text-sm mt-2">
          The product with ID “{id}” does not exist.
        </p>
        <Link
          to="/products"
          className="mt-5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  if (error) return <ErrorMessage message={error} onRetry={() => load()} />;

  if (!product) return null;

  return (
    <div>
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-sm text-gray-500 mb-4"
      >
        <Link to="/products" className="hover:text-blue-600">
          Products
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          to={`/products/${product.id}`}
          className="hover:text-blue-600 truncate max-w-[200px]"
        >
          {product.title}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-gray-700">Edit</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-800 mb-1">Edit Product</h1>
      <p className="text-sm text-gray-500 mb-5">
        Update the product details below.
      </p>

      <ProductForm
        initialValues={product}
        categories={categories}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Save Changes"
      />
    </div>
  );
};

export default EditProduct;
