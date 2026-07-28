import { useEffect, useState } from "react";
import { api } from "../lib/api";

type ContactSubmission = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  createdAt: string;
  read: boolean;
};

export default function ContactSubmissions() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);

  useEffect(() => {
    api.get<ContactSubmission[]>("/contact").then(setSubmissions);
  }, []);

  return (
    <div>
      <h1 className="h3 mb-4">Contact Submissions</h1>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission.id}>
                  <td className="text-nowrap">{new Date(submission.createdAt).toLocaleString()}</td>
                  <td>{submission.name}</td>
                  <td>{submission.email}</td>
                  <td>{submission.phone ?? "—"}</td>
                  <td>{submission.message}</td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-muted text-center py-4">
                    No submissions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
