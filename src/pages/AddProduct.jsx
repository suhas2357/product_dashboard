import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProductForm from "../components/products/ProductForm.jsx";
import { addProduct, fetchCategories } from "../services/productService.js";
import { getErrorMessage } from "../services/api/apiErrorHandler.js";
import { addLocalProduct } from "../utils/localProducts.js";

const AddProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const submittingRef = useRef(false);
  const location = useLocation();

  // Show toast if we arrived with one from Add/Edit
  useEffect(() => {
    const incomingToast = location.state?.toast;
    if (!incomingToast) return;
    setToast(incomingToast);
    window.history.replaceState({}, "");
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    fetchCategories({ signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted)
          setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const handleSubmit = useCallback(
    async (values) => {
      if (submittingRef.current) return;
      submittingRef.current = true;
      setSubmitting(true);
      setError("");

      try {
        // 1) Call the real endpoint (matches a real backend flow)
        const apiResult = await addProduct(values);

        // 2) Persist locally so the product shows in the list
        const stored = addLocalProduct({
          ...values,
          ...(apiResult && typeof apiResult === "object" ? apiResult : {}),
          ...values, // local values win over the echo
        });

        navigate("/products", {
          state: {
            toast: `"${stored.title}" added successfully.`,
            newProductId: stored.id,
          },
        });
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        submittingRef.current = false;
        setSubmitting(false);
      }
    },
    [navigate],
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Add Product</h1>
      <p className="text-sm text-gray-500 mb-5">
        Fill in the details below to add a new product.
      </p>

      {error && (
        <div
          role="alert"
          className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-3 py-2"
        >
          {error}
        </div>
      )}

      <ProductForm
        categories={categories}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Add Product"
      />
    </div>
  );
};

export default AddProduct;
