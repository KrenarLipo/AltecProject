import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import ImageManager, { type ManagedImage } from "../components/ImageManager";

type WorkItem = {
  id: number;
  projectType: string | null;
  date: string | null;
  images: ManagedImage[];
  translations: { languageCode: string; title: string; description: string }[];
};

const emptyForm = {
  projectType: "",
  date: "",
  titleEn: "",
  descriptionEn: "",
  titleIt: "",
  descriptionIt: "",
  titleAl: "",
  descriptionAl: "",
};

export default function Works() {
  const [items, setItems] = useState<WorkItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  async function load() {
    setItems(await api.get<WorkItem[]>("/works"));
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(item: WorkItem) {
    setEditingId(item.id);
    const en = item.translations.find((t) => t.languageCode === "en");
    const it = item.translations.find((t) => t.languageCode === "it");
    const al = item.translations.find((t) => t.languageCode === "al");
    setForm({
      projectType: item.projectType ?? "",
      date: item.date ? item.date.slice(0, 10) : "",
      titleEn: en?.title ?? "",
      descriptionEn: en?.description ?? "",
      titleIt: it?.title ?? "",
      descriptionIt: it?.description ?? "",
      titleAl: al?.title ?? "",
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
      projectType: form.projectType || null,
      date: form.date || null,
      translations: {
        en: { title: form.titleEn, description: form.descriptionEn },
        it: { title: form.titleIt, description: form.descriptionIt },
        al: { title: form.titleAl, description: form.descriptionAl },
      },
    };

    if (editingId) {
      await api.put(`/works/${editingId}`, payload);
    } else {
      await api.post("/works", payload);
    }

    resetForm();
    load();
  }

  async function handleDelete(id: number) {
    await api.del(`/works/${id}`);
    load();
  }

  const editingItem = items.find((i) => i.id === editingId) ?? null;

  return (
    <div>
      <h1 className="h3 mb-4">Works</h1>

      <div className="card shadow-sm mb-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Title (EN)</th>
                <th>Type</th>
                <th>Date</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.translations.find((t) => t.languageCode === "en")?.title ?? "—"}</td>
                  <td>{item.projectType ?? "—"}</td>
                  <td>{item.date ? item.date.slice(0, 10) : "—"}</td>
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
                  <td colSpan={4} className="text-muted text-center py-4">
                    No works yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <h2 className="h5 mb-3">{editingId ? "Edit Work" : "Add Work"}</h2>

      {editingItem && <ImageManager resource="works" itemId={editingItem.id} images={editingItem.images} onChange={load} />}
      {!editingId && <p className="text-muted small">Save the project first, then photos can be added while editing it.</p>}

      <div className="card shadow-sm" style={{ maxWidth: 640 }}>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label">Project Type</label>
                <input
                  className="form-control"
                  value={form.projectType}
                  onChange={(e) => setForm({ ...form, projectType: e.target.value })}
                  placeholder="villa, apartment, HVAC..."
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>

              <div className="col-12">
                <hr />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Title (English)</label>
                <input
                  className="form-control"
                  value={form.titleEn}
                  onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
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
                <label className="form-label">Title (Italian)</label>
                <input className="form-control" value={form.titleIt} onChange={(e) => setForm({ ...form, titleIt: e.target.value })} />
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
                <label className="form-label">Title (Albanian)</label>
                <input className="form-control" value={form.titleAl} onChange={(e) => setForm({ ...form, titleAl: e.target.value })} />
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
