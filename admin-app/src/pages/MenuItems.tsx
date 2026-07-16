import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";

type MenuItem = {
  id: number;
  parentId: number | null;
  linkType: "PAGE" | "CATEGORY" | "URL" | "CUSTOM";
  targetSlug: string | null;
  sortOrder: number;
  visible: boolean;
  translations: { languageCode: string; label: string }[];
};

const emptyForm = {
  parentId: "",
  linkType: "URL" as MenuItem["linkType"],
  targetSlug: "",
  sortOrder: 0,
  visible: true,
  labelEn: "",
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
      labelEn: item.translations.find((t) => t.languageCode === "en")?.label ?? "",
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
      translations: {
        en: { label: form.labelEn },
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
      <h1>Menu</h1>

      <table style={{ marginBottom: "1.5rem" }}>
        <thead>
          <tr>
            <th align="left">Label (EN)</th>
            <th align="left">Link Type</th>
            <th align="left">Target</th>
            <th align="left">Order</th>
            <th align="left">Visible</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.translations.find((t) => t.languageCode === "en")?.label ?? "—"}</td>
              <td>{item.linkType}</td>
              <td>{item.targetSlug ?? "—"}</td>
              <td>{item.sortOrder}</td>
              <td>{item.visible ? "Yes" : "No"}</td>
              <td>
                <button onClick={() => startEdit(item)}>Edit</button>{" "}
                <button onClick={() => handleDelete(item.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>{editingId ? "Edit Menu Item" : "Add Menu Item"}</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: 400 }}>
        <label>
          Parent
          <select value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })}>
            <option value="">— top level —</option>
            {items
              .filter((i) => i.id !== editingId)
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.translations.find((t) => t.languageCode === "en")?.label ?? `#${item.id}`}
                </option>
              ))}
          </select>
        </label>
        <label>
          Link Type
          <select
            value={form.linkType}
            onChange={(e) => setForm({ ...form, linkType: e.target.value as MenuItem["linkType"] })}
          >
            <option value="URL">URL</option>
            <option value="PAGE">Page</option>
            <option value="CATEGORY">Category</option>
            <option value="CUSTOM">Custom</option>
          </select>
        </label>
        <label>
          Target (path or URL)
          <input
            value={form.targetSlug}
            onChange={(e) => setForm({ ...form, targetSlug: e.target.value })}
            placeholder="/about or https://..."
          />
        </label>
        <label>
          Sort Order
          <input
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
          />
        </label>
        <label>
          <input type="checkbox" checked={form.visible} onChange={(e) => setForm({ ...form, visible: e.target.checked })} />{" "}
          Visible
        </label>
        <label>
          Label (English)
          <input value={form.labelEn} onChange={(e) => setForm({ ...form, labelEn: e.target.value })} required />
        </label>
        <label>
          Label (Albanian)
          <input value={form.labelAl} onChange={(e) => setForm({ ...form, labelAl: e.target.value })} />
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
