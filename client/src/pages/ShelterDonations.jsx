import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { API_URL } from "../api.js";
import { taka } from "../components/SponsorBox.jsx";
import { STATUS_COLORS } from "./MyDonations.jsx";

// FR12 - shelter/admin: donation verify kora + animal er sponsor goal set kora
export default function ShelterDonations() {
  const { token } = useAuth();
  const [donations, setDonations] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [tab, setTab] = useState("pending");
  const [goals, setGoals] = useState({});

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
  const api = (path, opts) => fetch(`${API_URL}/api/donations/${path}`, { headers, ...opts }).then((r) => r.json());

  const load = () => {
    api("received").then((d) => setDonations(Array.isArray(d) ? d : []));
    api("my-animals").then((a) => setAnimals(Array.isArray(a) ? a : []));
  };
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const review = async (id, status) => {
    await api(`${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
    load();
  };

  const saveGoal = async (id) => {
    await api(`goal/${id}`, { method: "PATCH", body: JSON.stringify({ sponsorGoal: goals[id] }) });
    load();
  };

  const shown = donations.filter((d) => d.status === tab);
  const verifiedTotal = donations.filter((d) => d.status === "verified").reduce((s, d) => s + d.amount, 0);

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-dark">Donations</h1>
      <p className="mt-1 text-sm text-gray-600">Verified total: {taka(verifiedTotal)}</p>

      {/* Verify */}
      <div className="mt-5 flex overflow-hidden rounded-md border text-sm sm:w-fit">
        {["pending", "verified", "rejected"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 capitalize ${tab === t ? "bg-primary font-semibold text-white" : "text-gray-700 hover:bg-gray-50"}`}
          >
            {t} ({donations.filter((d) => d.status === t).length})
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="mt-6 text-gray-500">Nothing here.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {shown.map((d) => (
            <div key={d._id} className="flex flex-wrap items-center gap-3 rounded-lg border p-4 shadow-sm">
              <div className="min-w-[200px] flex-1">
                <p className="font-semibold text-dark">
                  {taka(d.amount)} <span className="text-sm font-normal text-gray-500">via {d.method}</span>
                </p>
                <p className="text-sm text-gray-600">
                  {d.donor?.name} ({d.donor?.email}) · {d.animal ? `for ${d.animal.name}` : "general"}
                </p>
                <p className="text-xs text-gray-400">
                  TrxID <span className="font-mono">{d.transactionId}</span> · {new Date(d.createdAt).toLocaleDateString()}
                </p>
              </div>
              {d.status === "pending" ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => review(d._id, "verified")}
                    className="flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Verify
                  </button>
                  <button
                    onClick={() => review(d._id, "rejected")}
                    className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                </div>
              ) : (
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[d.status]}`}>{d.status}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Sponsor goals */}
      <h2 className="mt-10 text-lg font-bold text-dark">Sponsorship Goals</h2>
      <p className="text-sm text-gray-600">Set a goal (৳) to open sponsorship for an animal. 0 = off.</p>
      <div className="mt-3 flex flex-col gap-2">
        {animals.map((a) => (
          <div key={a._id} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
            <img src={a.photoUrl} alt={a.name} className="h-12 w-12 rounded-md object-cover" />
            <div className="min-w-[120px] flex-1">
              <p className="font-medium text-dark">{a.name}</p>
              <p className="text-xs text-gray-500">
                {a.sponsorGoal > 0 ? `${taka(a.raised)} / ${taka(a.sponsorGoal)}` : "Not open for sponsorship"}
              </p>
            </div>
            <input
              type="number"
              min="0"
              placeholder={a.sponsorGoal}
              value={goals[a._id] ?? ""}
              onChange={(e) => setGoals({ ...goals, [a._id]: e.target.value })}
              className="w-28 rounded-md border px-3 py-1.5 text-sm"
            />
            <button
              onClick={() => saveGoal(a._id)}
              disabled={goals[a._id] === undefined || goals[a._id] === ""}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
