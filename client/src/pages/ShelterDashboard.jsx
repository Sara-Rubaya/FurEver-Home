import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PawPrint, Clock, HeartHandshake, FileText, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function ShelterDashboard() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch("/api/shelter/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStats(data);
      setLoading(false);
    };
    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading dashboard...
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-dark">Welcome, {user?.name}</h1>
      <p className="mt-1 text-sm text-gray-600">Tomar animal listing ar adoption application-er overview.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<PawPrint className="h-5 w-5 text-blue-600" />} label="Total Listings" value={stats.animals.total} sub={`${stats.animals.available} available`} />
        <StatCard icon={<Clock className="h-5 w-5 text-yellow-600" />} label="Pending Review" value={stats.animals.pending} sub="Application-e ache" />
        <StatCard icon={<HeartHandshake className="h-5 w-5 text-green-600" />} label="Adopted" value={stats.animals.adopted} sub="Successfully placed" />
        <StatCard icon={<FileText className="h-5 w-5 text-orange-600" />} label="New Applications" value={stats.applications.pending} sub={`${stats.applications.total} total applications`} />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link to="/my-animals" className="rounded-lg border p-5 shadow-sm transition hover:shadow-md">
          <h3 className="font-semibold text-dark">My Animal Listings</h3>
          <p className="mt-1 text-sm text-gray-500">Notun animal add koro, ba existing listing dekho/delete koro.</p>
        </Link>
        <Link to="/shelter-applications" className="rounded-lg border p-5 shadow-sm transition hover:shadow-md">
          <h3 className="font-semibold text-dark">Adoption Applications</h3>
          <p className="mt-1 text-sm text-gray-500">Asha application review kore approve/reject koro.</p>
        </Link>
        <Link to="/reports" className="rounded-lg border p-5 shadow-sm transition hover:shadow-md">
          <h3 className="font-semibold text-dark">Rescue Reports</h3>
          <p className="mt-1 text-sm text-gray-500">Stray/injured animal report gulo dekho ar status update koro.</p>
        </Link>
      </div>
    </section>
  );
}

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-gray-500">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-dark">{value}</p>
      <p className="mt-0.5 text-xs text-gray-400">{sub}</p>
    </div>
  );
}