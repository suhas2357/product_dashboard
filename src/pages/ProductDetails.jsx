import { useCallback, useEffect, useMemo, useRef, useState ,memo} from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import Loader from '../components/common/Loader.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Button from '../components/common/Button.jsx';
import ProductReviews from '../components/products/ProductReviews.jsx';
import { fetchProductById } from '../services/productService.js';
import { getErrorMessage } from '../services/api/apiErrorHandler.js';
import { useAuth } from '../hooks/useAuth.js';

const ProductDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();


  const passedProductRef = useRef(location.state?.updatedProduct ?? null);
  const toastRef = useRef(location.state?.toast ?? '');

  useEffect(() => {
    if (location.state?.toast || location.state?.updatedProduct) {
      window.history.replaceState({}, '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const passedProduct = passedProductRef.current;
  const initialToast = toastRef.current;

  const [product, setProduct] = useState(passedProduct);
  const [loading, setLoading] = useState(!passedProduct);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [showToast, setShowToast] = useState(Boolean(initialToast));

  // ---- Toast auto-hide ----
  useEffect(() => {
    if (!initialToast) return;
    const t = setTimeout(() => setShowToast(false), 3000);
    return () => clearTimeout(t);
  }, [initialToast]);


  const numericId = useMemo(() => {
    const n = Number(id);
    return Number.isInteger(n) && n > 0 ? n : null;
  }, [id]);

  // ---- Fetch product ----
  const load = useCallback(async () => {
    // If Edit passed a product via state, use it — no need to refetch
    if (passedProduct) return;

    if (!isAuthenticated) return;

    if (numericId === null) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const data = await fetchProductById(numericId);
      if (!data || !data.id) {
        setNotFound(true);
      } else {
        setProduct(data);
        setActiveImage(0);
      }
    } catch (err) {
      if (err.response && err.response.status === 404) setNotFound(true);
      else setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [numericId, isAuthenticated, passedProduct]);

  useEffect(() => {
    load();
  }, [load]);

  // ---- Stable handlers ----
  const handleBack = useCallback(() => navigate('/products'), [navigate]);

  const handleEdit = useCallback(() => {
    // Guard: only navigate if we actually have an id
    if (product?.id) navigate(`/products/${product.id}/edit`);
  }, [navigate, product?.id]);

  const handleThumbnailClick = useCallback((index) => {
    setActiveImage(index);
  }, []);

  const handleRetry = useCallback(() => load(), [load]);

  
  const images = useMemo(() => {
    if (!product) return [];
    return product.images && product.images.length > 0
      ? product.images
      : [product.thumbnail].filter(Boolean);
  }, [product]);

  // ---- Early returns (order matters: put loading after hooks) ----
  if (loading) return <Loader text="Loading product..." />;

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <span className="text-gray-400 text-2xl">?</span>
        </div>
        <h1 className="text-xl font-bold text-gray-800">Product not found</h1>
        <p className="text-gray-500 text-sm mt-2">
          The product with ID “{id}” does not exist.
        </p>
        <div className="mt-5">
          <Button onClick={handleBack}>Back to Products</Button>
        </div>
      </div>
    );
  }

  if (error) return <ErrorMessage message={error} onRetry={handleRetry} />;

  if (!product) return <EmptyState title="Product unavailable" />;

  return (
    <div>
      {showToast && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md px-3 py-2">
          {initialToast}
        </div>
      )}

      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/products" className="hover:text-blue-600">
          Products
        </Link>
        <span>/</span>
        <span className="text-gray-700 truncate max-w-[200px]">
          {product.title}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Images */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="aspect-square bg-gray-50 rounded-md overflow-hidden flex items-center justify-center">
            <img
              src={images[activeImage] || product.thumbnail}
              alt={product.title}
              className="max-h-full max-w-full object-contain"
              loading="eager"
              decoding="async"
            />
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img}                       /* ⬅️ stable key from URL */
                  type="button"
                  onClick={() => handleThumbnailClick(i)}
                  aria-label={`Show image ${i + 1}`}
                  aria-current={i === activeImage ? 'true' : undefined}
                  className={`w-16 h-16 rounded-md border-2 overflow-hidden flex-shrink-0 transition ${
                    i === activeImage
                      ? 'border-blue-500'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.title} ${i + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h1 className="text-2xl font-bold text-gray-800">{product.title}</h1>
          <p className="text-sm text-gray-500 capitalize mt-1">
            {product.category} • {product.brand}
          </p>

          <div className="flex items-center gap-3 mt-4">
            <span className="text-3xl font-bold text-blue-700">
              ${Number(product.price).toFixed(2)}
            </span>
            <span className="text-sm text-gray-500">
              ⭐ {Number(product.rating).toFixed(1)}
            </span>
          </div>

          <div className="mt-3">
            <span
              className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                product.stock > 10
                  ? 'bg-green-100 text-green-700'
                  : product.stock > 0
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          <p className="text-gray-600 text-sm mt-5 leading-relaxed">
            {product.description}
          </p>

          <div className="flex gap-3 mt-6">
            <Button onClick={handleEdit}>Edit Product</Button>
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Reviews</h2>
        <ProductReviews reviews={product.reviews || []} />
      </div>
    </div>
  );
};

export default ProductDetails;