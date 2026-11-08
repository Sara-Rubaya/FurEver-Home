import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
 
const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};
 
export default function MyApplications() {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const fetchApplications = async () => {
      const res = await fetch("/api/applications", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setApplications(data);
      setLoading(false);
    };
    fetchApplications();
  }, [token]);
 
  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-dark">My Applications</h1>
 
      {loading ? (
        <p className="mt-6 text-gray-500">Loading...</p>
      ) : applications.length === 0 ? (
        <p className="mt-6 text-gray-500">
          You haven't applied for any animal yet. <Link to="/animals" className="text-primary hover:underline">Browse animals</Link>
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {applications.map((app) => (
            <div key={app._id} className="flex gap-4 rounded-lg border p-4 shadow-sm">
              <img src={app.animal?.photoUrl} alt={app.animal?.name} className="h-20 w-20 rounded-md object-cover" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-dark">{app.animal?.name}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[app.status]}`}>{app.status}</span>
                </div>
                <p className="mt-1 text-sm text-gray-600">Housing: {app.housingType} · Other pets: {app.hasOtherPets ? "Yes" : "No"}</p>
                {app.message && <p className="mt-1 text-xs text-gray-400">"{app.message}"</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
