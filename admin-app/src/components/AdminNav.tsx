import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/menu-items", label: "Menu" },
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
        gap: "0.5rem",
        borderRight: "1px solid #ddd",
        padding: "1rem",
        minWidth: 200,
      }}
    >
      {links.map((link) => (
        <Link key={link.href} to={link.href}>
          {link.label}
        </Link>
      ))}
      <button onClick={handleLogout} style={{ marginTop: "1rem" }}>
        Log out
      </button>
    </nav>
  );
}
