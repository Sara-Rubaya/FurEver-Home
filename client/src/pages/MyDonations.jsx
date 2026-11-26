import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { API_URL } from "../api.js";
import { taka } from "../components/SponsorBox.jsx";

export const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  verified: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function MyDonations() {
  const { token } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/donations/mine`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setDonations(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [token]);

  const total = donations.filter((d) => d.status === "verified").reduce((s, d) => s + d.amount, 0);

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark">My Donations</h1>
        <Link to="/donate" className="text-sm font-medium text-primary hover:underline">
          Donate more
        </Link>
      </div>
      <p className="mt-1 text-sm text-gray-600">Total verified: {taka(total)}</p>

      {loading ? (
        <p className="mt-6 text-gray-500">Loading...</p>
      ) : donations.length === 0 ? (
        <p className="mt-6 text-gray-500">You haven't donated yet.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {donations.map((d) => (
            <div key={d._id} className="flex items-center gap-4 rounded-lg border p-4 shadow-sm">
              {d.animal && <img src={d.animal.photoUrl} alt={d.animal.name} className="h-14 w-14 rounded-md object-cover" />}
              <div className="flex-1">
                <p className="font-semibold text-dark">
                  {taka(d.amount)} <span className="text-sm font-normal text-gray-500">via {d.method}</span>
                </p>
                <p className="text-sm text-gray-600">
                  {d.animal ? `Sponsoring ${d.animal.name}` : "General donation"} · {d.shelter?.name}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(d.createdAt).toLocaleDateString()} · TrxID {d.transactionId}
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[d.status]}`}>{d.status}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
