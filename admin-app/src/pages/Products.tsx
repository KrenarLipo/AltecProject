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
      <h1>Products</h1>

      <table style={{ marginBottom: "1.5rem" }}>
        <thead>
          <tr>
            <th align="left">Name (EN)</th>
            <th align="left">Category</th>
            <th align="left">Brand</th>
            <th align="left">Published</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.translations.find((t) => t.languageCode === "en")?.name ?? "—"}</td>
              <td>{categoryName(product.categoryId)}</td>
              <td>{product.brand ?? "—"}</td>
              <td>{product.published ? "Yes" : "No"}</td>
              <td>
                <button onClick={() => startEdit(product)}>Edit</button>{" "}
                <button onClick={() => handleDelete(product.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>{editingId ? "Edit Product" : "Add Product"}</h2>

      {editingProduct && (
        <ImageManager resource="products" itemId={editingProduct.id} images={editingProduct.images} onChange={load} />
      )}
      {!editingId && (
        <p style={{ color: "#888", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
          Save the product first, then photos can be added while editing it.
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: 480 }}>
        <label>
          Category
          <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            <option value="">— none —</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.translations.find((t) => t.languageCode === "en")?.name ?? `#${category.id}`}
              </option>
            ))}
          </select>
        </label>
        <label>
          Brand
          <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
        </label>
        <label>
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
          />{" "}
          Published
        </label>
        <label>
          Brochure PDF URL
          <input value={form.brochureUrl} onChange={(e) => setForm({ ...form, brochureUrl: e.target.value })} />
        </label>
        <label>
          Or upload a PDF
          <input type="file" accept="application/pdf" onChange={handleBrochureUpload} disabled={uploadingBrochure} />
          {uploadingBrochure && <span> Uploading...</span>}
        </label>
        <label>
          Name (English)
          <input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} required />
        </label>
        <label>
          Description (English)
          <textarea value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} />
        </label>
        <label>
          Name (Italian)
          <input value={form.nameIt} onChange={(e) => setForm({ ...form, nameIt: e.target.value })} />
        </label>
        <label>
          Description (Italian)
          <textarea value={form.descriptionIt} onChange={(e) => setForm({ ...form, descriptionIt: e.target.value })} />
        </label>
        <label>
          Name (Albanian)
          <input value={form.nameAl} onChange={(e) => setForm({ ...form, nameAl: e.target.value })} />
        </label>
        <label>
          Description (Albanian)
          <textarea value={form.descriptionAl} onChange={(e) => setForm({ ...form, descriptionAl: e.target.value })} />
        </label>
        <div>
          <button type="submit">{editingId ? "Save" : "Add"}</button>{" "}
          {editingId && (
            <button type="button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
