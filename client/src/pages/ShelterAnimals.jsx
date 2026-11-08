import { useEffect, useState } from "react";
import { Plus, Trash2, Camera, X } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const STATUS_BADGE = {
  available: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  adopted: "bg-gray-200 text-gray-500",
};

const EMPTY_FORM = {
  name: "", species: "Dog", breed: "", age: "", gender: "Male",
  size: "Medium", description: "", healthStatus: "Vaccinated", temperament: "Friendly",
};

const inputClass = "rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary";

export default function ShelterAnimals() {
  const { token, user } = useAuth();

  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const loadMyAnimals = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/animals?shelter=${user.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load listings");
      setAnimals(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyAnimals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const uploadToCloudinary = async (file) => {
    const body = new FormData();
    body.append("file", file);
    body.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    const url = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`;
    const res = await fetch(url, { method: "POST", body });
    const data = await res.json();
    if (!res.ok) throw new Error("Image upload failed");
    return data.secure_url;
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setPhotoFile(null);
    setPreview(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!photoFile) {
      setError("Please upload a photo");
      return;
    }

    setSubmitting(true);
    try {
      const photoUrl = await uploadToCloudinary(photoFile);

      const res = await fetch("/api/animals", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, age: Number(form.age), photoUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add animal");

      resetForm();
      loadMyAnimals();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this listing?")) return;
    try {
      const res = await fetch(`/api/animals/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete listing");
      }
      loadMyAnimals();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark">My Animal Listings</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Add Animal"}
        </button>
      </div>

      {error && !showForm && (
        <p className="mt-4 rounded-md bg-red-100 px-4 py-2 text-sm text-red-700">{error}</p>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 rounded-lg border p-5 shadow-sm">
          {error && <p className="rounded-md bg-red-100 px-4 py-2 text-sm text-red-700">{error}</p>}

          <label className="flex w-40 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-gray-300 p-4 text-gray-500 hover:border-primary">
            {preview ? (
              <img src={preview} alt="Preview" className="h-24 w-24 rounded-md object-cover" />
            ) : (
              <>
                <Camera className="h-6 w-6" />
                <span className="text-xs">Upload photo</span>
              </>
            )}
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <input type="text" placeholder="Name" required value={form.name} onChange={(e) => updateField("name", e.target.value)} className={inputClass} />
            <select value={form.species} onChange={(e) => updateField("species", e.target.value)} className="rounded-md border px-4 py-2">
              <option>Dog</option><option>Cat</option><option>Bird</option><option>Rabbit</option><option>Other</option>
            </select>
            <input type="text" placeholder="Breed" value={form.breed} onChange={(e) => updateField("breed", e.target.value)} className={inputClass} />
            <input type="number" min="0" placeholder="Age (years)" required value={form.age} onChange={(e) => updateField("age", e.target.value)} className={inputClass} />
            <select value={form.gender} onChange={(e) => updateField("gender", e.target.value)} className="rounded-md border px-4 py-2">
              <option>Male</option><option>Female</option>
            </select>
            <select value={form.size} onChange={(e) => updateField("size", e.target.value)} className="rounded-md border px-4 py-2">
              <option>Small</option><option>Medium</option><option>Large</option>
            </select>
            <input type="text" placeholder="Health Status" value={form.healthStatus} onChange={(e) => updateField("healthStatus", e.target.value)} className={inputClass} />
            <input type="text" placeholder="Temperament" value={form.temperament} onChange={(e) => updateField("temperament", e.target.value)} className={inputClass} />
          </div>

          <textarea placeholder="Description / rescue story" required rows={3} value={form.description} onChange={(e) => updateField("description", e.target.value)} className={inputClass} />

          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-primary py-2 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Save Listing"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="mt-8 text-gray-500">Loading...</p>
      ) : animals.length === 0 ? (
        <p className="mt-8 text-gray-500">No animals listed yet.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {animals.map((a) => (
            <div key={a._id} className="overflow-hidden rounded-lg border shadow-sm">
              <img src={a.photoUrl} alt={a.name} className="h-40 w-full object-cover" />
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-dark">{a.name}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[a.status]}`}>
                    {a.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{a.breed} · {a.age} yrs · {a.gender}</p>
                <button
                  onClick={() => handleDelete(a._id)}
                  className="mt-3 flex items-center gap-1 text-sm text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
