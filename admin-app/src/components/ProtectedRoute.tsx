import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { api } from "../lib/api";
import { AdminContext, type CurrentAdmin } from "../lib/AdminContext";

type MeResponse = {
  id: number;
  name: string | null;
  email: string;
  role: "OWNER" | "EDITOR" | "SUBSCRIBER";
};

export default function ProtectedRoute() {
  const [status, setStatus] = useState<"loading" | "authed" | "anon">("loading");
  const [admin, setAdmin] = useState<CurrentAdmin | null>(null);

  useEffect(() => {
    api
      .get<MeResponse>("/auth/me")
      .then((data) => {
        if (data.role === "SUBSCRIBER") {
          // Subscribers have no admin panel access at all — bounce them out to the public login.
          api.post("/auth/logout").finally(() => {
            window.location.href = "/login.php";
          });
          return;
        }
        setAdmin({ ...data, role: data.role });
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
