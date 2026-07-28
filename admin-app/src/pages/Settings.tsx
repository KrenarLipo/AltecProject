import { useEffect, useState, type FormEvent } from "react";
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

  useEffect(() => {
    api.get<Record<string, string>>("/settings").then(setValues);
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await api.put("/settings", values);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const underConstruction = values.site_status === "construction";

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
