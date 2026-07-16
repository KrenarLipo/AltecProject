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
      <h1>Contact Submissions</h1>
      {submissions.length === 0 && <p>No submissions yet.</p>}
      <table>
        <thead>
          <tr>
            <th align="left">Date</th>
            <th align="left">Name</th>
            <th align="left">Email</th>
            <th align="left">Phone</th>
            <th align="left">Message</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission) => (
            <tr key={submission.id}>
              <td>{new Date(submission.createdAt).toLocaleString()}</td>
              <td>{submission.name}</td>
              <td>{submission.email}</td>
              <td>{submission.phone ?? "—"}</td>
              <td>{submission.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
