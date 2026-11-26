
import { Link } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Loader2,
  MapPin,
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Navigation,
  ArrowUpRight,
  CalendarDays,
  PawPrint,
  MapPinned,
  RefreshCw,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const COLORS = {
  urgent: "#dc2626",
  rescued: "#16a34a",
};

const makeIcon = (color) =>
  L.divIcon({
    className: "",
    html: `<div style="
      width:24px;
      height:24px;
      border-radius:50%;
      background:${color};
      border:4px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,.35);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });

const icons = {
  urgent: makeIcon(COLORS.urgent),
  rescued: makeIcon(COLORS.rescued),
};

const pinType = (status) =>
  status === "rescued" ? "rescued" : "urgent";

const hasGps = (r) =>
  r.location &&
  Number.isFinite(Number(r.location.lat)) &&
  Number.isFinite(Number(r.location.lng)) &&
  Number(r.location.lat) !== 0 &&
  Number(r.location.lng) !== 0 &&
  Math.abs(Number(r.location.lat)) <= 90 &&
  Math.abs(Number(r.location.lng)) <= 180;

function FitBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points.length > 0) {
      map.fitBounds(points, {
        padding: [50, 50],
        maxZoom: 15,
      });
    }
  }, [points, map]);

  return null;
}

const StatCard = ({ title, value, icon: Icon, color, bg }) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
          {value}
        </h2>
      </div>

      <div className={`rounded-xl p-3 ${bg}`}>
        <Icon size={25} className={color} />
      </div>
    </div>
  </div>
);

// FR06 - Rescue Report Map View
export default function ReportMap() {
  const { token } = useAuth();

  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/reports/map", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load reports");
      }

      setReports(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [token]);

  const mappable = useMemo(
    () => reports.filter(hasGps),
    [reports]
  );

  const missingGps = reports.length - mappable.length;

  const urgentCount = mappable.filter(
    (r) => pinType(r.status) === "urgent"
  ).length;

  const rescuedCount = mappable.filter(
    (r) => pinType(r.status) === "rescued"
  ).length;

  const visible = useMemo(
    () =>
      mappable.filter(
        (r) => filter === "all" || pinType(r.status) === filter
      ),
    [mappable, filter]
  );

  const points = useMemo(
    () =>
      visible.map((r) => [
        Number(r.location.lat),
        Number(r.location.lng),
      ]),
    [visible]
  );

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-gray-500">
          Loading rescue reports...
        </p>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50/80 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
              <MapPinned size={17} />
              RESCUE MANAGEMENT
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Rescue Report Map
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Monitor animal rescue reports and track their locations
              through an interactive map.
            </p>
          </div>

          <button
            onClick={fetchReports}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100 sm:self-center"
          >
            <RefreshCw size={16} />
            Refresh Data
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Reports with GPS"
            value={mappable.length}
            icon={ClipboardList}
            color="text-blue-600"
            bg="bg-blue-50"
          />

          <StatCard
            title="Urgent Cases"
            value={urgentCount}
            icon={AlertCircle}
            color="text-red-600"
            bg="bg-red-50"
          />

          <StatCard
            title="Successfully Rescued"
            value={rescuedCount}
            icon={CheckCircle2}
            color="text-green-600"
            bg="bg-green-50"
          />
        </div>

        {/* Map Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* Map Header */}
          <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <MapPin className="text-primary" size={20} />
                Live Report Locations
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {visible.length} locations currently displayed
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {[
                {
                  key: "all",
                  label: "All Reports",
                  count: mappable.length,
                },
                {
                  key: "urgent",
                  label: "Urgent",
                  count: urgentCount,
                },
                {
                  key: "rescued",
                  label: "Rescued",
                  count: rescuedCount,
                },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setFilter(item.key)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    filter === item.key
                      ? "bg-primary text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {item.label} ({item.count})
                </button>
              ))}
            </div>
          </div>

          {/* Map Legend */}
          <div className="flex flex-wrap items-center gap-5 bg-gray-50 px-5 py-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Map Legend
            </span>

            <span className="flex items-center gap-2 text-sm text-gray-600">
              <span className="h-3 w-3 rounded-full bg-red-600" />
              Urgent / Pending
            </span>

            <span className="flex items-center gap-2 text-sm text-gray-600">
              <span className="h-3 w-3 rounded-full bg-green-600" />
              Rescued
            </span>
          </div>

          {/* Map */}
          <div className="relative z-0 h-[65vh] min-h-[400px] w-full">
            {visible.length > 0 ? (
              <MapContainer
                center={[23.8103, 90.4125]}
                zoom={11}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitBounds points={points} />

                {visible.map((r) => (
                  <Marker
                    key={r._id}
                    position={[
                      Number(r.location.lat),
                      Number(r.location.lng),
                    ]}
                    icon={icons[pinType(r.status)]}
                  >
                    <Popup>
                      <div className="w-56 overflow-hidden">
                        {r.photoUrl && (
                          <img
                            src={r.photoUrl}
                            alt={r.animalType}
                            className="mb-3 h-32 w-full rounded-lg object-cover"
                          />
                        )}

                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="font-bold text-gray-900">
                            {r.animalType}
                          </span>

                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                              pinType(r.status) === "rescued"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {r.status}
                          </span>
                        </div>

                        <p className="mb-3 text-xs leading-5 text-gray-600">
                          {r.description}
                        </p>

                        <div className="space-y-2 border-t border-gray-100 pt-3">
                          <p className="flex items-start gap-2 text-xs text-gray-500">
                            <MapPin size={14} className="shrink-0" />
                            {r.location.address || "Address unavailable"}
                          </p>

                          <p className="flex items-center gap-2 text-xs text-gray-500">
                            <CalendarDays size={14} />
                            {new Date(r.createdAt).toLocaleString()}
                          </p>
                        </div>

                        <Link
                          to="/reports"
                          className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white"
                        >
                          Manage Report
                          <ArrowUpRight size={14} />
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center bg-gray-50 px-4 text-center">
                <div className="mb-4 rounded-full bg-gray-100 p-5">
                  <MapPin size={32} className="text-gray-400" />
                </div>

                <h3 className="text-lg font-bold text-gray-800">
                  No Locations Found
                </h3>

                <p className="mt-2 max-w-sm text-sm text-gray-500">
                  There are no GPS-enabled reports available for this filter.
                </p>
              </div>
            )}
          </div>

          {/* Map Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-white px-5 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Navigation size={16} className="text-primary" />
              Interactive Location Tracking
            </div>

            <span className="text-xs font-medium text-gray-400">
              OpenStreetMap
            </span>
          </div>
        </div>

        {/* Missing GPS Warning */}
        {missingGps > 0 && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0 text-yellow-600"
            />

            <div>
              <h3 className="text-sm font-bold text-yellow-800">
                GPS Location Missing
              </h3>

              <p className="mt-1 text-sm leading-5 text-yellow-700">
                {missingGps} reports do not have valid GPS coordinates.
                These reports cannot be displayed on the map.
              </p>
            </div>
          </div>
        )}

        {/* Bottom Information */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-2">
            <PawPrint size={15} />
            Animal Rescue Management System
          </span>

          <Link
            to="/reports"
            className="font-semibold text-primary hover:underline"
          >
            View All Reports →
          </Link>
        </div>

      </div>
    </section>
  );
}
