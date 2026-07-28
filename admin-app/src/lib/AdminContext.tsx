import { createContext, useContext } from "react";

export type CurrentAdmin = {
  id: number;
  name: string | null;
  email: string;
  role: "OWNER" | "EDITOR";
};

export const AdminContext = createContext<CurrentAdmin | null>(null);

export function useCurrentAdmin(): CurrentAdmin {
  const admin = useContext(AdminContext);
  if (!admin) {
    throw new Error("useCurrentAdmin() called outside of an authenticated route");
  }
  return admin;
}
