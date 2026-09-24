import { useCallback, useEffect, useState } from "react";
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

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);

    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId < 1) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    try {
      const [productData, categoryData] = await Promise.all([
        fetchProductById(numericId),
        fetchCategories().catch(() => []),
      ]);
      setProduct(productData);
      setCategories(Array.isArray(categoryData) ? categoryData : []);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setNotFound(true);
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (values) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const updated = await updateProduct(product.id, values);
   
      const merged = { ...product, ...values, ...(updated || {}) };

      navigate(`/products/${product.id}`, {
        state: {
          updatedProduct: merged,
          toast: "Product updated successfully.",
        },
        replace: true,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader text="Loading product..." />;

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h1 className="text-xl font-bold text-gray-800">Product not found</h1>
        <p className="text-gray-500 text-sm mt-2">
          The product with ID “{id}” does not exist.
        </p>
        <div className="mt-5">
          <Link
            to="/products"
            className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  if (error) return <ErrorMessage message={error} onRetry={load} />;

  if (!product) return null;

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/products" className="hover:text-primary-600">
          Products
        </Link>
        <span>/</span>
        <Link to={`/products/${product.id}`} className="hover:text-primary-600">
          {product.title}
        </Link>
        <span>/</span>
        <span className="text-gray-700">Edit</span>
      </div>

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
