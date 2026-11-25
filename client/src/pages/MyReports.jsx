import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { API_URL } from "../api.js";

const STATUS_COLORS = {
  pending: "bg-red-100 text-red-700",
  "in-progress": "bg-yellow-100 text-yellow-700",
  rescued: "bg-green-100 text-green-700",
};

export default function MyReports() {
  const { token, user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyReports = async () => {
      const res = await fetch(`${API_URL}/api/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      // Shudhu nijer report gulo filter kora (backend e alada endpoint na thakle frontend e filter)
      setReports(data.filter((r) => r.reportedBy?._id === user.id || r.reportedBy?._id === user._id));
      setLoading(false);
    };
    fetchMyReports();
  }, [token, user]);

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-dark">My Reports</h1>

      {loading ? (
        <p className="mt-6 text-gray-500">Loading...</p>
      ) : reports.length === 0 ? (
        <p className="mt-6 text-gray-500">You haven't submitted any reports yet.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {reports.map((r) => (
            <div key={r._id} className="flex gap-4 rounded-lg border p-4 shadow-sm">
              <img src={r.photoUrl} alt={r.animalType} className="h-20 w-20 rounded-md object-cover" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-dark">{r.animalType}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[r.status]}`}>
                    {r.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{r.description}</p>
                <p className="mt-1 text-xs text-gray-400">{r.location?.address}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}