import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, MapPin, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { API_URL } from "../api.js";

export default function ReportAnimal() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [animalType, setAnimalType] = useState("Dog");
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
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

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );
    const data = await res.json();
    if (!res.ok) throw new Error("Image upload failed");
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (!photoFile) {
    setError("Please upload a photo of the animal");
    return;
  }
  if (!address.trim()) {
    setError("Please provide a location");
    return;
  }

  setLoading(true);
  try {
    const photoUrl = await uploadToCloudinary(photoFile);

    const res = await fetch(`${API_URL}/api/reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        animalType,
        description,
        photoUrl,
        location: { address, lat: coords?.lat || 0, lng: coords?.lng || 0 },
      }),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Failed to submit report");

    setSuccess(true);
    setTimeout(() => navigate("/my-reports"), 1500); // 1.5 sec dekhiye tarpor redirect
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <section className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-2xl font-bold text-dark">Report a Stray or Injured Animal</h1>
      <p className="mt-1 text-sm text-gray-600">
        By submitting a report, nearby rescuers or shelters can respond quickly.
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-100 px-4 py-2 text-sm text-red-700">{error}</p>
      )}
      {success && (
        <p className="mt-4 rounded-md bg-green-100 px-4 py-2 text-sm text-green-700">
            Report submitted successfully! Redirecting...
        </p>
        )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Photo</label>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 p-6 text-gray-500 hover:border-primary">
            {preview ? (
              <img src={preview} alt="Preview" className="h-40 w-40 rounded-md object-cover" />
            ) : (
              <>
                <Camera className="h-8 w-8" />
                <span className="text-sm">Click to upload a photo</span>
              </>
            )}
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </label>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Animal Type</label>
          <select
            value={animalType}
            onChange={(e) => setAnimalType(e.target.value)}
            className="w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option>Dog</option>
            <option>Cat</option>
            <option>Bird</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Description / Condition
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            placeholder="e.g. Injured leg, looks weak, near the bus stand..."
            className="w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              placeholder="Area / landmark"
              className="w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={handleUseMyLocation}
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
          {loading ? "Submitting..." : "Submit Report"}
        </button>
      </form>
    </section>
  );
}