import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const STATUS_BADGE = {
  available: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  adopted: "bg-gray-200 text-gray-500",
};

export default function AnimalDetails() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();

  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnimal = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/animals/${id}`);
        const data = await res.json();
        setAnimal(res.ok ? data : null);
      } catch {
        setAnimal(null);
      } finally {
        setLoading(false);
      }
    };
    loadAnimal();
  }, [id]);

  if (loading) return <p className="py-20 text-center text-gray-500">Loading...</p>;
  if (!animal) return <p className="py-20 text-center text-gray-500">Animal not found.</p>;

  const isAvailable = animal.status === "available";
  const canApply = isAuthenticated && user.role === "adopter" && isAvailable;

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <div className="grid gap-8 md:grid-cols-2">
        <img src={animal.photoUrl} alt={animal.name} className="h-80 w-full rounded-xl object-cover shadow" />

        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-dark">{animal.name}</h1>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_BADGE[animal.status]}`}>
              {animal.status}
            </span>
          </div>

          <p className="mt-2 text-gray-600">
            {animal.breed} · {animal.species} · {animal.age} yrs · {animal.gender} · {animal.size}
          </p>

          <div className="mt-5 space-y-2 text-sm">
            <p><span className="font-medium text-dark">Health Status: </span>{animal.healthStatus}</p>
            <p><span className="font-medium text-dark">Temperament: </span>{animal.temperament}</p>
            <p><span className="font-medium text-dark">Listed by: </span>{animal.shelter?.name}</p>
          </div>

          <p className="mt-5 text-gray-700">{animal.description}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to={`/animals/${animal._id}/passport`}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#7F1D1D] bg-[#FFF7ED] px-5 py-3 text-sm font-semibold text-[#7F1D1D] transition hover:bg-[#FFE4C7]"
            >
              <ShieldCheck className="h-4 w-4 text-[#DC2626]" />
              Health Passport
            </Link>

            {canApply ? (
              <Link
                to={`/animals/${animal._id}/apply`}
                className="inline-block rounded-md bg-primary px-6 py-3 font-semibold text-white hover:bg-orange-600"
              >
                Apply to Adopt
              </Link>
            ) : !isAuthenticated ? (
              <Link to="/login" className="text-sm font-medium text-primary hover:underline">
                Login to apply for adoption
              </Link>
            ) : !isAvailable ? (
              <p className="text-sm text-gray-500">
                This animal is currently {animal.status} and not accepting applications.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
