import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";

type WorkItem = {
  id: number;
  projectType: string | null;
  date: string | null;
  translations: { languageCode: string; title: string; description: string }[];
};

const emptyForm = {
  projectType: "",
  date: "",
  titleEn: "",
  descriptionEn: "",
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
    const al = item.translations.find((t) => t.languageCode === "al");
    setForm({
      projectType: item.projectType ?? "",
      date: item.date ? item.date.slice(0, 10) : "",
      titleEn: en?.title ?? "",
      descriptionEn: en?.description ?? "",
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

  return (
    <div>
      <h1>Works</h1>

      <table style={{ marginBottom: "1.5rem" }}>
        <thead>
          <tr>
            <th align="left">Title (EN)</th>
            <th align="left">Type</th>
            <th align="left">Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.translations.find((t) => t.languageCode === "en")?.title ?? "—"}</td>
              <td>{item.projectType ?? "—"}</td>
              <td>{item.date ? item.date.slice(0, 10) : "—"}</td>
              <td>
                <button onClick={() => startEdit(item)}>Edit</button>{" "}
                <button onClick={() => handleDelete(item.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>{editingId ? "Edit Work" : "Add Work"}</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: 480 }}>
        <label>
          Project Type
          <input
            value={form.projectType}
            onChange={(e) => setForm({ ...form, projectType: e.target.value })}
            placeholder="villa, apartment, HVAC..."
          />
        </label>
        <label>
          Date
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </label>
        <label>
          Title (English)
          <input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} required />
        </label>
        <label>
          Description (English)
          <textarea value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} />
        </label>
        <label>
          Title (Albanian)
          <input value={form.titleAl} onChange={(e) => setForm({ ...form, titleAl: e.target.value })} />
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
