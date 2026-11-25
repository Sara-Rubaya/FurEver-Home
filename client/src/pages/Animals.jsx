import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";

const STATUS_BADGE = {
  available: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  adopted: "bg-gray-200 text-gray-500",
};

const defaultFilters = {
  species: "",
  gender: "",
  size: "",
  search: "",
  minAge: "",
  maxAge: "",
  sort: "newest",
};

export default function Animals() {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(defaultFilters);

  // Fetch animals based on selected filters
  const fetchAnimals = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        status: "available",
      });

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "") {
          params.set(key, value);
        }
      });

      const response = await fetch(
        `/api/animals?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch animals");
      }

      const data = await response.json();

      setAnimals(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error("Animal Fetch Error:", err);
      setError("Unable to load animals. Please try again.");
      setAnimals([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Debounce API requests when filters change
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchAnimals();
    }, 300);

    return () => clearTimeout(timeout);
  }, [fetchAnimals]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Reset all filters
  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => key !== "sort" && value !== ""
  );

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold text-dark">
          Browse Animals
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Find your perfect companion and give an animal a loving home.
        </p>
      </div>

      {/* Search Section */}
      <div className="relative mt-5">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

        <input
          type="text"
          placeholder="Search by name or breed..."
          value={filters.search}
          onChange={(e) =>
            handleFilterChange("search", e.target.value)
          }
          className="w-full rounded-md border py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Filter Options */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <select
          value={filters.species}
          onChange={(e) =>
            handleFilterChange("species", e.target.value)
          }
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="">All Species</option>
          <option value="Dog">Dog</option>
          <option value="Cat">Cat</option>
          <option value="Bird">Bird</option>
          <option value="Rabbit">Rabbit</option>
          <option value="Other">Other</option>
        </select>

        <select
          value={filters.gender}
          onChange={(e) =>
            handleFilterChange("gender", e.target.value)
          }
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="">Any Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <select
          value={filters.size}
          onChange={(e) =>
            handleFilterChange("size", e.target.value)
          }
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="">Any Size</option>
          <option value="Small">Small</option>
          <option value="Medium">Medium</option>
          <option value="Large">Large</option>
        </select>

        {/* Age Range */}
        <div className="flex items-center gap-1">
          <input
            type="number"
            min="0"
            placeholder="Min age"
            value={filters.minAge}
            onChange={(e) =>
              handleFilterChange("minAge", e.target.value)
            }
            className="w-24 rounded-md border px-3 py-2 text-sm"
          />

          <span className="text-gray-400">–</span>

          <input
            type="number"
            min="0"
            placeholder="Max age"
            value={filters.maxAge}
            onChange={(e) =>
              handleFilterChange("maxAge", e.target.value)
            }
            className="w-24 rounded-md border px-3 py-2 text-sm"
          />
        </div>

        {/* Sorting */}
        <select
          value={filters.sort}
          onChange={(e) =>
            handleFilterChange("sort", e.target.value)
          }
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="newest">Newest First</option>
          <option value="age-asc">Age: Low to High</option>
          <option value="age-desc">Age: High to Low</option>
          <option value="name-asc">Name: A to Z</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-gray-500 transition hover:text-red-500"
          >
            <X className="h-4 w-4" />
            Clear filters
          </button>
        )}
      </div>

      {/* Results Count */}
      {!loading && !error && (
        <p className="mt-4 text-sm text-gray-500">
          {animals.length} animal
          {animals.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Loading State */}
      {loading ? (
        <p className="mt-6 text-gray-500">
          Loading animals...
        </p>
      ) : error ? (
        <div className="mt-6">
          <p className="text-sm text-red-500">{error}</p>
          <button
            onClick={fetchAnimals}
            className="mt-2 rounded-md bg-primary px-4 py-2 text-sm text-white"
          >
            Try Again
          </button>
        </div>
      ) : animals.length === 0 ? (
        <p className="mt-6 text-gray-500">
          No animals found matching your filters.
        </p>
      ) : (
        /* Animal Cards */
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {animals.map((animal) => (
            <Link
              key={animal._id}
              to={`/animals/${animal._id}`}
              className="overflow-hidden rounded-xl border shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <img
                src={animal.photoUrl}
                alt={animal.name}
                loading="lazy"
                className="h-48 w-full object-cover"
              />

              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-dark">
                    {animal.name}
                  </h3>

                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      STATUS_BADGE[animal.status] ||
                      "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {animal.status}
                  </span>
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  {animal.breed} · {animal.age} yrs · {animal.gender}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}