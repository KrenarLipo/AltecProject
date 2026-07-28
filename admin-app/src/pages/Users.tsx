import { useEffect, useState, type FormEvent } from "react";
import { api, ApiError } from "../lib/api";
import { useCurrentAdmin } from "../lib/AdminContext";

type AdminUserRow = {
  id: number;
  name: string | null;
  email: string;
  role: "OWNER" | "EDITOR";
  createdAt: string;
};

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "EDITOR" as "OWNER" | "EDITOR",
};

export default function Users() {
  const currentAdmin = useCurrentAdmin();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setUsers(await api.get<AdminUserRow[]>("/admin-users"));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/admin-users", form);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this user? This can't be undone.")) return;
    try {
      await api.del(`/admin-users/${id}`);
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Something went wrong.");
    }
  }

  return (
    <div>
      <h1>Users</h1>

      <table style={{ marginBottom: "1.5rem" }}>
        <thead>
          <tr>
            <th align="left">Name</th>
            <th align="left">Email</th>
            <th align="left">Role</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name ?? "—"}</td>
              <td>{user.email}</td>
              <td>{user.role === "OWNER" ? "Administrator" : "Editor"}</td>
              <td>
                {user.id !== currentAdmin.id && (
                  <button onClick={() => handleDelete(user.id)}>Delete</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Add User</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: 400 }}>
        <label>
          Name
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            minLength={8}
            required
          />
        </label>
        <label>
          Role
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "OWNER" | "EDITOR" })}>
            <option value="OWNER">Administrator (full access)</option>
            <option value="EDITOR">Editor (News &amp; Works only)</option>
          </select>
        </label>
        {error && <p style={{ color: "crimson" }}>{error}</p>}
        <div>
          <button type="submit" disabled={submitting}>
            {submitting ? "Adding..." : "Add User"}
          </button>
        </div>
      </form>
    </div>
  );
}
