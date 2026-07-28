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
  nameIt: "",
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
      nameIt: category.translations.find((t) => t.languageCode === "it")?.name ?? "",
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
        it: { name: form.nameIt },
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
      <h1 className="h3 mb-4">Categories</h1>

      <div className="card shadow-sm mb-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Name (EN)</th>
                <th>Type</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.translations.find((t) => t.languageCode === "en")?.name ?? "—"}</td>
                  <td>{category.type}</td>
                  <td className="text-end">
                    <button className="btn btn-outline-secondary btn-sm me-2" onClick={() => startEdit(category)}>
                      Edit
                    </button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(category.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-muted text-center py-4">
                    No categories yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card shadow-sm" style={{ maxWidth: 520 }}>
        <div className="card-body">
          <h2 className="h5 mb-3">{editingId ? "Edit Category" : "Add Category"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Type</label>
              <select
                className="form-select"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as "SERVICE" | "PRODUCT" })}
              >
                <option value="PRODUCT">Product</option>
                <option value="SERVICE">Service</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Name (English)</label>
              <input
                className="form-control"
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Name (Italian)</label>
              <input
                className="form-control"
                value={form.nameIt}
                onChange={(e) => setForm({ ...form, nameIt: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Name (Albanian)</label>
              <input
                className="form-control"
                value={form.nameAl}
                onChange={(e) => setForm({ ...form, nameAl: e.target.value })}
              />
            </div>
            <div className="d-flex gap-2">
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
