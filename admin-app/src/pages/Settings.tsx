import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { api } from "../lib/api";

const fields: { key: string; label: string }[] = [
  { key: "site_name", label: "Site Name" },
  { key: "contact_phone", label: "Contact Phone" },
  { key: "contact_email", label: "Contact Email" },
  { key: "contact_address", label: "Contact Address" },
  { key: "social_facebook", label: "Facebook URL" },
  { key: "social_instagram", label: "Instagram URL" },
  { key: "social_linkedin", label: "LinkedIn URL" },
  { key: "social_youtube", label: "YouTube URL" },
  { key: "homepage_promo_title", label: "Homepage Promo Title" },
  { key: "homepage_promo_body", label: "Homepage Promo Body" },
];

export default function Settings() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.get<Record<string, string>>("/settings").then(setValues);
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await api.put("/settings", values);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleVideoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await api.upload<{ url: string }>("/uploads", file);
      setValues((v) => ({ ...v, login_video_upload_url: url }));
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  const underConstruction = values.site_status === "construction";
  const loginVideoType = values.login_video_type === "upload" ? "upload" : "youtube";

  return (
    <div>
      <h1 className="h3 mb-4">Settings</h1>

      <div className="card shadow-sm mb-4" style={{ maxWidth: 640 }}>
        <div className="card-body">
          <h2 className="h5 mb-2">Website Status</h2>
          <p className="text-muted small mb-3">
            When checked, visitors see a maintenance page instead of the site. You can still log in and browse
            everything normally while it's on.
          </p>
          <div className="form-check form-switch">
            <input
              type="checkbox"
              className="form-check-input"
              role="switch"
              id="under-construction"
              checked={underConstruction}
              onChange={(e) =>
                setValues({ ...values, site_status: e.target.checked ? "construction" : "live" })
              }
            />
            <label className="form-check-label" htmlFor="under-construction">
              {underConstruction ? (
                <span className="badge bg-danger">Under Construction</span>
              ) : (
                <span className="badge bg-success">Live</span>
              )}
            </label>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mb-4" style={{ maxWidth: 640 }}>
        <div className="card-body">
          <h2 className="h5 mb-2">Admin Login Video</h2>
          <p className="text-muted small mb-3">
            The video shown on the left side of the admin login screen (/admin/login).
          </p>

          <div className="d-flex gap-3 mb-3">
            <div className="form-check">
              <input
                type="radio"
                className="form-check-input"
                id="video-type-youtube"
                name="login_video_type"
                checked={loginVideoType === "youtube"}
                onChange={() => setValues({ ...values, login_video_type: "youtube" })}
              />
              <label className="form-check-label" htmlFor="video-type-youtube">
                YouTube link
              </label>
            </div>
            <div className="form-check">
              <input
                type="radio"
                className="form-check-input"
                id="video-type-upload"
                name="login_video_type"
                checked={loginVideoType === "upload"}
                onChange={() => setValues({ ...values, login_video_type: "upload" })}
              />
              <label className="form-check-label" htmlFor="video-type-upload">
                Uploaded video
              </label>
            </div>
          </div>

          {loginVideoType === "youtube" ? (
            <div>
              <label className="form-label">YouTube URL</label>
              <input
                className="form-control"
                value={values.login_video_youtube_url ?? ""}
                onChange={(e) => setValues({ ...values, login_video_youtube_url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
          ) : (
            <div>
              <label className="form-label">Upload video</label>
              <input type="file" className="form-control" accept="video/*" onChange={handleVideoUpload} disabled={uploading} />
              {uploading && <span className="small text-muted">Uploading...</span>}
              {values.login_video_upload_url && (
                <video
                  src={values.login_video_upload_url}
                  className="rounded border mt-2"
                  style={{ maxWidth: 260 }}
                  muted
                  controls
                />
              )}
            </div>
          )}
        </div>
      </div>

      <div className="card shadow-sm" style={{ maxWidth: 640 }}>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {fields.map((field) => (
                <div className="col-12 col-md-6" key={field.key}>
                  <label className="form-label">{field.label}</label>
                  <input
                    className="form-control"
                    value={values[field.key] ?? ""}
                    onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
                  />
                </div>
              ))}
            </div>

            <div className="d-flex align-items-center gap-2 mt-4">
              <button type="submit" className="btn bg-primary text-white">
                Save
              </button>
              {saved && <span className="text-success small">Saved.</span>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
