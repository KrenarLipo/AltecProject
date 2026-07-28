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
      <h1 className="h3 mb-4">Homepage Slideshow</h1>

      <div className="card shadow-sm mb-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Title (EN)</th>
                <th>Type</th>
                <th>Order</th>
                <th>Visible</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {slides.map((slide) => (
                <tr key={slide.id}>
                  <td>{slide.translations.find((t) => t.languageCode === "en")?.title ?? "—"}</td>
                  <td>{slide.mediaType}</td>
                  <td>{slide.sortOrder}</td>
                  <td>{slide.visible ? "Yes" : "No"}</td>
                  <td className="text-end">
                    <button className="btn btn-outline-secondary btn-sm me-2" onClick={() => startEdit(slide)}>
                      Edit
                    </button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(slide.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {slides.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-muted text-center py-4">
                    No slides yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card shadow-sm" style={{ maxWidth: 640 }}>
        <div className="card-body">
          <h2 className="h5 mb-3">{editingId ? "Edit Slide" : "Add Slide"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label">Media Type</label>
                <select
                  className="form-select"
                  value={form.mediaType}
                  onChange={(e) => setForm({ ...form, mediaType: e.target.value as "IMAGE" | "VIDEO", mediaUrl: "" })}
                >
                  <option value="IMAGE">Image</option>
                  <option value="VIDEO">Video</option>
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Upload {form.mediaType === "VIDEO" ? "video" : "image"}</label>
                <input
                  type="file"
                  className="form-control"
                  accept={form.mediaType === "VIDEO" ? "video/*" : "image/*"}
                  onChange={handleUpload}
                  disabled={uploading}
                />
                {uploading && <span className="small text-muted">Uploading...</span>}
              </div>

              {form.mediaUrl && (
                <div className="col-12">
                  {form.mediaType === "VIDEO" ? (
                    <video src={form.mediaUrl} className="rounded border" style={{ maxWidth: 260 }} controls />
                  ) : (
                    <img src={form.mediaUrl} alt="" className="rounded border" style={{ maxWidth: 260 }} />
                  )}
                </div>
              )}

              <div className="col-12 col-md-6">
                <label className="form-label">Link URL (optional — where the slide's button goes)</label>
                <input
                  className="form-control"
                  value={form.linkUrl}
                  onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                  placeholder="/ac-sales-installation"
                />
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label">Sort Order</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                />
              </div>
              <div className="col-12 col-md-3 d-flex align-items-end">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="slide-visible"
                    checked={form.visible}
                    onChange={(e) => setForm({ ...form, visible: e.target.checked })}
                  />
                  <label className="form-check-label" htmlFor="slide-visible">
                    Visible
                  </label>
                </div>
              </div>

              <div className="col-12">
                <hr />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Title (English)</label>
                <input className="form-control" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Subtitle (English)</label>
                <input className="form-control" value={form.subtitleEn} onChange={(e) => setForm({ ...form, subtitleEn: e.target.value })} />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Title (Italian)</label>
                <input className="form-control" value={form.titleIt} onChange={(e) => setForm({ ...form, titleIt: e.target.value })} />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Subtitle (Italian)</label>
                <input className="form-control" value={form.subtitleIt} onChange={(e) => setForm({ ...form, subtitleIt: e.target.value })} />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Title (Albanian)</label>
                <input className="form-control" value={form.titleAl} onChange={(e) => setForm({ ...form, titleAl: e.target.value })} />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Subtitle (Albanian)</label>
                <input className="form-control" value={form.subtitleAl} onChange={(e) => setForm({ ...form, subtitleAl: e.target.value })} />
              </div>
            </div>

            <div className="d-flex gap-2 mt-4">
              <button type="submit" className="btn bg-primary text-white" disabled={!form.mediaUrl}>
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
