import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { getYouTubeEmbedUrl } from "../lib/youtube";
import "./AuthPages.css";

type LoginPageConfig = {
  videoType: "youtube" | "upload";
  youtubeUrl: string;
  uploadUrl: string;
};

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [videoConfig, setVideoConfig] = useState<LoginPageConfig | null>(null);

  useEffect(() => {
    api.get<LoginPageConfig>("/auth/login-page").then(setVideoConfig).catch(() => {});
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = event.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      await api.post("/auth/login", { email, password });
      navigate("/");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  }

  const embedUrl = videoConfig?.videoType === "youtube" ? getYouTubeEmbedUrl(videoConfig.youtubeUrl) : null;
  const uploadUrl = videoConfig?.videoType === "upload" ? videoConfig.uploadUrl : null;

  return (
    <div className="auth-shell">
      <header className="auth-brand-bar">
        <a href="/" title="Back to website" className="d-flex align-items-center gap-2 text-decoration-none">
          <img src="/admin/altec-logo.png" alt="Altec Group" />
          <span>Altec Group — Admin</span>
        </a>
      </header>

      <div className="auth-split">
        <div className="auth-video-panel">
          {embedUrl && <iframe src={embedUrl} title="Altec" allow="autoplay; encrypted-media" />}
          {uploadUrl && <video src={uploadUrl} autoPlay muted loop playsInline />}
          <div className="auth-video-overlay" />
          <div className="auth-video-caption">
            <span className="eyebrow">Altec Group</span>
            <h2>Manage Your Website</h2>
            <p>Products, projects, news, and more — all from one dashboard.</p>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-card">
            <h1 className="auth-title">Admin Login</h1>
            <p className="auth-subtitle">Sign in to manage the Altec website</p>
            <form onSubmit={handleSubmit} className="auth-form">
              <label className="auth-field">
                Email
                <input name="email" type="email" autoComplete="username" required />
              </label>
              <label className="auth-field">
                Password
                <input name="password" type="password" autoComplete="current-password" required />
              </label>
              {error && <p className="auth-error">{error}</p>}
              <button type="submit" className="auth-submit" disabled={submitting}>
                {submitting ? "Signing in..." : "Sign in"}
              </button>
            </form>
            <div className="auth-links centered">
              <Link to="/forgot-password">Forgot your password?</Link>
            </div>
          </div>
        </div>
      </div>

      <footer className="auth-brand-footer">Part of Altec Group — {new Date().getFullYear()}</footer>
    </div>
  );
}
