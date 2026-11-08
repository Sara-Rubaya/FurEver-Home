import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
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
    const fetchAnimal = async () => {
      setLoading(true);
      const res = await fetch(`/api/animals/${id}`);
      const data = await res.json();
      setAnimal(data);
      setLoading(false);
    };
    fetchAnimal();
  }, [id]);
 
  if (loading) return <p className="py-20 text-center text-gray-500">Loading...</p>;
  if (!animal) return <p className="py-20 text-center text-gray-500">Animal not found.</p>;
 
  const canApply = isAuthenticated && user.role === "adopter" && animal.status === "available";
 
  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <div className="grid gap-8 md:grid-cols-2">
        <img src={animal.photoUrl} alt={animal.name} className="h-80 w-full rounded-xl object-cover shadow" />
 
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-dark">{animal.name}</h1>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_BADGE[animal.status]}`}>{animal.status}</span>
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
 
          <div className="mt-6">
            {canApply ? (
              <Link to={`/animals/${animal._id}/apply`} className="inline-block rounded-md bg-primary px-6 py-3 font-semibold text-white hover:bg-orange-600">
                Apply to Adopt
              </Link>
            ) : !isAuthenticated ? (
              <Link to="/login" className="text-sm font-medium text-primary hover:underline">
                Login to apply for adoption
              </Link>
            ) : animal.status !== "available" ? (
              <p className="text-sm text-gray-500">This animal is currently {animal.status} and not accepting applications.</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
