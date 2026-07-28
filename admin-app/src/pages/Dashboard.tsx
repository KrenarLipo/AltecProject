import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useCurrentAdmin } from "../lib/AdminContext";

type Counts = {
  products?: number;
  works: number;
  news: number;
  unreadSubmissions?: number;
};

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
      Promise.all([api.get<unknown[]>("/works"), api.get<unknown[]>("/news")]).then(([works, news]) => {
        setCounts({ works: works.length, news: news.length });
      });
    }
  }, [admin.role]);

  return (
    <div>
      <h1>Dashboard</h1>
      {!counts && <p>Loading...</p>}
      {counts && (
        <ul>
          {counts.products !== undefined && <li>Products: {counts.products}</li>}
          <li>Works: {counts.works}</li>
          <li>News posts: {counts.news}</li>
          {counts.unreadSubmissions !== undefined && (
            <li>Unread contact submissions: {counts.unreadSubmissions}</li>
          )}
        </ul>
      )}
    </div>
  );
}
