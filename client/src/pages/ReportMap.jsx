import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
 
const COLORS = { urgent: "#dc2626", rescued: "#16a34a" }; // red / green
 
// Default marker image bundler-e jhamela kore, tai nijer colored circle pin banano hoyeche
const makeIcon = (color) =>
  L.divIcon({
    className: "",
    html: `<span style="display:block;width:22px;height:22px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 0 6px rgba(0,0,0,.5)"></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
  });
 
const icons = { urgent: makeIcon(COLORS.urgent), rescued: makeIcon(COLORS.rescued) };
 
// rescued = green, baki shob (pending / in-progress) = red (urgent, ekhono uddhar hoyni)
const pinType = (status) => (status === "rescued" ? "rescued" : "urgent");
 
// GPS na dile location (0, 0) save hoy - oigulo map-e dekhano jay na
const hasGps = (r) => r.location && !(r.location.lat === 0 && r.location.lng === 0);
 
// Pin gulo jeno shob dekha jay, map-er zoom/position auto adjust kore
function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) map.fitBounds(points, { padding: [50, 50], maxZoom: 15 });
  }, [points, map]);
  return null;
}
 
// FR06 - Rescue Report Map View (shelter / admin)
export default function ReportMap() {
  const { token } = useAuth();
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("all"); // all | urgent | rescued
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
 
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch("/api/reports/map", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load reports");
        setReports(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [token]);
 
  const mappable = useMemo(() => reports.filter(hasGps), [reports]);
  const missingGps = reports.length - mappable.length;
  const urgentCount = mappable.filter((r) => pinType(r.status) === "urgent").length;
  const rescuedCount = mappable.length - urgentCount;
 
  const visible = useMemo(
    () => mappable.filter((r) => filter === "all" || pinType(r.status) === filter),
    [mappable, filter]
  );
  const points = useMemo(() => visible.map((r) => [r.location.lat, r.location.lng]), [visible]);
 
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading map...
      </div>
    );
  }
 
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-dark">Rescue Report Map</h1>
      <p className="mt-1 text-sm text-gray-600">
        Shob rescue report map-e pin hisebe — lal = jaruri (ekhono uddhar hoyni), sobuj = uddhar kora hoyeche.
      </p>
 
      {error && <p className="mt-4 rounded-md bg-red-100 px-4 py-2 text-sm text-red-700">{error}</p>}
 
      {/* Filter + legend */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {[
          { key: "all", label: `All (${mappable.length})` },
          { key: "urgent", label: `Urgent (${urgentCount})` },
          { key: "rescued", label: `Rescued (${rescuedCount})` },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-4 py-1 text-sm font-medium ${
              filter === f.key ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {f.label}
          </button>
        ))}
 
        <div className="ml-auto flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-600" /> Urgent
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-green-600" /> Rescued
          </span>
        </div>
      </div>
 
      {/* "relative z-0" na dile Leaflet pane gulo sticky navbar-er upore uthe jay */}
      <div className="relative z-0 mt-4 h-[65vh] overflow-hidden rounded-xl border shadow-sm">
        <MapContainer center={[23.8103, 90.4125]} zoom={11} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds points={points} />
 
          {visible.map((r) => (
            <Marker
              key={r._id}
              position={[r.location.lat, r.location.lng]}
              icon={icons[pinType(r.status)]}
            >
              <Popup>
                <div className="w-48">
                  {r.photoUrl && (
                    <img src={r.photoUrl} alt={r.animalType} className="mb-2 h-24 w-full rounded object-cover" />
                  )}
                  <p className="text-sm font-semibold">
                    {r.animalType}{" "}
                    <span
                      className={`ml-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        pinType(r.status) === "rescued"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {r.status}
                    </span>
                  </p>
      <p className="mt-1 text-xs text-gray-600">{r.description}</p>
                  <p className="mt-1 text-xs text-gray-400">{r.location.address}</p>
                  <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()}</p>
                  <Link to="/reports" className="mt-1 inline-block text-xs font-medium text-primary">
                    Manage reports →
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
 
      {mappable.length === 0 && !error && (
        <p className="mt-3 text-sm text-gray-500">Ekhono GPS location shoho kono report nai.</p>
      )}
      {missingGps > 0 && (
        <p className="mt-3 text-sm text-yellow-700">
          {missingGps} ta report-e GPS location nai (reporter shudhu address likhechhe), tai map-e dekhano jay na.
        </p>
      )}
    </section>
  );
}
