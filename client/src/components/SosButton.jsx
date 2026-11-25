import { useEffect, useState } from "react";
import { Phone, X, Loader2, MapPin, Siren, LocateFixed, Navigation } from "lucide-react";
 

const HELPLINES = [{ name: "National Emergency Service", phone: "999" }];
 

export default function SosButton() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("idle"); 
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
 
  
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
 
  const search = async (lat, lng) => {
    setStatus("loading");
    setError("");
    try {
      const res = await fetch(`/api/sos/nearby?lat=${lat}&lng=${lng}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Search failed");
      setData(json);
      setStatus("done");
    } catch (err) {
      setError(err.message);
      setStatus("manual");
    }
  };
 
  const locate = () => {
    setError("");
    setData(null);
    setStatus("locating");
    if (!navigator.geolocation) {
      setError("Your browser does not support location. Enter your area below.");
      setStatus("manual");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => search(pos.coords.latitude, pos.coords.longitude),
      () => {
        setError("Location access was denied. Enter your area below instead.");
        setStatus("manual");
      }
    );
  };
 
  const openSos = () => {
    setOpen(true);
    locate();
  };
 
 
  const handleManualSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setStatus("loading");
    setError("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=bd&q=${encodeURIComponent(query)}`
      );
      const places = await res.json();
      if (!places.length) {
        setError("Could not find that place. Try a more specific area name.");
        setStatus("manual");
        return;
      }
      search(places[0].lat, places[0].lon);
    } catch {
      setError("Could not look up that address. Check your internet connection.");
      setStatus("manual");
    }
  };
 
  const noResults = data && data.vets.length === 0 && data.rescuers.length === 0;
 
  return (
    <>
      {/* Floating SOS button */}
      <button
        onClick={openSos}
        aria-label="Emergency SOS"
        className="fixed bottom-5 right-5 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-40" />
        <span className="relative flex flex-col items-center text-xs font-bold leading-tight">
          <Siren className="h-5 w-5" />
          SOS
        </span>
      </button>
 
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-red-600">
                <Siren className="h-5 w-5" /> Emergency SOS
              </h2>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
 
            {(status === "locating" || status === "loading") && (
              <div className="flex items-center py-10 text-gray-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {status === "locating" ? "Getting your location..." : "Finding help near you..."}
              </div>
            )}
 
            {status === "manual" && (
              <div className="mt-4">
                {error && <p className="mb-3 rounded-md bg-yellow-50 px-3 py-2 text-sm text-yellow-800">{error}</p>}
                <form onSubmit={handleManualSearch} className="flex gap-2">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. Mirpur 10, Dhaka"
                    className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                  <button type="submit" className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                    Find
                  </button>
                </form>
                <button onClick={locate} className="mt-3 flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  <LocateFixed className="h-4 w-4" /> Try GPS again
                </button>
              </div>
            )}
 
            {status === "done" && data && (
              <div className="mt-3">
                <p className="text-sm text-gray-600">
                  Within {data.radiusKm} km of your location
                  {data.expanded && " (search area expanded - nothing found closer)"}
                </p>
 
                {noResults && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-sm font-semibold text-red-700">
                      No vet or rescuer found near you. Call a helpline:
                    </p>
                    {HELPLINES.map((h) => (
                      <ContactRow key={h.phone} name={h.name} phone={h.phone} />
                    ))}
                  </div>
                )}
 
                {data.vets.length > 0 && (
                  <>
                    <h3 className="mt-4 text-sm font-semibold text-dark">Vet clinics ({data.vets.length})</h3>
                    {data.vets.map((v) => (
                      <ContactRow
                        key={v._id}
                        name={v.name}
                        address={v.address}
                        distanceKm={v.distanceKm}
                        phone={v.phone}
                        emergency={v.emergencyAvailable}
                        lat={v.location.lat}
                        lng={v.location.lng}
                      />
                    ))}
                  </>
                )}
 
                {data.rescuers.length > 0 && (
                  <>
                    <h3 className="mt-4 text-sm font-semibold text-dark">Rescuers & shelters ({data.rescuers.length})</h3>
                    {data.rescuers.map((r) => (
                      <ContactRow
                        key={r._id}
                        name={r.name}
                        address={r.address}
                        distanceKm={r.distanceKm}
                        phone={r.phone}
                        lat={r.location.lat}
                        lng={r.location.lng}
                      />
                    ))}
                  </>
                )}
 
                <button
                  onClick={() => setStatus("manual")}
                  className="mt-4 text-sm font-medium text-gray-500 hover:text-primary hover:underline"
                >
                  Change location
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
 

function ContactRow({ name, address, distanceKm, phone, emergency, lat, lng }) {
  return (
    <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border p-3">
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-dark">
          {name}
          {emergency && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Emergency</span>
          )}
        </p>
        {address && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3 shrink-0" /> {address}
            {distanceKm !== undefined && <span className="ml-1 font-semibold text-primary">{distanceKm} km</span>}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {lat !== undefined && (
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Directions"
            className="rounded-md border p-2 text-gray-600 hover:border-primary hover:text-primary"
          >
            <Navigation className="h-4 w-4" />
          </a>
        )}
        <a
          href={`tel:${phone}`}
          className="flex items-center gap-1 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"
        >
          <Phone className="h-4 w-4" /> Call
        </a>
      </div>
    </div>
  );
}
