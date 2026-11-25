import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Phone, Clock, Siren, Plus, X, Trash2, Loader2, LocateFixed } from "lucide-react";
import { Stars } from "../components/StarRating.jsx";
import { useAuth } from "../context/AuthContext.jsx";
 
const defaultFilters = { search: "", emergency: false, minRating: "0", sort: "rating" };
const emptyForm = {
  name: "", address: "", phone: "", openingHours: "", services: "",
  emergencyAvailable: false, lat: "", lng: "",
};
 
// FR08 - Vet Clinic Directory: search, filter, sort + rating. Admin clinic add/delete korte pare.
export default function VetDirectory() {
  const { user, token } = useAuth();
  const isAdmin = user?.role === "admin";
 
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(defaultFilters);
 
  // Admin form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
 
  const fetchClinics = async () => {
    setLoading(true);
    const params = new URLSearchParams({ sort: filters.sort });
    if (filters.search) params.set("search", filters.search);
    if (filters.emergency) params.set("emergency", "true");
    if (filters.minRating !== "0") params.set("minRating", filters.minRating);
 
    const res = await fetch(`/api/vets/directory?${params.toString()}`);
    setClinics(await res.json());
    setLoading(false);
  };
 
  useEffect(() => {
    
    const t = setTimeout(fetchClinics, 300);
    return () => clearTimeout(t);
    
  }, [filters]);
 
  const setFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));
  const hasActiveFilters = filters.search || filters.emergency || filters.minRating !== "0";
 
  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) =>
      setForm((f) => ({ ...f, lat: String(pos.coords.latitude), lng: String(pos.coords.longitude) }))
    );
  };
 
  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError("");
    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      setFormError("Latitude and longitude must be numbers.");
      return;
    }
 
    setSaving(true);
    try {
      const res = await fetch("/api/vets", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: form.name,
          address: form.address,
          phone: form.phone,
          openingHours: form.openingHours,
          services: form.services,
          emergencyAvailable: form.emergencyAvailable,
          location: { lat, lng },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add clinic");
 
      setForm(emptyForm);
      setShowForm(false);
      fetchClinics();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };
 
  const handleDelete = async (id) => {
    if (!confirm("Delete this clinic and all its reviews?")) return;
    await fetch(`/api/vets/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    fetchClinics();
  };
 
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-dark">Vet Clinic Directory</h1>
          <p className="mt-1 text-sm text-gray-600">Find clinics, check their ratings, and share your own review.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex shrink-0 items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Cancel" : "Add clinic"}
          </button>
        )}
      </div>
 
      {/* Admin: new clinic add */}
      {isAdmin && showForm && (
        <form onSubmit={handleAdd} className="mt-5 flex flex-col gap-3 rounded-lg border p-5 shadow-sm">
          {formError && <p className="rounded-md bg-red-100 px-4 py-2 text-sm text-red-700">{formError}</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            <input required placeholder="Clinic name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-md border px-3 py-2 text-sm" />
            <input required placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-md border px-3 py-2 text-sm" />
            <input required placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="rounded-md border px-3 py-2 text-sm sm:col-span-2" />
            <input placeholder="Opening hours (e.g. 9 AM - 9 PM)" value={form.openingHours} onChange={(e) => setForm({ ...form, openingHours: e.target.value })} className="rounded-md border px-3 py-2 text-sm" />
            <input placeholder="Services (comma separated)" value={form.services} onChange={(e) => setForm({ ...form, services: e.target.value })} className="rounded-md border px-3 py-2 text-sm" />
            <input required placeholder="Latitude" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} className="rounded-md border px-3 py-2 text-sm" />
            <input required placeholder="Longitude" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} className="rounded-md border px-3 py-2 text-sm" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.emergencyAvailable} onChange={(e) => setForm({ ...form, emergencyAvailable: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-primary" />
              Emergency care available
            </label>
            <button type="button" onClick={useMyLocation} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              <LocateFixed className="h-4 w-4" /> Use my location for lat/lng
            </button>
          </div>
          <button type="submit" disabled={saving} className="rounded-md bg-primary py-2 font-semibold text-white hover:bg-orange-600 disabled:opacity-60">
            {saving ? "Saving..." : "Save clinic"}
          </button>
        </form>
      )}
 
      {/* Search + filters */}
      <div className="relative mt-5">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, area or service..."
          value={filters.search}
          onChange={(e) => setFilter("search", e.target.value)}
          className="w-full rounded-md border py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <select aria-label="Sort" value={filters.sort} onChange={(e) => setFilter("sort", e.target.value)} className="rounded-md border px-3 py-2 text-sm">
          <option value="rating">Highest rated</option>
          <option value="reviews">Most reviewed</option>
          <option value="name">Name A to Z</option>
        </select>
        <select aria-label="Minimum rating" value={filters.minRating} onChange={(e) => setFilter("minRating", e.target.value)} className="rounded-md border px-3 py-2 text-sm">
          <option value="0">Any rating</option>
          <option value="3">3 stars & up</option>
          <option value="4">4 stars & up</option>
          <option value="4.5">4.5 stars & up</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={filters.emergency} onChange={(e) => setFilter("emergency", e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary" />
          Emergency care only
        </label>
        {hasActiveFilters && (
          <button onClick={() => setFilters(defaultFilters)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500">
            <X className="h-4 w-4" /> Clear filters
          </button>
        )}
      </div>
 
      {/* Results */}
      {loading ? (
        <div className="mt-10 flex items-center text-gray-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading clinics...
        </div>
      ) : clinics.length === 0 ? (
        <p className="mt-8 text-gray-500">No clinics match your search.</p>
      ) : (
        <>
          <p className="mt-4 text-sm text-gray-500">
            {clinics.length} clinic{clinics.length !== 1 ? "s" : ""} found
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clinics.map((c) => (
              <div key={c._id} className="flex flex-col rounded-xl border p-5 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <Link to={`/vet-directory/${c._id}`} className="font-semibold text-dark hover:text-primary">
                    {c.name}
                  </Link>
                  {isAdmin && (
                    <button onClick={() => handleDelete(c._id)} aria-label={`Delete ${c.name}`} className="text-red-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
 
                <div className="mt-1 flex items-center gap-2 text-sm">
                  <Stars value={c.avgRating} />
                  {c.reviewCount > 0 ? (
                    <span className="text-gray-600">
                      {c.avgRating} ({c.reviewCount} review{c.reviewCount !== 1 ? "s" : ""})
                    </span>
                  ) : (
                    <span className="text-gray-400">No reviews yet</span>
                  )}
                </div>
 
                <p className="mt-2 flex items-start gap-1 text-sm text-gray-600">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {c.address}
                </p>
                {c.openingHours && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="h-4 w-4 shrink-0" /> {c.openingHours}
                  </p>
                )}
 
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.emergencyAvailable && (
                    <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                      <Siren className="h-3 w-3" /> Emergency
                    </span>
                  )}
                  {c.services?.split(",").map((s) => s.trim()).filter(Boolean).map((s) => (
                    <span key={s} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{s}</span>
                  ))}
                </div>
 
                <div className="mt-auto flex gap-2 pt-4">
                  <Link to={`/vet-directory/${c._id}`} className="flex-1 rounded-md border py-2 text-center text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary">
                    Details & reviews
                  </Link>
                  <a href={`tel:${c.phone}`} className="flex items-center justify-center gap-1 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700">
                    <Phone className="h-4 w-4" /> Call
                  </a>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
