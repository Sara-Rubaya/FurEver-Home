import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Trash2,
  BadgeCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { API_URL } from "../api.js";

const ROLE_COLORS = {
  adopter: "bg-blue-100 text-blue-700",
  shelter: "bg-orange-100 text-orange-700",
  admin: "bg-purple-100 text-purple-700",
};

export default function AdminDashboard() {
  const { token, user: currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchData = async () => {
    setLoading(true);
    const [statsRes, usersRes] = await Promise.all([
      fetch(`${API_URL}/api/admin/stats `, { headers: authHeaders }),
      fetch(`${API_URL}/api/admin/users `, { headers: authHeaders }),
    ]);
    setStats(await statsRes.json());
    setUsers(await usersRes.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerify = async (id) => {
    setActionLoadingId(id);
    await fetch(`${API_URL}/api/admin/users/${id}/verify`, { method: "PATCH", headers: authHeaders });
    await fetchData();
    setActionLoadingId(null);
  };

  const handleRoleChange = async (id, role) => {
    setActionLoadingId(id);
    await fetch(`${API_URL}/api/admin/users/${id}/role`, {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify({ role }),
    });
    await fetchData();
    setActionLoadingId(null);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    setActionLoadingId(id);
    await fetch(`${API_URL}/api/admin/users/${id}` , { method: "DELETE", headers: authHeaders });
    await fetchData();
    setActionLoadingId(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading dashboard...
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-dark">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-gray-600">
        Welcome, {currentUser?.name} — platform overview ar user management.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users className="h-5 w-5 text-blue-600" />}
          label="Total Users"
          value={stats.users.total}
          sub={`${stats.users.adopters} adopters · ${stats.users.shelters} shelters`}
        />
        <StatCard
          icon={<ShieldCheck className="h-5 w-5 text-orange-600" />}
          label="Unverified Shelters"
          value={stats.unverifiedShelters}
          sub="Needs verification"
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
          label="Pending Reports"
          value={stats.reports.pending}
          sub={`${stats.reports.total} total reports`}
        />
        <StatCard
          icon={<BadgeCheck className="h-5 w-5 text-green-600" />}
          label="Rescued"
          value={stats.reports.rescued}
          sub={`${stats.reports.inProgress} in progress`}
        />
      </div>

      <div className="mt-4">
        <Link to="/reports" className="text-sm font-medium text-primary hover:underline">
          View all rescue reports →
        </Link>
      </div>

      <h2 className="mt-10 text-lg font-semibold text-dark">User Management</h2>
      <div className="mt-3 overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t">
                <td className="px-4 py-2 font-medium text-dark">{u.name}</td>
                <td className="px-4 py-2 text-gray-600">{u.email}</td>
                <td className="px-4 py-2">
                  <select
                    value={u.role}
                    disabled={actionLoadingId === u._id || u._id === currentUser.id}
                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    className={`rounded-full border-0 px-2 py-1 text-xs font-medium ${ROLE_COLORS[u.role]}`}
                  >
                    <option value="adopter">adopter</option>
                    <option value="shelter">shelter</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="px-4 py-2">
                  {u.role === "shelter" ? (
                    u.isVerified ? (
                      <span className="text-xs font-medium text-green-600">Verified</span>
                    ) : (
                      <button
                        onClick={() => handleVerify(u._id)}
                        disabled={actionLoadingId === u._id}
                        className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
                      >
                        Verify
                      </button>
                    )
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleDelete(u._id)}
                    disabled={actionLoadingId === u._id || u._id === currentUser.id}
                    className="text-red-500 hover:text-red-700 disabled:opacity-30"
                    aria-label="Delete user"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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