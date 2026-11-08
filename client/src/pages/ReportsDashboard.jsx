import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { API_URL } from "../api.js";

const STATUS_COLORS = {
  pending: "bg-red-100 text-red-700",
  "in-progress": "bg-yellow-100 text-yellow-700",
  rescued: "bg-green-100 text-green-700",
};

export default function ReportsDashboard() {
  const { token } = useAuth();
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    const query = filter !== "all" ? `?status=${filter}` : "";
    const res = await fetch(`${API_URL}/api/reports${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setReports(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleStatusChange = async (id, status) => {
    await fetch(`${API_URL}/api/reports/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    fetchReports();
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-dark">Rescue Reports</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {["all", "pending", "in-progress", "rescued"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1 text-sm font-medium capitalize ${
              filter === s ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-6 text-gray-500">Loading...</p>
      ) : reports.length === 0 ? (
        <p className="mt-6 text-gray-500">No reports found.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((r) => (
            <div key={r._id} className="overflow-hidden rounded-lg border shadow-sm">
              <img src={r.photoUrl} alt={r.animalType} className="h-40 w-full object-cover" />
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-dark">{r.animalType}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[r.status]}`}>
                    {r.status}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-gray-600">{r.description}</p>
                <p className="mt-1 text-xs text-gray-400">{r.location?.address}</p>
                <p className="mt-1 text-xs text-gray-400">Reported by: {r.reportedBy?.name}</p>

                <select
                  value={r.status}
                  onChange={(e) => handleStatusChange(r._id, e.target.value)}
                  className="mt-3 w-full rounded-md border px-2 py-1 text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="rescued">Rescued</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}