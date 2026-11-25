import { useEffect, useState } from "react";
import { MapPin, Phone, Navigation, Clock, Siren, Loader2, LocateFixed } from "lucide-react";
 
// FR05 - Vet Near Me: user-er current location theke kacher vet clinic dekhay
export default function VetsNearMe() {
  const [vets, setVets] = useState([]);
  const [coords, setCoords] = useState(null);
  const [radius, setRadius] = useState(10);
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
 
  // Location na pele ba deny korle shob clinic dekhabe
  const loadAll = async (note) => {
    const res = await fetch("/api/vets");
    const data = await res.json();
    setVets(data);
    setMessage(note);
    setLoading(false);
  };
 
  const fetchNearby = async (lat, lng, r, emergency) => {
    setLoading(true);
    const params = new URLSearchParams({ lat, lng, radius: r });
    if (emergency) params.set("emergency", "true");
    const res = await fetch(`/api/vets/nearby?${params.toString()}`);
    const data = await res.json();
    setVets(data);
    setMessage("");
    setLoading(false);
  };
 
  const findMyLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      loadAll("Your browser does not support location. Showing all clinics.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(c);
        fetchNearby(c.lat, c.lng, radius, emergencyOnly);
      },
      () => loadAll("Location access was denied. Showing all clinics (not sorted by distance).")
    );
  };
 
  useEffect(() => {
    findMyLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
 
  const handleRadiusChange = (value) => {
    setRadius(value);
    if (coords) fetchNearby(coords.lat, coords.lng, value, emergencyOnly);
  };
 
  const handleEmergencyToggle = (checked) => {
    setEmergencyOnly(checked);
    if (coords) fetchNearby(coords.lat, coords.lng, radius, checked);
  };
 
  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-dark">Vet Near Me</h1>
      <p className="mt-1 text-sm text-gray-600">
        View the nearby vet clinics based on their distance from your location.
      </p>
 
      {/* Controls */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          onClick={findMyLocation}
          className="flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
        >
          <LocateFixed className="h-4 w-4" /> Use my location
        </button>
 
        <select
          value={radius}
          onChange={(e) => handleRadiusChange(Number(e.target.value))}
          disabled={!coords}
          className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
        >
          <option value={5}>Within 5 km</option>
          <option value={10}>Within 10 km</option>
          <option value={20}>Within 20 km</option>
          <option value={50}>Within 50 km</option>
        </select>
 
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={emergencyOnly}
            onChange={(e) => handleEmergencyToggle(e.target.checked)}
            disabled={!coords}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          Emergency care only
        </label>
      </div>
 
      {message && (
        <p className="mt-4 rounded-md bg-yellow-50 px-4 py-2 text-sm text-yellow-800">{message}</p>
      )}
 
      {/* Results */}
      {loading ? (
        <div className="mt-10 flex items-center text-gray-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Finding clinics...
        </div>
      ) : vets.length === 0 ? (
        <p className="mt-8 text-gray-500">
          No clinics found within {radius} km. Try a larger distance.
        </p>
      ) : (
        <>
          <p className="mt-4 text-sm text-gray-500">
            {vets.length} clinic{vets.length !== 1 ? "s" : ""} found
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {vets.map((v) => (
              <div key={v._id} className="rounded-xl border p-5 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-dark">{v.name}</h3>
                  {v.distanceKm !== undefined && (
                    <span className="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-primary">
                      {v.distanceKm} km
                    </span>
                  )}
                </div>
 
                <p className="mt-2 flex items-start gap-1 text-sm text-gray-600">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {v.address}
                </p>
                {v.openingHours && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="h-4 w-4 shrink-0" /> {v.openingHours}
                  </p>
                )}
 
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {v.emergencyAvailable && (
                    <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                      <Siren className="h-3 w-3" /> Emergency
                    </span>
                  )}
                  {v.services
                    ?.split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((s) => (
                      <span key={s} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        {s}
                      </span>
                    ))}
                </div>
 
                <div className="mt-4 flex gap-2">
                  <a
                    href={`tel:${v.phone}`}
                    className="flex flex-1 items-center justify-center gap-1 rounded-md bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    <Phone className="h-4 w-4" /> Call
                  </a>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${v.location.lat},${v.location.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-1 items-center justify-center gap-1 rounded-md border py-2 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary"
                  >
                    <Navigation className="h-4 w-4" /> Directions
                  </a>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
