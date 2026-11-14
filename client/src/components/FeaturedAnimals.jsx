
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  PawPrint,
  Sparkles,
  ArrowUpRight,
  Heart,
} from "lucide-react";

// Home page-er Featured Animals - latest 4 available animals
export default function FeaturedAnimals() {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch(
          "/api/animals?status=available&sort=newest"
        );

        const data = await res.json();

        if (res.ok && Array.isArray(data)) {
          setAnimals(data.slice(0, 4));
        }
      } catch {
        // Fetch fail korleo home page break hobe na
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  // Hide section if no animals are available
  if (!loading && animals.length === 0) return null;

  return (
    <section
      data-aos="fade-left"
      className="relative overflow-hidden bg-[#FFF7ED] px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
    >
      {/* Background Decorations */}
      <div className="absolute -left-28 top-20 h-64 w-64 rounded-full bg-[#FFE4C7]/60 blur-3xl" />

      <div className="absolute -right-28 bottom-10 h-72 w-72 rounded-full bg-orange-100/70 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl">

        {/* Section Heading */}
        <div className="flex items-end justify-between gap-4">

          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#FDBA74] bg-white px-3 py-1.5 shadow-sm">
              <Sparkles size={14} className="text-[#F97316]" />

              <span className="text-[11px] font-extrabold tracking-wider text-[#7F1D1D]">
                MEET YOUR NEW BEST FRIEND
              </span>
            </div>

            <h2 className="text-3xl font-black tracking-tight text-[#7F1D1D] sm:text-4xl lg:text-5xl">
              Meet Our{" "}
              <span className="text-[#DC2626]">
                Lovely Animals!
              </span>
            </h2>

            <p className="mt-2 text-sm text-[#783F32] sm:text-base">
              These adorable animals are waiting for a loving family.
            </p>
          </div>

          <Link
            to="/animals"
            className="hidden shrink-0 text-lg font-bold text-[#DC2626] transition hover:text-[#7F1D1D] hover:underline sm:block"
          >
            View all <ArrowUpRight size={16} className="ml-1 inline" />
          </Link>

        </div>

        {/* Animals Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">

          {loading
            ? [1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="animate-pulse overflow-hidden rounded-2xl border border-[#FFE4C7] bg-white p-2 shadow-sm"
                  data-testid="skeleton"
                >
                  <div className="h-40 rounded-xl bg-[#FFE4C7]" />

                  <div className="space-y-2 p-3">
                    <div className="h-4 w-2/3 rounded bg-[#FFE4C7]" />
                    <div className="h-3 w-1/2 rounded bg-[#FFF0E0]" />
                  </div>
                </div>
              ))

            : animals.map((a, index) => (
                <Link
                  key={a._id}
                  to={`/animals/${a._id}`}
                  className="group relative overflow-hidden rounded-2xl border border-[#FFE4C7] bg-white p-2 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#FDBA74] hover:shadow-xl hover:shadow-orange-100/70"
                >
                  {/* Card Number */}
                  <span className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-xs font-black text-[#DC2626] shadow-sm">
                    0{index + 1}
                  </span>

                  {/* Animal Image */}
                  <div className="relative overflow-hidden rounded-xl">
                    <img
                      src={a.photoUrl}
                      alt={a.name}
                      loading="lazy"
                      className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    <span className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-[#DC2626] shadow-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#F97316]" />
                      Available
                    </span>
                  </div>

                  {/* Animal Information */}
                  <div className="px-2 pb-2 pt-3">

                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate font-bold text-[#7F1D1D] transition-colors group-hover:text-[#DC2626]">
                        {a.name}
                      </h3>

                      <PawPrint
                        size={17}
                        className="shrink-0 text-[#F97316]"
                      />
                    </div>

                    <p className="mt-1 text-xs text-gray-500">
                      {a.breed} · {a.age} yrs · {a.gender}
                    </p>

                    {/* Bottom Details */}
                    <div className="mt-3 flex items-center justify-between border-t border-[#FFF0E0] pt-3">

                      <span className="flex items-center gap-1.5 text-xs font-bold text-[#7F1D1D]">
                        <Heart
                          size={14}
                          className="text-[#DC2626]"
                        />
                        Meet Me
                      </span>

                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFE4C7] text-[#DC2626] transition-all duration-300 group-hover:bg-[#DC2626] group-hover:text-white">
                        <ArrowUpRight size={17} />
                      </span>

                    </div>
                  </div>
                </Link>
              ))}
        </div>

        {/* Mobile View All */}
        <div className="mt-6 text-center sm:hidden">
          <Link
            to="/animals"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#DC2626] transition hover:text-[#7F1D1D] hover:underline"
          >
            View all animals
            <ArrowUpRight size={16} />
          </Link>
        </div>

      </div>
    </section>
  );
}
