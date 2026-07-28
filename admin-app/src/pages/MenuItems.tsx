import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";

type MenuItem = {
  id: number;
  parentId: number | null;
  linkType: "PAGE" | "CATEGORY" | "URL" | "CUSTOM";
  targetSlug: string | null;
  sortOrder: number;
  visible: boolean;
  location: "PRIMARY" | "FOOTER";
  translations: { languageCode: string; label: string }[];
};

const emptyForm = {
  parentId: "",
  linkType: "URL" as MenuItem["linkType"],
  targetSlug: "",
  sortOrder: 0,
  visible: true,
  location: "PRIMARY" as MenuItem["location"],
  labelEn: "",
  labelIt: "",
  labelAl: "",
};

export default function MenuItems() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  async function load() {
    setItems(await api.get<MenuItem[]>("/menu-items"));
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(item: MenuItem) {
    setEditingId(item.id);
    setForm({
      parentId: item.parentId ? String(item.parentId) : "",
      linkType: item.linkType,
      targetSlug: item.targetSlug ?? "",
      sortOrder: item.sortOrder,
      visible: item.visible,
      location: item.location,
      labelEn: item.translations.find((t) => t.languageCode === "en")?.label ?? "",
      labelIt: item.translations.find((t) => t.languageCode === "it")?.label ?? "",
      labelAl: item.translations.find((t) => t.languageCode === "al")?.label ?? "",
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const payload = {
      parentId: form.parentId ? Number(form.parentId) : null,
      linkType: form.linkType,
      targetSlug: form.targetSlug || null,
      sortOrder: form.sortOrder,
      visible: form.visible,
      location: form.location,
      translations: {
        en: { label: form.labelEn },
        it: { label: form.labelIt },
        al: { label: form.labelAl },
      },
    };

    if (editingId) {
      await api.put(`/menu-items/${editingId}`, payload);
    } else {
      await api.post("/menu-items", payload);
    }

    resetForm();
    load();
  }

  async function handleDelete(id: number) {
    await api.del(`/menu-items/${id}`);
    load();
  }

  return (
    <div>
      <h1 className="h3 mb-4">Menu</h1>

      <div className="card shadow-sm mb-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Label (EN)</th>
                <th>Location</th>
                <th>Link Type</th>
                <th>Target</th>
                <th>Order</th>
                <th>Visible</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.translations.find((t) => t.languageCode === "en")?.label ?? "—"}</td>
                  <td>
                    <span className="badge text-bg-light border">{item.location === "FOOTER" ? "Footer" : "Primary"}</span>
                  </td>
                  <td>{item.linkType}</td>
                  <td>{item.targetSlug ?? "—"}</td>
                  <td>{item.sortOrder}</td>
                  <td>{item.visible ? "Yes" : "No"}</td>
                  <td className="text-end">
                    <button className="btn btn-outline-secondary btn-sm me-2" onClick={() => startEdit(item)}>
                      Edit
                    </button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(item.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-muted text-center py-4">
                    No menu items yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card shadow-sm" style={{ maxWidth: 640 }}>
        <div className="card-body">
          <h2 className="h5 mb-3">{editingId ? "Edit Menu Item" : "Add Menu Item"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label">Parent</label>
                <select className="form-select" value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })}>
                  <option value="">— top level —</option>
                  {items
                    .filter((i) => i.id !== editingId)
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.translations.find((t) => t.languageCode === "en")?.label ?? `#${item.id}`}
                      </option>
                    ))}
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Location</label>
                <select
                  className="form-select"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value as MenuItem["location"] })}
                >
                  <option value="PRIMARY">Primary (header nav)</option>
                  <option value="FOOTER">Footer</option>
                </select>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Link Type</label>
                <select
                  className="form-select"
                  value={form.linkType}
                  onChange={(e) => setForm({ ...form, linkType: e.target.value as MenuItem["linkType"] })}
                >
                  <option value="URL">URL</option>
                  <option value="PAGE">Page</option>
                  <option value="CATEGORY">Category</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Target (path or URL)</label>
                <input
                  className="form-control"
                  value={form.targetSlug}
                  onChange={(e) => setForm({ ...form, targetSlug: e.target.value })}
                  placeholder="/about or https://..."
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Sort Order</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                />
              </div>
              <div className="col-12 col-md-6 d-flex align-items-end">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="menu-visible"
                    checked={form.visible}
                    onChange={(e) => setForm({ ...form, visible: e.target.checked })}
                  />
                  <label className="form-check-label" htmlFor="menu-visible">
                    Visible
                  </label>
                </div>
              </div>

              <div className="col-12">
                <hr />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label">Label (English)</label>
                <input className="form-control" value={form.labelEn} onChange={(e) => setForm({ ...form, labelEn: e.target.value })} required />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label">Label (Italian)</label>
                <input className="form-control" value={form.labelIt} onChange={(e) => setForm({ ...form, labelIt: e.target.value })} />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label">Label (Albanian)</label>
                <input className="form-control" value={form.labelAl} onChange={(e) => setForm({ ...form, labelAl: e.target.value })} />
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
