import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminNav from "./AdminNav";
import { useCurrentAdmin } from "../lib/AdminContext";

export default function AdminLayout() {
  const admin = useCurrentAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const themeClass = admin.role === "OWNER" ? "theme-owner" : "theme-editor";

  return (
    <div className={`d-flex min-vh-100 ${themeClass}`}>
      {sidebarOpen && (
        <div
          className="admin-sidebar-backdrop position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <AdminNav open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      <div className="flex-grow-1 d-flex flex-column min-vw-0">
        <header className="admin-topbar d-flex align-items-center justify-content-between bg-white border-bottom px-3 py-2 sticky-top">
          <a href="/" title="Back to website">
            <img src="/admin/altec-logo.png" alt="Altec Group" style={{ height: 34 }} />
          </a>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            ☰ Menu
          </button>
        </header>
        <main className="flex-grow-1 p-3 p-lg-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
