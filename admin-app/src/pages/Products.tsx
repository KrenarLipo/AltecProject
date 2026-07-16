import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";

type Category = {
  id: number;
  translations: { languageCode: string; name: string }[];
};

type Product = {
  id: number;
  categoryId: number | null;
  brand: string | null;
  published: boolean;
  translations: { languageCode: string; name: string; description: string }[];
};

const emptyForm = {
  categoryId: "",
  brand: "",
  published: false,
  nameEn: "",
  descriptionEn: "",
  nameAl: "",
  descriptionAl: "",
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

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
    const al = product.translations.find((t) => t.languageCode === "al");
    setForm({
      categoryId: product.categoryId ? String(product.categoryId) : "",
      brand: product.brand ?? "",
      published: product.published,
      nameEn: en?.name ?? "",
      descriptionEn: en?.description ?? "",
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
      translations: {
        en: { name: form.nameEn, description: form.descriptionEn },
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

  function categoryName(id: number | null) {
    if (!id) return "—";
    const category = categories.find((c) => c.id === id);
    return category?.translations.find((t) => t.languageCode === "en")?.name ?? `#${id}`;
  }

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
          Name (English)
          <input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} required />
        </label>
        <label>
          Description (English)
          <textarea value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} />
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
