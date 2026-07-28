import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useCurrentAdmin } from "../lib/AdminContext";

type Counts = {
  products?: number;
  works: number;
  news: number;
  unreadSubmissions?: number;
};

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="col-6 col-md-3">
      <div className="card h-100 shadow-sm">
        <div className="card-body">
          <p className="text-muted text-uppercase small mb-1">{label}</p>
          <p className="display-6 mb-0">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const admin = useCurrentAdmin();
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    if (admin.role === "OWNER") {
      Promise.all([
        api.get<unknown[]>("/products"),
        api.get<unknown[]>("/works"),
        api.get<unknown[]>("/news"),
        api.get<{ read: boolean }[]>("/contact"),
      ]).then(([products, works, news, submissions]) => {
        setCounts({
          products: products.length,
          works: works.length,
          news: news.length,
          unreadSubmissions: submissions.filter((s) => !s.read).length,
        });
      });
    } else {
      Promise.all([api.get<unknown[]>("/products"), api.get<unknown[]>("/works"), api.get<unknown[]>("/news")]).then(
        ([products, works, news]) => {
          setCounts({ products: products.length, works: works.length, news: news.length });
        },
      );
    }
  }, [admin.role]);

  return (
    <div>
      <h1 className="h3 mb-4">Dashboard</h1>

      {!counts && <p className="text-muted">Loading...</p>}

      {counts && (
        <div className="row g-3 mb-4">
          {counts.products !== undefined && <StatCard label="Products" value={counts.products} />}
          <StatCard label="Works" value={counts.works} />
          <StatCard label="News posts" value={counts.news} />
          {counts.unreadSubmissions !== undefined && (
            <StatCard label="Unread submissions" value={counts.unreadSubmissions} />
          )}
        </div>
      )}

      {admin.role === "OWNER" && (
        <div className="card shadow-sm" style={{ maxWidth: 420 }}>
          <div className="card-body d-flex align-items-center justify-content-between">
            <div>
              <h2 className="h6 mb-1">Homepage Slideshow</h2>
              <p className="text-muted small mb-0">Add, reorder, or remove slides shown on the homepage hero.</p>
            </div>
            <Link to="/slides" className="btn bg-primary text-white text-nowrap ms-3">
              Manage
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
