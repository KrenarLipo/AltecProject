import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useCurrentAdmin } from "../lib/AdminContext";

const links = [
  { href: "/", label: "Dashboard", ownerOnly: false },
  { href: "/products", label: "Products", ownerOnly: true },
  { href: "/categories", label: "Categories", ownerOnly: true },
  { href: "/menu-items", label: "Menu", ownerOnly: true },
  { href: "/slides", label: "Slideshow", ownerOnly: true },
  { href: "/works", label: "Works", ownerOnly: false },
  { href: "/news", label: "News", ownerOnly: false },
  { href: "/pages", label: "Pages", ownerOnly: true },
  { href: "/settings", label: "Settings", ownerOnly: true },
  { href: "/contact-submissions", label: "Contact Submissions", ownerOnly: true },
  { href: "/users", label: "Users", ownerOnly: true },
];

export default function AdminNav() {
  const navigate = useNavigate();
  const admin = useCurrentAdmin();

  async function handleLogout() {
    await api.post("/auth/logout");
    navigate("/login");
  }

  return (
    <nav
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.4rem",
        borderRight: "1px solid #ddd",
        borderTop: "3px solid var(--color-red)",
        padding: "1rem",
        minWidth: 210,
      }}
    >
      <img src="/admin/altec-logo.png" alt="Altec Group" style={{ width: 130, marginBottom: "1rem" }} />
      {links
        .filter((link) => !link.ownerOnly || admin.role === "OWNER")
        .map((link) => (
          <Link key={link.href} to={link.href} style={{ padding: "0.35rem 0", fontWeight: 500 }}>
            {link.label}
          </Link>
        ))}
      <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#888" }}>
        {admin.name ?? admin.email} · {admin.role === "OWNER" ? "Administrator" : "Editor"}
      </p>
      <button onClick={handleLogout}>Log out</button>
    </nav>
  );
}
