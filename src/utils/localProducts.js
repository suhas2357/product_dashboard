const KEY = 'local_products_overlay';

const EMPTY = { added: [], updated: {}, deleted: [] };

const read = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY, added: [], updated: {}, deleted: [] };
    const parsed = JSON.parse(raw);
    return {
      added: Array.isArray(parsed.added) ? parsed.added : [],
      updated: parsed.updated && typeof parsed.updated === 'object' ? parsed.updated : {},
      deleted: Array.isArray(parsed.deleted) ? parsed.deleted : [],
    };
  } catch {
    return { ...EMPTY, added: [], updated: {}, deleted: [] };
  }
};

const write = (data) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
};

// All locally-added ids start here — well above DummyJSON's ~200 range
export const LOCAL_ID_START = 10_000;

const nextLocalId = (data) => {
  const used = [
    ...data.added.map((p) => Number(p.id) || 0),
    ...Object.keys(data.updated).map(Number).filter(Number.isFinite),
    ...data.deleted.map(Number).filter(Number.isFinite),
  ];
  const max = used.length ? Math.max(...used) : LOCAL_ID_START - 1;
  return Math.max(LOCAL_ID_START, max + 1);
};

export const getOverlay = () => read();

export const addLocalProduct = (product) => {
  const data = read();
  const id = nextLocalId(data);

  const stored = {
    id,
    title: product.title || 'Untitled',
    description: product.description || '',
    price: Number(product.price) || 0,
    stock: Number(product.stock) || 0,
    category: product.category || '',
    brand: product.brand || '',
    rating: Number(product.rating) || 0,
    // ✅ Use uploaded image if provided; otherwise a placeholder
    thumbnail:
      product.thumbnail ||
      'https://cdn.dummyjson.com/products/images/beauty/Essence%20Mascara%20Lash%20Princess/thumbnail.png',
    images: Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : (product.thumbnail ? [product.thumbnail] : []),
    reviews: Array.isArray(product.reviews) ? product.reviews : [],
    __local: true,
  };

  data.added = [stored, ...data.added];


  try {
    write(data);
  } catch (err) {
    if (err.name === 'QuotaExceededError' || /quota/i.test(err.message)) {
      throw new Error('Storage is full. Delete some local products or remove images.');
    }
    throw err;
  }

  return stored;
};

export const updateLocalProduct = (id, updates) => {
  const numericId = Number(id);
  const data = read();

  const addedIdx = data.added.findIndex((p) => Number(p.id) === numericId);
  if (addedIdx !== -1) {
    data.added[addedIdx] = { ...data.added[addedIdx], ...updates, id: numericId };
    write(data);
    return data.added[addedIdx];
  }

  data.updated[numericId] = { ...(data.updated[numericId] || {}), ...updates };
  write(data);
  return data.updated[numericId];
};

export const deleteLocalProduct = (id) => {
  const numericId = Number(id);
  const data = read();

  const before = data.added.length;
  data.added = data.added.filter((p) => Number(p.id) !== numericId);
  if (data.added.length !== before) {
    write(data);
    return;
  }

  if (!data.deleted.includes(numericId)) {
    data.deleted = [...data.deleted, numericId];
  }
  write(data);
};

/** Return a single locally-added product by id, or null. */
export const getLocalProductById = (id) => {
  const numericId = Number(id);
  const { added } = read();
  return added.find((p) => Number(p.id) === numericId) || null;
};

/** Merge the local overlay into a list of API products. */
export const applyOverlay = (products) => {
  const { added, updated, deleted } = read();
  const deletedSet = new Set(deleted.map(Number));

  const merged = products
    .filter((p) => !deletedSet.has(Number(p.id)))
    .map((p) => (updated[p.id] ? { ...p, ...updated[p.id] } : p));

  return [...added, ...merged];
};

export const clearLocalProducts = () => {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
};