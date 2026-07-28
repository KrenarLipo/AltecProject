import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import "./AuthPages.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirm = (form.elements.namedItem("confirm") as HTMLInputElement).value;

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <header className="auth-brand-bar">
        <a href="/" title="Back to website" className="d-flex align-items-center gap-2 text-decoration-none">
          <img src="/admin/altec-logo.png" alt="Altec Group" />
          <span>Altec Group — Admin</span>
        </a>
      </header>

      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">Choose a new password for your account</p>

          {!token ? (
            <p className="auth-error">This reset link is missing its token. Please request a new one.</p>
          ) : done ? (
            <p className="auth-success">Your password has been reset. You can now sign in.</p>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <label className="auth-field">
                New password
                <input name="password" type="password" autoComplete="new-password" required minLength={8} />
              </label>
              <label className="auth-field">
                Confirm password
                <input name="confirm" type="password" autoComplete="new-password" required minLength={8} />
              </label>
              {error && <p className="auth-error">{error}</p>}
              <button type="submit" className="auth-submit" disabled={submitting}>
                {submitting ? "Saving..." : "Set new password"}
              </button>
            </form>
          )}

          <div className="auth-links centered">
            <Link to="/login">Back to login</Link>
          </div>
        </div>
      </div>

      <footer className="auth-brand-footer">Part of Altec Group — {new Date().getFullYear()}</footer>
    </div>
  );
}
