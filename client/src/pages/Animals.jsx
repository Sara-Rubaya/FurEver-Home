import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";
 
const STATUS_BADGE = {
  available: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  adopted: "bg-gray-200 text-gray-500",
};
 
const defaultFilters = {
  species: "", gender: "", size: "", search: "", minAge: "", maxAge: "", sort: "newest",
};
 
export default function Animals() {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(defaultFilters);
 
  const fetchAnimals = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("status", "available");
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const res = await fetch(`/api/animals?${params.toString()}`);
    const data = await res.json();
    setAnimals(data);
    setLoading(false);
  };
 
  useEffect(() => {
    // Search box e typing korar somoy khub beshi request na jay, tai ektu debounce
    const timeout = setTimeout(fetchAnimals, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);
 
  const handleFilterChange = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));
  const clearFilters = () => setFilters(defaultFilters);
  const hasActiveFilters = filters.species || filters.gender || filters.size || filters.search || filters.minAge || filters.maxAge;
 
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-dark">Browse Animals</h1>
      <p className="mt-1 text-sm text-gray-600">Adoption-er jonno available shob animal ekhane dekho.</p>
 
      <div className="relative mt-5">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or breed..."
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className="w-full rounded-md border py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
 
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <select value={filters.species} onChange={(e) => handleFilterChange("species", e.target.value)} className="rounded-md border px-3 py-2 text-sm">
          <option value="">All Species</option>
          <option>Dog</option><option>Cat</option><option>Bird</option><option>Rabbit</option><option>Other</option>
        </select>
        <select value={filters.gender} onChange={(e) => handleFilterChange("gender", e.target.value)} className="rounded-md border px-3 py-2 text-sm">
          <option value="">Any Gender</option>
          <option>Male</option><option>Female</option>
        </select>
        <select value={filters.size} onChange={(e) => handleFilterChange("size", e.target.value)} className="rounded-md border px-3 py-2 text-sm">
          <option value="">Any Size</option>
          <option>Small</option><option>Medium</option><option>Large</option>
        </select>
        <div className="flex items-center gap-1">
          <input type="number" min="0" placeholder="Min age" value={filters.minAge} onChange={(e) => handleFilterChange("minAge", e.target.value)} className="w-24 rounded-md border px-3 py-2 text-sm" />
          <span className="text-gray-400">–</span>
          <input type="number" min="0" placeholder="Max age" value={filters.maxAge} onChange={(e) => handleFilterChange("maxAge", e.target.value)} className="w-24 rounded-md border px-3 py-2 text-sm" />
        </div>
        <select value={filters.sort} onChange={(e) => handleFilterChange("sort", e.target.value)} className="rounded-md border px-3 py-2 text-sm">
          <option value="newest">Newest First</option>
          <option value="age-asc">Age: Low to High</option>
          <option value="age-desc">Age: High to Low</option>
          <option value="name-asc">Name: A to Z</option>
        </select>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500">
            <X className="h-4 w-4" /> Clear filters
          </button>
        )}
      </div>
 
      {!loading && (
        <p className="mt-4 text-sm text-gray-500">{animals.length} animal{animals.length !== 1 ? "s" : ""} found</p>
      )}
 
      {loading ? (
        <p className="mt-6 text-gray-500">Loading...</p>
      ) : animals.length === 0 ? (
        <p className="mt-6 text-gray-500">No animals found matching your filters.</p>
      ) : (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {animals.map((a) => (
            <Link key={a._id} to={`/animals/${a._id}`} className="overflow-hidden rounded-xl border shadow-sm transition hover:shadow-md">
              <img src={a.photoUrl} alt={a.name} className="h-48 w-full object-cover" />
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-dark">{a.name}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[a.status]}`}>{a.status}</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{a.breed} · {a.age} yrs · {a.gender}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
