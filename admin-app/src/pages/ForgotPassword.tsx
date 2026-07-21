import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import "./AuthPages.css";

export default function ForgotPassword() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const email = (event.currentTarget.elements.namedItem("email") as HTMLInputElement).value;

    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img className="auth-logo" src="/admin/altec-logo.png" alt="Altec Group" />
        <h1 className="auth-title">Forgot Password</h1>
        <p className="auth-subtitle">We'll email you a link to reset it</p>

        {sent ? (
          <p className="auth-success">
            If an account exists for that email, a reset link is on its way. Check your inbox.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <label className="auth-field">
              Email
              <input name="email" type="email" autoComplete="username" required />
            </label>
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" className="auth-submit" disabled={submitting}>
              {submitting ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <div className="auth-links centered">
          <Link to="/login">Back to login</Link>
        </div>
      </div>
    </div>
  );
}
