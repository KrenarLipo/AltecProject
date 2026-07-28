import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { api } from "../lib/api";
import { AdminContext, type CurrentAdmin } from "../lib/AdminContext";

export default function ProtectedRoute() {
  const [status, setStatus] = useState<"loading" | "authed" | "anon">("loading");
  const [admin, setAdmin] = useState<CurrentAdmin | null>(null);

  useEffect(() => {
    api
      .get<CurrentAdmin>("/auth/me")
      .then((data) => {
        setAdmin(data);
        setStatus("authed");
      })
      .catch(() => setStatus("anon"));
  }, []);

  if (status === "loading") return <p style={{ padding: "1.5rem" }}>Loading...</p>;
  if (status === "anon" || !admin) return <Navigate to="/login" replace />;

  return (
    <AdminContext.Provider value={admin}>
      <Outlet />
    </AdminContext.Provider>
  );
}
