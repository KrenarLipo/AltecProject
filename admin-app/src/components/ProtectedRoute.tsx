import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { api } from "../lib/api";

export default function ProtectedRoute() {
  const [status, setStatus] = useState<"loading" | "authed" | "anon">("loading");

  useEffect(() => {
    api
      .get("/auth/me")
      .then(() => setStatus("authed"))
      .catch(() => setStatus("anon"));
  }, []);

  if (status === "loading") return <p style={{ padding: "1.5rem" }}>Loading...</p>;
  if (status === "anon") return <Navigate to="/login" replace />;
  return <Outlet />;
}
