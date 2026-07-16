import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";

type Category = {
  id: number;
  type: "SERVICE" | "PRODUCT";
  parentId: number | null;
  translations: { languageCode: string; name: string }[];
};

const emptyForm = {
  type: "PRODUCT" as "SERVICE" | "PRODUCT",
  nameEn: "",
  nameAl: "",
};

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  async function load() {
    setCategories(await api.get<Category[]>("/categories"));
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(category: Category) {
    setEditingId(category.id);
    setForm({
      type: category.type,
      nameEn: category.translations.find((t) => t.languageCode === "en")?.name ?? "",
      nameAl: category.translations.find((t) => t.languageCode === "al")?.name ?? "",
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const payload = {
      type: form.type,
      translations: {
        en: { name: form.nameEn },
        al: { name: form.nameAl },
      },
    };

    if (editingId) {
      await api.put(`/categories/${editingId}`, payload);
    } else {
      await api.post("/categories", payload);
    }

    resetForm();
    load();
  }

  async function handleDelete(id: number) {
    await api.del(`/categories/${id}`);
    load();
  }

  return (
    <div>
      <h1>Categories</h1>

      <table style={{ marginBottom: "1.5rem" }}>
        <thead>
          <tr>
            <th align="left">Name (EN)</th>
            <th align="left">Type</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>{category.translations.find((t) => t.languageCode === "en")?.name ?? "—"}</td>
              <td>{category.type}</td>
              <td>
                <button onClick={() => startEdit(category)}>Edit</button>{" "}
                <button onClick={() => handleDelete(category.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>{editingId ? "Edit Category" : "Add Category"}</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: 400 }}>
        <label>
          Type
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "SERVICE" | "PRODUCT" })}>
            <option value="PRODUCT">Product</option>
            <option value="SERVICE">Service</option>
          </select>
        </label>
        <label>
          Name (English)
          <input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} required />
        </label>
        <label>
          Name (Albanian)
          <input value={form.nameAl} onChange={(e) => setForm({ ...form, nameAl: e.target.value })} />
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
