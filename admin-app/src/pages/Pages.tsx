import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";

type Page = {
  id: number;
  slug: string;
  seoTitle: string | null;
  seoDescription: string | null;
  translations: { languageCode: string; title: string; body: string }[];
};

const emptyForm = {
  slug: "",
  seoTitle: "",
  seoDescription: "",
  titleEn: "",
  bodyEn: "",
  titleIt: "",
  bodyIt: "",
  titleAl: "",
  bodyAl: "",
};

export default function Pages() {
  const [pages, setPages] = useState<Page[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  async function load() {
    setPages(await api.get<Page[]>("/pages"));
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(page: Page) {
    setEditingId(page.id);
    const en = page.translations.find((t) => t.languageCode === "en");
    const it = page.translations.find((t) => t.languageCode === "it");
    const al = page.translations.find((t) => t.languageCode === "al");
    setForm({
      slug: page.slug,
      seoTitle: page.seoTitle ?? "",
      seoDescription: page.seoDescription ?? "",
      titleEn: en?.title ?? "",
      bodyEn: en?.body ?? "",
      titleIt: it?.title ?? "",
      bodyIt: it?.body ?? "",
      titleAl: al?.title ?? "",
      bodyAl: al?.body ?? "",
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const payload = {
      slug: form.slug,
      seoTitle: form.seoTitle || null,
      seoDescription: form.seoDescription || null,
      translations: {
        en: { title: form.titleEn, body: form.bodyEn },
        it: { title: form.titleIt, body: form.bodyIt },
        al: { title: form.titleAl, body: form.bodyAl },
      },
    };

    if (editingId) {
      await api.put(`/pages/${editingId}`, payload);
    } else {
      await api.post("/pages", payload);
    }

    resetForm();
    load();
  }

  async function handleDelete(id: number) {
    await api.del(`/pages/${id}`);
    load();
  }

  return (
    <div>
      <h1 className="h3 mb-4">Pages</h1>

      <div className="card shadow-sm mb-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Title (EN)</th>
                <th>Slug</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id}>
                  <td>{page.translations.find((t) => t.languageCode === "en")?.title ?? "—"}</td>
                  <td>{page.slug}</td>
                  <td className="text-end">
                    <button className="btn btn-outline-secondary btn-sm me-2" onClick={() => startEdit(page)}>
                      Edit
                    </button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(page.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-muted text-center py-4">
                    No pages yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card shadow-sm" style={{ maxWidth: 640 }}>
        <div className="card-body">
          <h2 className="h5 mb-3">{editingId ? "Edit Page" : "Add Page"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="form-label">Slug</label>
                <input
                  className="form-control"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="about"
                  required
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label">SEO Title</label>
                <input className="form-control" value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label">SEO Description</label>
                <input
                  className="form-control"
                  value={form.seoDescription}
                  onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                />
              </div>

              <div className="col-12">
                <hr />
              </div>

              <div className="col-12">
                <label className="form-label">Title (English)</label>
                <input
                  className="form-control"
                  value={form.titleEn}
                  onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                  required
                />
              </div>
              <div className="col-12">
                <label className="form-label">Body (English)</label>
                <textarea
                  className="form-control"
                  rows={6}
                  value={form.bodyEn}
                  onChange={(e) => setForm({ ...form, bodyEn: e.target.value })}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Title (Italian)</label>
                <input className="form-control" value={form.titleIt} onChange={(e) => setForm({ ...form, titleIt: e.target.value })} />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Title (Albanian)</label>
                <input className="form-control" value={form.titleAl} onChange={(e) => setForm({ ...form, titleAl: e.target.value })} />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Body (Italian)</label>
                <textarea
                  className="form-control"
                  rows={6}
                  value={form.bodyIt}
                  onChange={(e) => setForm({ ...form, bodyIt: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Body (Albanian)</label>
                <textarea
                  className="form-control"
                  rows={6}
                  value={form.bodyAl}
                  onChange={(e) => setForm({ ...form, bodyAl: e.target.value })}
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
