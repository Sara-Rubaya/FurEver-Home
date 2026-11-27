import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, MapPin, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { API_URL } from "../api.js";
import { uploadImage } from "../utils/uploadImage.js";

const inputCls =
  "w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary";
const labelCls = "mb-1 block text-sm font-medium text-gray-700";

export default function PostLostFound() {
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const now = new Date();
  const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

  const [form, setForm] = useState({
    type: "lost",
    petName: "",
    species: "Dog",
    breed: "",
    color: "",
    description: "",
    eventDate: today,
    contactPhone: user?.phone || "",
    address: "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const isLost = form.type === "lost";

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleGps = () => {
    if (!navigator.geolocation) return setError("Geolocation is not supported by your browser");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setError("Could not get your location. Please type the address manually.");
        setLocating(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!photoFile) return setError("Please upload a photo of the pet");
    setLoading(true);
    try {
      const photoUrl = await uploadImage(photoFile);
      const { address, ...rest } = form;
      const res = await fetch(`${API_URL}/api/lost-found`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...rest,
          photoUrl,
          location: { address, lat: coords?.lat ?? 0, lng: coords?.lng ?? 0 },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit post");
      navigate(`/lost-found/${data._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-2xl font-bold text-dark">Post a Lost or Found Pet</h1>
      <p className="mt-1 text-sm text-gray-600">
        We will automatically look for possible matches after you post.
      </p>

      {error && <p className="mt-4 rounded-md bg-red-100 px-4 py-2 text-sm text-red-700">{error}</p>}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        {/* Type toggle */}
        <div className="grid grid-cols-2 overflow-hidden rounded-md border text-sm font-semibold">
          {[
            ["lost", "I lost my pet"],
            ["found", "I found a pet"],
          ].map(([val, label]) => (
            <button
              type="button"
              key={val}
              onClick={() => setForm({ ...form, type: val })}
              className={`py-2.5 ${
                form.type === val
                  ? val === "lost"
                    ? "bg-red-600 text-white"
                    : "bg-green-600 text-white"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div>
          <label className={labelCls}>Photo</label>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 p-6 text-gray-500 hover:border-primary">
            {preview ? (
              <img src={preview} alt="Preview" className="h-40 w-40 rounded-md object-cover" />
            ) : (
              <>
                <Camera className="h-8 w-8" />
                <span className="text-sm">Click to upload a clear photo</span>
              </>
            )}
            <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Species</label>
            <select value={form.species} onChange={set("species")} className={inputCls}>
              {["Dog", "Cat", "Bird", "Rabbit", "Other"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Pet Name {!isLost && "(if known)"}</label>
            <input value={form.petName} onChange={set("petName")} required={isLost} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Breed</label>
            <input value={form.breed} onChange={set("breed")} placeholder="e.g. Labrador" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Color</label>
            <input value={form.color} onChange={set("color")} placeholder="e.g. Brown" className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Description</label>
          <textarea
            value={form.description}
            onChange={set("description")}
            required
            rows={3}
            placeholder="Collar, marks, size, behaviour..."
            className={inputCls}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>{isLost ? "Date lost" : "Date found"}</label>
            <input type="date" max={today} value={form.eventDate} onChange={set("eventDate")} required className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Contact Phone</label>
            <input type="tel" value={form.contactPhone} onChange={set("contactPhone")} required className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>{isLost ? "Last seen location" : "Found location"}</label>
          <div className="flex gap-2">
            <input
              value={form.address}
              onChange={set("address")}
              required
              placeholder="Area / landmark"
              className={inputCls}
            />
            <button
              type="button"
              onClick={handleGps}
              className="flex shrink-0 items-center gap-1 rounded-md border px-3 py-2 text-sm text-gray-700 hover:border-primary hover:text-primary"
            >
              {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
              GPS
            </button>
          </div>
          {coords && (
            <p className="mt-1 text-xs text-gray-500">
              Location captured: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-md bg-primary py-2 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit Post"}
        </button>
      </form>
    </section>
  );
}
