import { NavLink, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useCurrentAdmin } from "../lib/AdminContext";

const links = [
  { href: "/", label: "Dashboard", ownerOnly: false, end: true },
  { href: "/products", label: "Products", ownerOnly: false, end: false },
  { href: "/categories", label: "Categories", ownerOnly: false, end: false },
  { href: "/menu-items", label: "Menu", ownerOnly: true, end: false },
  { href: "/slides", label: "Slideshow", ownerOnly: true, end: false },
  { href: "/works", label: "Works", ownerOnly: false, end: false },
  { href: "/news", label: "News", ownerOnly: false, end: false },
  { href: "/pages", label: "Pages", ownerOnly: true, end: false },
  { href: "/settings", label: "Settings", ownerOnly: true, end: false },
  { href: "/contact-submissions", label: "Contact Submissions", ownerOnly: true, end: false },
  { href: "/users", label: "Users", ownerOnly: true, end: false },
];

export default function AdminNav({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  const navigate = useNavigate();
  const admin = useCurrentAdmin();

  async function handleLogout() {
    await api.post("/auth/logout");
    navigate("/login");
  }

  return (
    <nav className={`admin-sidebar d-flex flex-column bg-white border-end p-3 ${open ? "open" : ""}`}>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <a href="/" title="Back to website">
          <img src="/admin/altec-logo.png" alt="Altec Group" style={{ width: 130 }} />
        </a>
        <button
          type="button"
          className="btn-close d-lg-none"
          aria-label="Close menu"
          onClick={onNavigate}
        />
      </div>

      <div className="d-flex flex-column gap-1 flex-grow-1">
        {links
          .filter((link) => !link.ownerOnly || admin.role === "OWNER")
          .map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              end={link.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `nav-link px-3 py-2 rounded ${isActive ? "bg-primary text-white" : "text-dark"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
      </div>

      <div className="mt-3 pt-3 border-top">
        <p className="small text-muted mb-2">
          {admin.name ?? admin.email}
          <br />
          <span className="badge bg-primary mt-1">{admin.role === "OWNER" ? "Administrator" : "Editor"}</span>
        </p>
        <button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </nav>
  );
}
