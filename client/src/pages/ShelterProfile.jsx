import { useEffect, useState } from "react";
import { LocateFixed, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
 

export default function ShelterProfile() {
  const { token } = useAuth();
  const [form, setForm] = useState({ phone: "", address: "" });
  const [coords, setCoords] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState(null); 
 
  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
      const { user } = await res.json();
      setForm({ phone: user.phone || "", address: user.address || "" });
      if (user.location?.lat != null && user.location?.lng != null) {
        setCoords({ lat: user.location.lat, lng: user.location.lng });
      }
      setIsVerified(!!user.isVerified);
      setLoading(false);
    };
    load();
  }, [token]);
 
  const useGps = () => {
    if (!navigator.geolocation) {
      setMessage({ type: "error", text: "Your browser does not support location." });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setMessage({ type: "error", text: "Could not get your location. Allow location access and try again." });
        setLocating(false);
      }
    );
  };
 
  const handleSave = async (e) => {
    e.preventDefault();
    setMessage(null);
 
    if (!form.phone.trim()) {
      setMessage({ type: "error", text: "Phone number is required." });
      return;
    }
    if (!coords) {
      setMessage({ type: "error", text: "Please set your location using the GPS button." });
      return;
    }
 
    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ phone: form.phone, address: form.address, location: coords }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save");
      setMessage({ type: "success", text: "Contact info saved." });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };
 
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading...
      </div>
    );
  }
 
  return (
    <section className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-2xl font-bold text-dark">Contact & Location</h1>
      <p className="mt-1 text-sm text-gray-600">
        This is required to display your name, phone number, and distance in Emergency SOS.
      </p>
 
      {isVerified ? (
        <p className="mt-4 flex items-center gap-2 rounded-md bg-green-50 px-4 py-2 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4" /> Your account is verified - you will appear in Emergency SOS.
        </p>
      ) : (
        <p className="mt-4 flex items-center gap-2 rounded-md bg-yellow-50 px-4 py-2 text-sm text-yellow-800">
          <AlertTriangle className="h-4 w-4 shrink-0" /> Your account has not been verified by the admin yet. You won't appear in the SOS list until your account is verified.
        </p>
      )}
 
      {message && (
        <p
          className={`mt-4 rounded-md px-4 py-2 text-sm ${
            message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </p>
      )}
 
      <form onSubmit={handleSave} className="mt-5 flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Emergency phone number</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="01XXXXXXXXX"
            className="w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
 
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Address / area</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="e.g. Mirpur 12, Dhaka"
            className="w-full rounded-md border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
 
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
          <button
            type="button"
            onClick={useGps}
            className="flex items-center gap-1 rounded-md border px-3 py-2 text-sm text-gray-700 hover:border-primary hover:text-primary"
          >
            {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
            Use my current location
          </button>
          {coords && (
            <p className="mt-1 text-xs text-gray-500">
              Saved/selected: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
            </p>
          )}
        </div>
 
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-primary py-2 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </form>
    </section>
  );
}
