import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";

type NewsPost = {
  id: number;
  slug: string;
  coverImage: string | null;
  publishedAt: string | null;
  translations: { languageCode: string; title: string; body: string }[];
};

const emptyForm = {
  slug: "",
  coverImage: "",
  publishedAt: "",
  titleEn: "",
  bodyEn: "",
  titleIt: "",
  bodyIt: "",
  titleAl: "",
  bodyAl: "",
};

export default function News() {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  async function load() {
    setPosts(await api.get<NewsPost[]>("/news"));
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(post: NewsPost) {
    setEditingId(post.id);
    const en = post.translations.find((t) => t.languageCode === "en");
    const it = post.translations.find((t) => t.languageCode === "it");
    const al = post.translations.find((t) => t.languageCode === "al");
    setForm({
      slug: post.slug,
      coverImage: post.coverImage ?? "",
      publishedAt: post.publishedAt ? post.publishedAt.slice(0, 10) : "",
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
      coverImage: form.coverImage || null,
      publishedAt: form.publishedAt || null,
      translations: {
        en: { title: form.titleEn, body: form.bodyEn },
        it: { title: form.titleIt, body: form.bodyIt },
        al: { title: form.titleAl, body: form.bodyAl },
      },
    };

    if (editingId) {
      await api.put(`/news/${editingId}`, payload);
    } else {
      await api.post("/news", payload);
    }

    resetForm();
    load();
  }

  async function handleDelete(id: number) {
    await api.del(`/news/${id}`);
    load();
  }

  return (
    <div>
      <h1 className="h3 mb-4">News</h1>

      <div className="card shadow-sm mb-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Title (EN)</th>
                <th>Slug</th>
                <th>Published</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td>{post.translations.find((t) => t.languageCode === "en")?.title ?? "—"}</td>
                  <td>{post.slug}</td>
                  <td>{post.publishedAt ? post.publishedAt.slice(0, 10) : "—"}</td>
                  <td className="text-end">
                    <button className="btn btn-outline-secondary btn-sm me-2" onClick={() => startEdit(post)}>
                      Edit
                    </button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(post.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-muted text-center py-4">
                    No posts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card shadow-sm" style={{ maxWidth: 640 }}>
        <div className="card-body">
          <h2 className="h5 mb-3">{editingId ? "Edit News Post" : "Add News Post"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label">Slug</label>
                <input
                  className="form-control"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="new-showroom-opening"
                  required
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Published Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.publishedAt}
                  onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                />
              </div>
              <div className="col-12">
                <label className="form-label">Cover Image URL</label>
                <input
                  className="form-control"
                  value={form.coverImage}
                  onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
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
                  rows={5}
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
                  rows={5}
                  value={form.bodyIt}
                  onChange={(e) => setForm({ ...form, bodyIt: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Body (Albanian)</label>
                <textarea
                  className="form-control"
                  rows={5}
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
