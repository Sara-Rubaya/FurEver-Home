import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Syringe,
  Stethoscope,
  AlertTriangle,
  Clock,
  Search,
  ArrowUpRight,
  Loader2,
  PawPrint,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { API_URL } from "../api.js";

// FR09 - Health Passports Hub for Shelters, Adopted Pet Owners, and Admins
export default function HealthPassports() {
  const { token, user } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const loadPassports = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_URL}/api/passports/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load health passports");
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadPassports();
  }, [token]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(({ animal, passport, summary }) => {
      const matchesQuery =
        !q ||
        animal.name?.toLowerCase().includes(q) ||
        animal.breed?.toLowerCase().includes(q) ||
        animal.species?.toLowerCase().includes(q) ||
        passport?.passportNumber?.toLowerCase().includes(q);

      if (!matchesQuery) return false;
      if (filter === "issued") return summary.hasPassport;
      if (filter === "missing") return !summary.hasPassport;
      if (filter === "alerts") return summary.overdueCount > 0 || summary.dueSoonCount > 0;
      return true;
    });
  }, [items, search, filter]);

  const headingCopy =
    user?.role === "adopter"
      ? "View and update medical records and vaccinations for your adopted pets."
      : user?.role === "admin"
      ? "Review and manage Pet Health Passports across all listed animals."
      : "Issue and maintain Pet Health Passports, vaccination logs, and treatment records for your shelter's animals.";

  return (
    <section className="min-h-screen bg-[#FFF7ED] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FFE4C7] px-3 py-1 text-xs font-bold text-[#7F1D1D]">
              <ShieldCheck className="h-4 w-4 text-[#DC2626]" />
              FR09 · PET HEALTH PASSPORT
            </div>
            <h1 className="mt-2 text-3xl font-extrabold text-[#7F1D1D]">Pet Health Passports</h1>
            <p className="mt-1 text-sm text-gray-600">{headingCopy}</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by pet name, breed, species, or passport ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-orange-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#F97316] focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-sm font-medium text-[#7F1D1D] focus:border-[#F97316] focus:outline-none"
          >
            <option value="all">All Pets ({items.length})</option>
            <option value="issued">Passport Issued</option>
            <option value="missing">Needs Passport</option>
            <option value="alerts">Due / Overdue Vaccines</option>
          </select>
        </div>

        {error && (
          <p className="mt-6 rounded-xl bg-red-100 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#DC2626]" />
            <p className="text-sm font-semibold text-[#7F1D1D]">Loading pet passports...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-[#FFE4C7] bg-white p-10 text-center shadow-sm">
            <PawPrint className="mx-auto h-10 w-10 text-[#F97316]" />
            <h2 className="mt-3 text-lg font-bold text-[#7F1D1D]">No pets found</h2>
            <p className="mt-1 text-sm text-gray-500">
              {user?.role === "adopter" && items.length === 0
                ? "Once one of your adoption applications is approved, your pet's Health Passport will appear here."
                : "Try adjusting your search or filter, or add animals in your shelter listings."}
            </p>
            <Link
              to={user?.role === "adopter" ? "/animals" : "/my-animals"}
              className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#DC2626] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#7F1D1D]"
            >
              {user?.role === "adopter" ? "Browse Animals" : "Go to My Animals"}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map(({ animal, passport, summary }) => (
              <div
                key={animal._id}
                className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[#FFE4C7] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div>
                  <div className="relative h-44">
                    <img
                      src={animal.photoUrl}
                      alt={animal.name}
                      className="h-full w-full object-cover"
                    />
                    <span
                      className={`absolute right-3 top-3 rounded-full px-3 py-1 font-mono text-xs font-bold shadow-sm ${
                        summary.hasPassport
                          ? "bg-[#7F1D1D] text-[#FFE4C7]"
                          : "bg-white/90 text-gray-700"
                      }`}
                    >
                      {passport?.passportNumber || "No Passport Yet"}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-extrabold text-[#7F1D1D]">{animal.name}</h3>
                        <p className="text-xs text-gray-500">
                          {animal.breed} · {animal.species} · {animal.age} yrs
                        </p>
                      </div>
                      <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-[#F97316]">
                        {animal.status}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <Syringe className="h-3.5 w-3.5 text-[#F97316]" />
                        {summary.vaccinationCount} Vaccines
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Stethoscope className="h-3.5 w-3.5 text-[#DC2626]" />
                        {summary.medicalRecordCount} Records
                      </span>
                    </div>

                    {(summary.overdueCount > 0 || summary.dueSoonCount > 0) && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {summary.overdueCount > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-semibold text-red-700">
                            <AlertTriangle className="h-3 w-3" />
                            {summary.overdueCount} Overdue
                          </span>
                        )}
                        {summary.dueSoonCount > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                            <Clock className="h-3 w-3" />
                            {summary.dueSoonCount} Due Soon
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-[#FFE4C7] bg-[#FFF7ED]/60 px-5 py-3">
                  <Link
                    to={`/animals/${animal._id}/passport`}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#DC2626] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#7F1D1D]"
                  >
                    {summary.hasPassport ? "Open Health Passport" : "Create Health Passport"}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
