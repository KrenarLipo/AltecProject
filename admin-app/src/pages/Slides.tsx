import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { api } from "../lib/api";

type Slide = {
  id: number;
  mediaType: "IMAGE" | "VIDEO";
  mediaUrl: string;
  linkUrl: string | null;
  sortOrder: number;
  visible: boolean;
  translations: { languageCode: string; title: string | null; subtitle: string | null }[];
};

const emptyForm = {
  mediaType: "IMAGE" as "IMAGE" | "VIDEO",
  mediaUrl: "",
  linkUrl: "",
  sortOrder: 0,
  visible: true,
  titleEn: "",
  subtitleEn: "",
  titleIt: "",
  subtitleIt: "",
  titleAl: "",
  subtitleAl: "",
};

export default function Slides() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  async function load() {
    setSlides(await api.get<Slide[]>("/slides"));
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(slide: Slide) {
    setEditingId(slide.id);
    const en = slide.translations.find((t) => t.languageCode === "en");
    const it = slide.translations.find((t) => t.languageCode === "it");
    const al = slide.translations.find((t) => t.languageCode === "al");
    setForm({
      mediaType: slide.mediaType,
      mediaUrl: slide.mediaUrl,
      linkUrl: slide.linkUrl ?? "",
      sortOrder: slide.sortOrder,
      visible: slide.visible,
      titleEn: en?.title ?? "",
      subtitleEn: en?.subtitle ?? "",
      titleIt: it?.title ?? "",
      subtitleIt: it?.subtitle ?? "",
      titleAl: al?.title ?? "",
      subtitleAl: al?.subtitle ?? "",
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await api.upload<{ url: string }>("/uploads", file);
      setForm((f) => ({ ...f, mediaUrl: url }));
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const payload = {
      mediaType: form.mediaType,
      mediaUrl: form.mediaUrl,
      linkUrl: form.linkUrl || null,
      sortOrder: form.sortOrder,
      visible: form.visible,
      translations: {
        en: { title: form.titleEn, subtitle: form.subtitleEn },
        it: { title: form.titleIt, subtitle: form.subtitleIt },
        al: { title: form.titleAl, subtitle: form.subtitleAl },
      },
    };

    if (editingId) {
      await api.put(`/slides/${editingId}`, payload);
    } else {
      await api.post("/slides", payload);
    }

    resetForm();
    load();
  }

  async function handleDelete(id: number) {
    await api.del(`/slides/${id}`);
    load();
  }

  return (
    <div>
      <h1>Homepage Slideshow</h1>

      <table style={{ marginBottom: "1.5rem" }}>
        <thead>
          <tr>
            <th align="left">Title (EN)</th>
            <th align="left">Type</th>
            <th align="left">Order</th>
            <th align="left">Visible</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {slides.map((slide) => (
            <tr key={slide.id}>
              <td>{slide.translations.find((t) => t.languageCode === "en")?.title ?? "—"}</td>
              <td>{slide.mediaType}</td>
              <td>{slide.sortOrder}</td>
              <td>{slide.visible ? "Yes" : "No"}</td>
              <td>
                <button onClick={() => startEdit(slide)}>Edit</button>{" "}
                <button onClick={() => handleDelete(slide.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>{editingId ? "Edit Slide" : "Add Slide"}</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: 480 }}>
        <label>
          Media Type
          <select
            value={form.mediaType}
            onChange={(e) => setForm({ ...form, mediaType: e.target.value as "IMAGE" | "VIDEO", mediaUrl: "" })}
          >
            <option value="IMAGE">Image</option>
            <option value="VIDEO">Video</option>
          </select>
        </label>
        <label>
          Upload {form.mediaType === "VIDEO" ? "video" : "image"}
          <input
            type="file"
            accept={form.mediaType === "VIDEO" ? "video/*" : "image/*"}
            onChange={handleUpload}
            disabled={uploading}
          />
          {uploading && <span> Uploading...</span>}
        </label>
        {form.mediaUrl && (
          <div>
            {form.mediaType === "VIDEO" ? (
              <video src={form.mediaUrl} style={{ maxWidth: 240 }} controls />
            ) : (
              <img src={form.mediaUrl} alt="" style={{ maxWidth: 240 }} />
            )}
          </div>
        )}
        <label>
          Link URL (optional — where the slide's button goes)
          <input value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} placeholder="/ac-sales-installation" />
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
          Title (English)
          <input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} />
        </label>
        <label>
          Subtitle (English)
          <input value={form.subtitleEn} onChange={(e) => setForm({ ...form, subtitleEn: e.target.value })} />
        </label>
        <label>
          Title (Italian)
          <input value={form.titleIt} onChange={(e) => setForm({ ...form, titleIt: e.target.value })} />
        </label>
        <label>
          Subtitle (Italian)
          <input value={form.subtitleIt} onChange={(e) => setForm({ ...form, subtitleIt: e.target.value })} />
        </label>
        <label>
          Title (Albanian)
          <input value={form.titleAl} onChange={(e) => setForm({ ...form, titleAl: e.target.value })} />
        </label>
        <label>
          Subtitle (Albanian)
          <input value={form.subtitleAl} onChange={(e) => setForm({ ...form, subtitleAl: e.target.value })} />
        </label>
        <div>
          <button type="submit" disabled={!form.mediaUrl}>{editingId ? "Save" : "Add"}</button>{" "}
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
