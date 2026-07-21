import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/menu-items", label: "Menu" },
  { href: "/slides", label: "Slideshow" },
  { href: "/works", label: "Works" },
  { href: "/news", label: "News" },
  { href: "/pages", label: "Pages" },
  { href: "/settings", label: "Settings" },
  { href: "/contact-submissions", label: "Contact Submissions" },
];

export default function AdminNav() {
  const navigate = useNavigate();

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
      {links.map((link) => (
        <Link
          key={link.href}
          to={link.href}
          style={{ padding: "0.35rem 0", fontWeight: 500 }}
        >
          {link.label}
        </Link>
      ))}
      <button onClick={handleLogout} style={{ marginTop: "1rem" }}>
        Log out
      </button>
    </nav>
  );
}
