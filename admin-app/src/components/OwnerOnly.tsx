import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useCurrentAdmin } from "../lib/AdminContext";

export default function OwnerOnly({ children }: { children: ReactNode }) {
  const admin = useCurrentAdmin();
  if (admin.role !== "OWNER") return <Navigate to="/" replace />;
  return <>{children}</>;
}
