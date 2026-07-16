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
    const al = page.translations.find((t) => t.languageCode === "al");
    setForm({
      slug: page.slug,
      seoTitle: page.seoTitle ?? "",
      seoDescription: page.seoDescription ?? "",
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
      seoTitle: form.seoTitle || null,
      seoDescription: form.seoDescription || null,
      translations: {
        en: { title: form.titleEn, body: form.bodyEn },
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
      <h1>Pages</h1>

      <table style={{ marginBottom: "1.5rem" }}>
        <thead>
          <tr>
            <th align="left">Title (EN)</th>
            <th align="left">Slug</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {pages.map((page) => (
            <tr key={page.id}>
              <td>{page.translations.find((t) => t.languageCode === "en")?.title ?? "—"}</td>
              <td>{page.slug}</td>
              <td>
                <button onClick={() => startEdit(page)}>Edit</button>{" "}
                <button onClick={() => handleDelete(page.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>{editingId ? "Edit Page" : "Add Page"}</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: 480 }}>
        <label>
          Slug
          <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="about" required />
        </label>
        <label>
          SEO Title
          <input value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
        </label>
        <label>
          SEO Description
          <input value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} />
        </label>
        <label>
          Title (English)
          <input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} required />
        </label>
        <label>
          Body (English)
          <textarea value={form.bodyEn} onChange={(e) => setForm({ ...form, bodyEn: e.target.value })} rows={6} />
        </label>
        <label>
          Title (Albanian)
          <input value={form.titleAl} onChange={(e) => setForm({ ...form, titleAl: e.target.value })} />
        </label>
        <label>
          Body (Albanian)
          <textarea value={form.bodyAl} onChange={(e) => setForm({ ...form, bodyAl: e.target.value })} rows={6} />
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
