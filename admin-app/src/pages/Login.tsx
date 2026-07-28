import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import "./AuthPages.css";

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <div className="auth-page">
      <div className="auth-card">
        <a href="/" title="Back to website">
          <img className="auth-logo" src="/admin/altec-logo.png" alt="Altec Group" />
        </a>
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
  );
}
