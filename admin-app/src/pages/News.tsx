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
    const al = post.translations.find((t) => t.languageCode === "al");
    setForm({
      slug: post.slug,
      coverImage: post.coverImage ?? "",
      publishedAt: post.publishedAt ? post.publishedAt.slice(0, 10) : "",
      titleEn: en?.title ?? "",
      bodyEn: en?.body ?? "",
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
      <h1>News</h1>

      <table style={{ marginBottom: "1.5rem" }}>
        <thead>
          <tr>
            <th align="left">Title (EN)</th>
            <th align="left">Slug</th>
            <th align="left">Published</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id}>
              <td>{post.translations.find((t) => t.languageCode === "en")?.title ?? "—"}</td>
              <td>{post.slug}</td>
              <td>{post.publishedAt ? post.publishedAt.slice(0, 10) : "—"}</td>
              <td>
                <button onClick={() => startEdit(post)}>Edit</button>{" "}
                <button onClick={() => handleDelete(post.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>{editingId ? "Edit News Post" : "Add News Post"}</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: 480 }}>
        <label>
          Slug
          <input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="new-showroom-opening"
            required
          />
        </label>
        <label>
          Cover Image URL
          <input value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} />
        </label>
        <label>
          Published Date
          <input type="date" value={form.publishedAt} onChange={(e) => setForm({ ...form, publishedAt: e.target.value })} />
        </label>
        <label>
          Title (English)
          <input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} required />
        </label>
        <label>
          Body (English)
          <textarea value={form.bodyEn} onChange={(e) => setForm({ ...form, bodyEn: e.target.value })} rows={5} />
        </label>
        <label>
          Title (Albanian)
          <input value={form.titleAl} onChange={(e) => setForm({ ...form, titleAl: e.target.value })} />
        </label>
        <label>
          Body (Albanian)
          <textarea value={form.bodyAl} onChange={(e) => setForm({ ...form, bodyAl: e.target.value })} rows={5} />
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
