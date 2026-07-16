import { useEffect, useState } from "react";
import { api } from "../lib/api";

type Counts = {
  products: number;
  works: number;
  news: number;
  unreadSubmissions: number;
};

export default function Dashboard() {
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
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
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {!counts && <p>Loading...</p>}
      {counts && (
        <ul>
          <li>Products: {counts.products}</li>
          <li>Works: {counts.works}</li>
          <li>News posts: {counts.news}</li>
          <li>Unread contact submissions: {counts.unreadSubmissions}</li>
        </ul>
      )}
    </div>
  );
}
