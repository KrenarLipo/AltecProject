import { useEffect, useState, type FormEvent } from "react";
import { api, ApiError } from "../lib/api";
import { useCurrentAdmin } from "../lib/AdminContext";

type Role = "OWNER" | "EDITOR" | "SUBSCRIBER";

type AdminUserRow = {
  id: number;
  name: string | null;
  email: string;
  role: Role;
  createdAt: string;
};

const roleLabels: Record<Role, string> = {
  OWNER: "Administrator",
  EDITOR: "Editor",
  SUBSCRIBER: "Subscriber",
};

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "EDITOR" as Role,
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

  async function handleRoleChange(id: number, role: Role) {
    try {
      await api.put(`/admin-users/${id}`, { role });
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Something went wrong.");
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
      <h1 className="h3 mb-4">Users</h1>

      <div className="card shadow-sm mb-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name ?? "—"}</td>
                  <td>{user.email}</td>
                  <td>
                    {user.id === currentAdmin.id ? (
                      <span className="badge bg-primary">{roleLabels[user.role]}</span>
                    ) : (
                      <select
                        className="form-select form-select-sm d-inline-block"
                        style={{ width: "auto" }}
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                      >
                        <option value="OWNER">Administrator</option>
                        <option value="EDITOR">Editor</option>
                        <option value="SUBSCRIBER">Subscriber</option>
                      </select>
                    )}
                  </td>
                  <td className="text-end">
                    {user.id !== currentAdmin.id && (
                      <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(user.id)}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-muted text-center py-4">
                    No users yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card shadow-sm" style={{ maxWidth: 480 }}>
        <div className="card-body">
          <h2 className="h5 mb-3">Add User</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                minLength={8}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Role</label>
              <select className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
                <option value="OWNER">Administrator (full access)</option>
                <option value="EDITOR">Editor (Products, Categories, News &amp; Works)</option>
                <option value="SUBSCRIBER">Subscriber (no admin access)</option>
              </select>
            </div>
            {error && <p className="text-danger small">{error}</p>}
            <button type="submit" className="btn bg-primary text-white" disabled={submitting}>
              {submitting ? "Adding..." : "Add User"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
