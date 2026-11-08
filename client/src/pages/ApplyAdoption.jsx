import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
 
export default function ApplyAdoption() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
 
  const [animal, setAnimal] = useState(null);
  const [housingType, setHousingType] = useState("Apartment");
  const [hasOtherPets, setHasOtherPets] = useState(false);
  const [experience, setExperience] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
 
  useEffect(() => {
    const fetchAnimal = async () => {
      const res = await fetch(`/api/animals/${id}`);
      const data = await res.json();
      setAnimal(data);
    };
    fetchAnimal();
  }, [id]);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
 
    if (!experience.trim()) {
      setError("Please share your pet-care experience");
      return;
    }
 
    setLoading(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ animalId: id, housingType, hasOtherPets, experience, message }),
      });
      const data = await res.json();
 
      if (!res.ok) throw new Error(data.message || "Failed to submit application");
 
      setSuccess(true);
      setTimeout(() => navigate("/my-applications"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <section className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-2xl font-bold text-dark">Adoption Application{animal ? ` – ${animal.name}` : ""}</h1>
      <p className="mt-1 text-sm text-gray-600">Shob information shothik vabe dao, eta shelter review korbe.</p>
 
      {error && <p className="mt-4 rounded-md bg-red-100 px-4 py-2 text-sm text-red-700">{error}</p>}
      {success && <p className="mt-4 rounded-md bg-green-100 px-4 py-2 text-sm text-green-700">Application submitted! Redirecting...</p>}
 
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Housing Type</label>
          <select value={housingType} onChange={(e) => setHousingType(e.target.value)} className="w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
            <option>Apartment</option>
            <option>House</option>
            <option>Other</option>
          </select>
        </div>
 
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input type="checkbox" checked={hasOtherPets} onChange={(e) => setHasOtherPets(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
            I have other pets at home
          </label>
        </div>
 
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Pet-care Experience</label>
          <textarea value={experience} onChange={(e) => setExperience(e.target.value)} required rows={3} placeholder="e.g. Had a dog for 5 years growing up..." className="w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
 
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Message to Shelter (optional)</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} placeholder="Anything else you'd like the shelter to know..." className="w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
 
        <button type="submit" disabled={loading} className="mt-2 rounded-md bg-primary py-2 font-semibold text-white hover:bg-orange-600 disabled:opacity-60">
          {loading ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </section>
  );
}
