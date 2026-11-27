import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Search, Plus, Loader2, CalendarDays, PawPrint } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { API_URL } from "../api.js";

const TYPE_STYLE = {
  lost: "bg-red-100 text-red-700",
  found: "bg-green-100 text-green-700",
};

// FR11 - Lost & Found Pets board
export default function LostFound() {
  const { token, isAuthenticated } = useAuth();
  const [tab, setTab] = useState("all"); // all | lost | found | mine
  const [species, setSpecies] = useState("");
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (tab === "mine" && !token) return;
      setLoading(true);
      try {
        let res;
        if (tab === "mine") {
          res = await fetch(`${API_URL}/api/lost-found/mine`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          const params = new URLSearchParams();
          if (tab !== "all") params.set("type", tab);
          if (species) params.set("species", species);
          if (search) params.set("search", search);
          res = await fetch(`${API_URL}/api/lost-found?${params}`);
        }
        const data = await res.json();
        setPosts(res.ok && Array.isArray(data) ? data : []);
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tab, species, search, token]);

  const tabs = [
    ["all", "All"],
    ["lost", "Lost"],
    ["found", "Found"],
    ...(isAuthenticated ? [["mine", "My Posts"]] : []),
  ];

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-dark">Lost &amp; Found Pets</h1>
          <p className="mt-1 text-sm text-gray-600">
            Lost your pet or found a stray? Post here and help them get back home.
          </p>
        </div>
        <Link
          to="/lost-found/new"
          className="flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" /> Post a Pet
        </Link>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex overflow-hidden rounded-md border text-sm">
          {tabs.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 ${tab === key ? "bg-primary font-semibold text-white" : "text-gray-700 hover:bg-gray-50"}`}
            >
              {label}
            </button>
          ))}
        </div>

        <select
          value={species}
          onChange={(e) => setSpecies(e.target.value)}
          disabled={tab === "mine"}
          className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
        >
          <option value="">All species</option>
          {["Dog", "Cat", "Bird", "Rabbit", "Other"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(q.trim());
          }}
          className="flex flex-1 gap-2"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search color, breed, area..."
            className="w-full min-w-[180px] rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button className="rounded-md border px-3 text-gray-700 hover:border-primary hover:text-primary">
            <Search className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Results */}
      {loading ? (
        <div className="mt-10 flex items-center text-gray-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading...
        </div>
      ) : posts.length === 0 ? (
        <p className="mt-10 text-gray-500">No posts found.</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link
              key={p._id}
              to={`/lost-found/${p._id}`}
              className="overflow-hidden rounded-xl border shadow-sm transition hover:shadow-md"
            >
              <div className="relative">
                <img src={p.photoUrl} alt={p.species} className="h-44 w-full object-cover" />
                <span
                  className={`absolute left-2 top-2 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${TYPE_STYLE[p.type]}`}
                >
                  {p.type}
                </span>
                {p.status === "reunited" && (
                  <span className="absolute right-2 top-2 rounded-full bg-green-600 px-2.5 py-0.5 text-xs font-bold text-white">
                    Reunited
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="flex items-center gap-1 font-semibold text-dark">
                  <PawPrint className="h-4 w-4 text-primary" />
                  {p.petName || `${p.color || ""} ${p.species}`.trim()}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {[p.species, p.breed, p.color].filter(Boolean).join(" • ")}
                </p>
                <p className="mt-2 flex items-start gap-1 text-xs text-gray-500">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {p.location?.address}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {new Date(p.eventDate).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
