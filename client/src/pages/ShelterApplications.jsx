import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
 
const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};
 
export default function ShelterApplications() {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
 
  const fetchApplications = async () => {
    setLoading(true);
    const res = await fetch("/api/applications", { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setApplications(data);
    setLoading(false);
  };
 
  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
 
  const handleDecision = async (id, status) => {
    setActionLoadingId(id);
    await fetch(`/api/applications/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    await fetchApplications();
    setActionLoadingId(null);
  };
 
  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-dark">Adoption Applications</h1>
 
      {loading ? (
        <p className="mt-6 text-gray-500">Loading...</p>
      ) : applications.length === 0 ? (
        <p className="mt-6 text-gray-500">No applications received yet.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {applications.map((app) => (
            <div key={app._id} className="flex gap-4 rounded-lg border p-4 shadow-sm">
              <img src={app.animal?.photoUrl} alt={app.animal?.name} className="h-20 w-20 rounded-md object-cover" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-dark">
                    {app.animal?.name} <span className="text-gray-400">·</span>{" "}
                    <span className="text-sm font-normal text-gray-600">{app.adopter?.name}</span>
                  </h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[app.status]}`}>{app.status}</span>
                </div>
                <p className="mt-1 text-sm text-gray-600">Housing: {app.housingType} · Other pets: {app.hasOtherPets ? "Yes" : "No"}</p>
                <p className="mt-1 text-sm text-gray-600">Experience: {app.experience}</p>
                {app.message && <p className="mt-1 text-xs text-gray-400">"{app.message}"</p>}
 
                {app.status === "pending" && (
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => handleDecision(app._id, "approved")} disabled={actionLoadingId === app._id} className="rounded-md bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50">
                      Approve
                    </button>
                    <button onClick={() => handleDecision(app._id, "rejected")} disabled={actionLoadingId === app._id} className="rounded-md bg-red-500 px-3 py-1 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50">
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
