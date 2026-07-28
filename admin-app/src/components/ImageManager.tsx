import { useState, type ChangeEvent } from "react";
import { api } from "../lib/api";

export type ManagedImage = {
  id: number;
  url: string;
  isPrimary: boolean | number;
};

type Props = {
  resource: "products" | "works";
  itemId: number;
  images: ManagedImage[];
  onChange: () => void;
};

export default function ImageManager({ resource, itemId, images, onChange }: Props) {
  const [uploading, setUploading] = useState(false);

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const { url } = await api.upload<{ url: string }>("/uploads", file);
        await api.post(`/${resource}/${itemId}/images`, { url });
      }
      onChange();
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function setPrimary(imageId: number) {
    await api.put(`/${resource}/${itemId}/images/${imageId}`, { isPrimary: true });
    onChange();
  }

  async function deleteImage(imageId: number) {
    await api.del(`/${resource}/${itemId}/images/${imageId}`);
    onChange();
  }

  return (
    <div className="card shadow-sm mb-3">
      <div className="card-body">
        <h3 className="h6 mb-3">Photos</h3>
        <div className="d-flex flex-wrap gap-3 mb-3">
          {images.map((image) => {
            const primary = image.isPrimary === true || image.isPrimary === 1;
            return (
              <div key={image.id} style={{ width: 120 }}>
                <img
                  src={image.url}
                  alt=""
                  className={`w-100 rounded ${primary ? "border border-3 border-primary" : "border"}`}
                  style={{ height: 96, objectFit: "cover" }}
                />
                <div className="d-flex justify-content-between align-items-center mt-1">
                  {primary ? (
                    <span className="badge bg-primary">Thumbnail</span>
                  ) : (
                    <button type="button" className="btn btn-link btn-sm p-0" onClick={() => setPrimary(image.id)}>
                      Set thumbnail
                    </button>
                  )}
                  <button type="button" className="btn btn-link btn-sm text-danger p-0" onClick={() => deleteImage(image.id)}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
          {images.length === 0 && <p className="text-muted small mb-0">No photos yet.</p>}
        </div>
        <input
          type="file"
          className="form-control form-control-sm"
          style={{ maxWidth: 320 }}
          accept="image/*"
          multiple
          onChange={handleFiles}
          disabled={uploading}
        />
        {uploading && <span className="small text-muted ms-2">Uploading...</span>}
      </div>
    </div>
  );
}
