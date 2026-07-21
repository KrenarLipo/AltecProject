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
    <div style={{ border: "1px solid #ddd", borderRadius: 4, padding: "0.75rem", marginBottom: "0.75rem" }}>
      <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Photos</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginBottom: "0.6rem" }}>
        {images.map((image) => {
          const primary = image.isPrimary === true || image.isPrimary === 1;
          return (
            <div key={image.id} style={{ width: 110 }}>
              <img
                src={image.url}
                alt=""
                style={{
                  width: 110,
                  height: 90,
                  objectFit: "cover",
                  borderRadius: 4,
                  border: primary ? "3px solid var(--color-red)" : "1px solid #ddd",
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginTop: 2 }}>
                {primary ? (
                  <span style={{ color: "var(--color-red)", fontWeight: 600 }}>Thumbnail</span>
                ) : (
                  <button type="button" onClick={() => setPrimary(image.id)} style={{ fontSize: "0.75rem" }}>
                    Set thumbnail
                  </button>
                )}
                <button type="button" onClick={() => deleteImage(image.id)} style={{ fontSize: "0.75rem" }}>
                  Delete
                </button>
              </div>
            </div>
          );
        })}
        {images.length === 0 && <p style={{ color: "#888", fontSize: "0.85rem" }}>No photos yet.</p>}
      </div>
      <input type="file" accept="image/*" multiple onChange={handleFiles} disabled={uploading} />
      {uploading && <span style={{ marginLeft: "0.5rem", fontSize: "0.85rem" }}>Uploading...</span>}
    </div>
  );
}
