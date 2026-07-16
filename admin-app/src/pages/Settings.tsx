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

  return (
    <div>
      <h1>Settings</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: 480 }}>
        {fields.map((field) => (
          <label key={field.key}>
            {field.label}
            <input
              value={values[field.key] ?? ""}
              onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
            />
          </label>
        ))}
        <div>
          <button type="submit">Save</button>
          {saved && <span style={{ marginLeft: "0.5rem" }}>Saved.</span>}
        </div>
      </form>
    </div>
  );
}
