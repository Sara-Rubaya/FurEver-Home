import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HeartHandshake, Loader2, Trophy, Users } from "lucide-react";
import { API_URL } from "../api.js";
import { ProgressBar, taka } from "../components/SponsorBox.jsx";

// FR12 - Donation / Sponsor a Pet (public page)
export default function Donate() {
  const [pets, setPets] = useState([]);
  const [wall, setWall] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/donations/sponsor-pets`).then((r) => r.json()),
      fetch(`${API_URL}/api/donations/wall`).then((r) => r.json()),
    ])
      .then(([p, w]) => {
        setPets(Array.isArray(p) ? p : []);
        setWall(w);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading...
      </div>
    );
  }

  const stats = wall?.stats || { totalRaised: 0, donations: 0, donors: 0 };

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-dark">Donate &amp; Sponsor a Pet</h1>
          <p className="mt-1 text-sm text-gray-600">
            Your support pays for food, treatment and shelter for animals waiting for a home.
          </p>
        </div>
        <Link
          to="/donate/new"
          className="flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
        >
          <HeartHandshake className="h-4 w-4" /> Donate to a Shelter
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          ["Total Raised", taka(stats.totalRaised)],
          ["Donations", stats.donations],
          ["Supporters", stats.donors],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border bg-orange-50 p-4 text-center">
            <p className="text-2xl font-bold text-primary">{value}</p>
            <p className="text-xs text-gray-600">{label}</p>
          </div>
        ))}
      </div>

      {/* Sponsor pets */}
      <h2 className="mt-10 text-lg font-bold text-dark">Pets who need a sponsor</h2>
      {pets.length === 0 ? (
        <p className="mt-2 text-sm text-gray-500">No sponsorship goals are open right now.</p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pets.map((p) => (
            <div key={p._id} className="overflow-hidden rounded-xl border shadow-sm">
              <img src={p.photoUrl} alt={p.name} className="h-40 w-full object-cover" />
              <div className="p-4">
                <h3 className="font-semibold text-dark">{p.name}</h3>
                <p className="text-xs text-gray-500">
                  {p.species} • {p.shelter?.name}
                </p>
                <div className="mt-3">
                  <ProgressBar raised={p.raised} goal={p.sponsorGoal} percent={p.percent} />
                </div>
                <Link
                  to={`/donate/new?animal=${p._id}`}
                  className="mt-3 block rounded-md bg-primary py-2 text-center text-sm font-semibold text-white hover:bg-orange-600"
                >
                  Sponsor
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Supporter wall */}
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <h2 className="flex items-center gap-2 text-lg font-bold text-dark">
            <Users className="h-5 w-5 text-primary" /> Recent Supporters
          </h2>
          {!wall?.recent?.length ? (
            <p className="mt-2 text-sm text-gray-500">Be the first to support!</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {wall.recent.map((d) => (
                <li key={d._id} className="rounded-lg border p-3 text-sm">
                  <p className="font-medium text-dark">
                    {d.name} <span className="text-primary">{taka(d.amount)}</span>
                    {d.animalName && <span className="text-gray-500"> · for {d.animalName}</span>}
                  </p>
                  {d.message && <p className="mt-1 text-gray-600">“{d.message}”</p>}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-dark">
            <Trophy className="h-5 w-5 text-primary" /> Top Donors
          </h2>
          <ol className="mt-3 flex flex-col gap-2">
            {(wall?.top || []).map((t, i) => (
              <li key={i} className="flex justify-between rounded-lg border p-3 text-sm">
                <span>
                  {i + 1}. {t.name}
                </span>
                <span className="font-semibold text-primary">{taka(t.total)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
