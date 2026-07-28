import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { api } from "../lib/api";
import ImageManager, { type ManagedImage } from "../components/ImageManager";

type Category = {
  id: number;
  translations: { languageCode: string; name: string }[];
};

type Product = {
  id: number;
  categoryId: number | null;
  brand: string | null;
  published: boolean;
  brochureUrl: string | null;
  images: ManagedImage[];
  translations: { languageCode: string; name: string; description: string }[];
};

const emptyForm = {
  categoryId: "",
  brand: "",
  published: false,
  brochureUrl: "",
  nameEn: "",
  descriptionEn: "",
  nameIt: "",
  descriptionIt: "",
  nameAl: "",
  descriptionAl: "",
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploadingBrochure, setUploadingBrochure] = useState(false);

  async function load() {
    const [productsRes, categoriesRes] = await Promise.all([
      api.get<Product[]>("/products"),
      api.get<Category[]>("/categories"),
    ]);
    setProducts(productsRes);
    setCategories(categoriesRes);
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(product: Product) {
    setEditingId(product.id);
    const en = product.translations.find((t) => t.languageCode === "en");
    const it = product.translations.find((t) => t.languageCode === "it");
    const al = product.translations.find((t) => t.languageCode === "al");
    setForm({
      categoryId: product.categoryId ? String(product.categoryId) : "",
      brand: product.brand ?? "",
      published: product.published,
      brochureUrl: product.brochureUrl ?? "",
      nameEn: en?.name ?? "",
      descriptionEn: en?.description ?? "",
      nameIt: it?.name ?? "",
      descriptionIt: it?.description ?? "",
      nameAl: al?.name ?? "",
      descriptionAl: al?.description ?? "",
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const payload = {
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      brand: form.brand || null,
      published: form.published,
      brochureUrl: form.brochureUrl || null,
      translations: {
        en: { name: form.nameEn, description: form.descriptionEn },
        it: { name: form.nameIt, description: form.descriptionIt },
        al: { name: form.nameAl, description: form.descriptionAl },
      },
    };

    if (editingId) {
      await api.put(`/products/${editingId}`, payload);
    } else {
      await api.post("/products", payload);
    }

    resetForm();
    load();
  }

  async function handleDelete(id: number) {
    await api.del(`/products/${id}`);
    load();
  }

  async function handleBrochureUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingBrochure(true);
    try {
      const { url } = await api.upload<{ url: string }>("/uploads", file);
      setForm((f) => ({ ...f, brochureUrl: url }));
    } finally {
      setUploadingBrochure(false);
      event.target.value = "";
    }
  }

  function categoryName(id: number | null) {
    if (!id) return "—";
    const category = categories.find((c) => c.id === id);
    return category?.translations.find((t) => t.languageCode === "en")?.name ?? `#${id}`;
  }

  const editingProduct = products.find((p) => p.id === editingId) ?? null;

  return (
    <div>
      <h1 className="h3 mb-4">Products</h1>

      <div className="card shadow-sm mb-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Name (EN)</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Published</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.translations.find((t) => t.languageCode === "en")?.name ?? "—"}</td>
                  <td>{categoryName(product.categoryId)}</td>
                  <td>{product.brand ?? "—"}</td>
                  <td>
                    {product.published ? (
                      <span className="badge bg-success">Yes</span>
                    ) : (
                      <span className="badge bg-secondary">No</span>
                    )}
                  </td>
                  <td className="text-end">
                    <button className="btn btn-outline-secondary btn-sm me-2" onClick={() => startEdit(product)}>
                      Edit
                    </button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(product.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-muted text-center py-4">
                    No products yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <h2 className="h5 mb-3">{editingId ? "Edit Product" : "Add Product"}</h2>

      {editingProduct && (
        <ImageManager resource="products" itemId={editingProduct.id} images={editingProduct.images} onChange={load} />
      )}
      {!editingId && <p className="text-muted small">Save the product first, then photos can be added while editing it.</p>}

      <div className="card shadow-sm" style={{ maxWidth: 640 }}>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                >
                  <option value="">— none —</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.translations.find((t) => t.languageCode === "en")?.name ?? `#${category.id}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Brand</label>
                <input
                  className="form-control"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                />
              </div>

              <div className="col-12">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="product-published"
                    checked={form.published}
                    onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  />
                  <label className="form-check-label" htmlFor="product-published">
                    Published
                  </label>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Brochure PDF URL</label>
                <input
                  className="form-control"
                  value={form.brochureUrl}
                  onChange={(e) => setForm({ ...form, brochureUrl: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Or upload a PDF</label>
                <input
                  type="file"
                  className="form-control"
                  accept="application/pdf"
                  onChange={handleBrochureUpload}
                  disabled={uploadingBrochure}
                />
                {uploadingBrochure && <span className="small text-muted">Uploading...</span>}
              </div>

              <div className="col-12">
                <hr />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Name (English)</label>
                <input
                  className="form-control"
                  value={form.nameEn}
                  onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                  required
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Description (English)</label>
                <textarea
                  className="form-control"
                  value={form.descriptionEn}
                  onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Name (Italian)</label>
                <input
                  className="form-control"
                  value={form.nameIt}
                  onChange={(e) => setForm({ ...form, nameIt: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Description (Italian)</label>
                <textarea
                  className="form-control"
                  value={form.descriptionIt}
                  onChange={(e) => setForm({ ...form, descriptionIt: e.target.value })}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Name (Albanian)</label>
                <input
                  className="form-control"
                  value={form.nameAl}
                  onChange={(e) => setForm({ ...form, nameAl: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Description (Albanian)</label>
                <textarea
                  className="form-control"
                  value={form.descriptionAl}
                  onChange={(e) => setForm({ ...form, descriptionAl: e.target.value })}
                />
              </div>
            </div>

            <div className="d-flex gap-2 mt-4">
              <button type="submit" className="btn bg-primary text-white">
                {editingId ? "Save" : "Add"}
              </button>
              {editingId && (
                <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
