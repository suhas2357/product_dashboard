import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ProductSearch from "../components/products/ProductSearch.jsx";
import ProductFilters from "../components/products/ProductFilters.jsx";
import ProductTable from "../components/products/ProductTable.jsx";
import ProductCard from "../components/products/ProductCard.jsx";
import ProductPagination from "../components/products/ProductPagination.jsx";
import ProductSkeleton from "../components/products/ProductSkeleton.jsx";
import ErrorMessage from "../components/common/ErrorMessage.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import Button from "../components/common/Button.jsx";
import { useProducts } from "../hooks/useProducts.js";
import { useDebounce } from "../hooks/useDebounce.js";
import { fetchCategories, deleteProduct } from "../services/productService.js";
import { getErrorMessage } from "../services/api/apiErrorHandler.js";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  SEARCH_DELAY_MS,
} from "../utils/constants.js";
import { parsePositiveInt } from "../utils/pagination.js";
import {  deleteLocalProduct } from "../utils/localProducts.js";

const ConfirmModal = lazy(
  () => import("../components/common/ConfirmModel.jsx"),
);

const sortProducts = (items, sort) => {
  if (!sort) return items;
  const [field, dir] = sort.split("-");
  const sorted = [...items].sort((a, b) => {
    let va = a[field];
    let vb = b[field];
    if (typeof va === "string") va = va.toLowerCase();
    if (typeof vb === "string") vb = vb.toLowerCase();
    if (va < vb) return -1;
    if (va > vb) return 1;
    return 0;
  });
  return dir === "desc" ? sorted.reverse() : sorted;
};

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const page = parsePositiveInt(searchParams.get("page"), DEFAULT_PAGE);
  const rawPageSize = parsePositiveInt(
    searchParams.get("pageSize"),
    DEFAULT_PAGE_SIZE,
  );
  const pageSize = useMemo(
    () =>
      [10, 20, 50].includes(rawPageSize) ? rawPageSize : DEFAULT_PAGE_SIZE,
    [rawPageSize],
  );
  const search = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "";

  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, SEARCH_DELAY_MS);

  const [categories, setCategories] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState("");

  const lastUrlSearch = useRef(search);
  useEffect(() => {
    if (lastUrlSearch.current !== search) {
      setSearchInput(search);
      lastUrlSearch.current = search;
    }
  }, [search]);
  useEffect(() => {
    const incomingToast = location.state?.toast;
    if (!incomingToast) return;
    setToast(incomingToast);
    window.history.replaceState({}, "");
  }, []);
  useEffect(() => {
    if (debouncedSearch === search) return;
    const params = new URLSearchParams(searchParams);
    if (debouncedSearch) params.set("q", debouncedSearch);
    else params.delete("q");
    params.set("page", "1");
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    let active = true;
    fetchCategories()
      .then((data) => {
        if (active) setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const { products, total, loading, error, retry } = useProducts({
    page,
    pageSize,
    search,
    category,
  });


  const visibleProducts = useMemo(() => sortProducts(products, sort), [products, sort]);

  // ---- Handlers ----
  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage < 1) return;
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.set("page", String(newPage));
        return params;
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setSearchParams],
  );

  const handlePageSizeChange = useCallback(
    (newSize) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.set("pageSize", String(newSize));
        params.set("page", "1");
        return params;
      });
    },
    [setSearchParams],
  );

  const handleCategoryChange = useCallback(
    (value) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        if (value) params.set("category", value);
        else params.delete("category");
        if (value) params.delete("q");
        params.set("page", "1");
        return params;
      });
      if (value) setSearchInput("");
    },
    [setSearchParams],
  );

  const handleSortChange = useCallback(
    (value) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        if (value) params.set("sort", value);
        else params.delete("sort");
        return params;
      });
    },
    [setSearchParams],
  );

  const handleSearchChange = useCallback((value) => setSearchInput(value), []);
  const handleAddProduct = useCallback(
    () => navigate("/products/new"),
    [navigate],
  );
  const handleDeleteClick = useCallback(
    (product) => setDeleteTarget(product),
    [],
  );
  const handleCancelDelete = useCallback(() => setDeleteTarget(null), []);

  const handleConfirmDelete = useCallback(async () => {
  if (!deleteTarget || deleting) return;
  setDeleting(true);
  try {
    await deleteProduct(deleteTarget.id);
    deleteLocalProduct(deleteTarget.id); 
    retry();                                
    setToast(`"${deleteTarget.title}" deleted successfully.`);
    setDeleteTarget(null);
  } catch (err) {
    setToast(getErrorMessage(err));
  } finally {
    setDeleting(false);
  }
}, [deleteTarget, deleting, retry]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const showEmpty = !loading && !error && visibleProducts.length === 0;

  return (
    <div>
      <div className="mt-2 sm:mt-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your product catalog
          </p>
        </div>
        <Button onClick={handleAddProduct}>+ Add Product</Button>
      </div>

      {toast && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md px-3 py-2">
          {toast}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <ProductSearch value={searchInput} onChange={handleSearchChange} />
          <ProductFilters
            categories={categories}
            category={category}
            sort={sort}
            onCategoryChange={handleCategoryChange}
            onSortChange={handleSortChange}
          />
        </div>
        {search && category && (
          <p className="text-xs text-amber-600">
            Note: Search overrides category filter (API limitation).
          </p>
        )}
      </div>

      {loading && <ProductSkeleton />}

      {!loading && error && <ErrorMessage message={error} onRetry={retry} />}

      {!loading && !error && visibleProducts.length > 0 && (
        <>
          <ProductTable
            products={visibleProducts}
            onDelete={handleDeleteClick}
          />
          <div className="md:hidden grid grid-cols-1 gap-3">
            {visibleProducts.map((p, index) => (
              <ProductCard
                key={p.id}
                product={p}
                onDelete={handleDeleteClick}
                priority={index === 0} // ⬅️ prioritize first image
              />
            ))}
          </div>
          <ProductPagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}

      {showEmpty && (
        <EmptyState
          title="No products found"
          message={
            search || category
              ? "Try changing your search or filter."
              : "No products available right now."
          }
        />
      )}

      {deleteTarget && (
        <Suspense fallback={null}>
          <ConfirmModal
            open
            title="Delete product?"
            message={`Are you sure you want to delete "${deleteTarget.title}"? This will only affect the app view.`}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
            loading={deleting}
          />
        </Suspense>
      )}
    </div>
  );
};

export default Products;
