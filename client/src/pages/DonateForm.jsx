import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { API_URL } from "../api.js";
import { taka } from "../components/SponsorBox.jsx";

const inputCls = "w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary";
const labelCls = "mb-1 block text-sm font-medium text-gray-700";
const QUICK = [100, 500, 1000, 2000];

export default function DonateForm() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const animalId = useSearchParams()[0].get("animal"); // ?animal=ID thakle sponsorship

  const [info, setInfo] = useState(null); // animal sponsor info
  const [shelters, setShelters] = useState([]);
  const [form, setForm] = useState({
    shelterId: "",
    amount: 500,
    method: "bKash",
    transactionId: "",
    message: "",
    isAnonymous: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (animalId) {
      fetch(`${API_URL}/api/donations/animal/${animalId}`)
        .then((r) => r.json())
        .then(setInfo);
    } else {
      fetch(`${API_URL}/api/donations/shelters`)
        .then((r) => r.json())
        .then((list) => {
          setShelters(list);
          setForm((f) => ({ ...f, shelterId: list[0]?._id || "" }));
        });
    }
  }, [animalId]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const shelter = animalId ? info?.shelter : shelters.find((s) => s._id === form.shelterId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/donations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, animalId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit donation");
      navigate("/my-donations");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-2xl font-bold text-dark">{animalId ? `Sponsor ${info?.name || ""}` : "Donate to a Shelter"}</h1>
      <p className="mt-1 text-sm text-gray-600">
        Send the money first, then enter your transaction ID. The shelter will verify it.
      </p>

      {error && <p className="mt-4 rounded-md bg-red-100 px-4 py-2 text-sm text-red-700">{error}</p>}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        {!animalId && (
          <div>
            <label className={labelCls}>Shelter</label>
            <select value={form.shelterId} onChange={set("shelterId")} required className={inputCls}>
              {shelters.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className={labelCls}>Amount (৳)</label>
          <div className="mb-2 flex flex-wrap gap-2">
            {QUICK.map((a) => (
              <button
                type="button"
                key={a}
                onClick={() => setForm({ ...form, amount: a })}
                className={`rounded-full border px-3 py-1 text-sm ${
                  Number(form.amount) === a ? "border-primary bg-orange-50 font-semibold text-primary" : "text-gray-700"
                }`}
              >
                {taka(a)}
              </button>
            ))}
          </div>
          <input type="number" min="10" value={form.amount} onChange={set("amount")} required className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Payment Method</label>
          <select value={form.method} onChange={set("method")} className={inputCls}>
            {["bKash", "Nagad", "Card", "Bank"].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Send to {shelter?.name || "the shelter"}:{" "}
            <span className="font-semibold">{shelter?.phone || "contact the shelter for payment details"}</span>
          </p>
        </div>

        <div>
          <label className={labelCls}>Transaction ID</label>
          <input value={form.transactionId} onChange={set("transactionId")} required className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Message (optional)</label>
          <textarea value={form.message} onChange={set("message")} maxLength={200} rows={2} className={inputCls} />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.isAnonymous}
            onChange={(e) => setForm({ ...form, isAnonymous: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          Donate anonymously
        </label>

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-primary py-2 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
        >
          {loading ? "Submitting..." : `Donate ${taka(form.amount || 0)}`}
        </button>
        <Link to="/donate" className="text-center text-sm text-gray-500 hover:text-primary">
          Cancel
        </Link>
      </form>
    </section>
  );
}
