
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  PawPrint,
  Clock,
  HeartHandshake,
  FileText,
  Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function ShelterDashboard() {
  const { token, user } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");

        if (!token) {
          throw new Error("Authentication required. Please log in again.");
        }

        const res = await fetch("/api/shelter/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.message || "Failed to load dashboard statistics."
          );
        }

        setStats(data);
      } catch (error) {
        console.error("Dashboard stats error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-red-600">
          Unable to Load Dashboard
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          {error}
        </p>

        <Link
          to="/login"
          className="mt-5 inline-block rounded-lg bg-primary px-5 py-2 text-white transition hover:opacity-90"
        >
          Login Again
        </Link>
      </div>
    );
  }

  const animals = stats?.animals || {};
  const applications = stats?.applications || {};

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-dark">
        Welcome, {user?.name}
      </h1>

      <p className="mt-1 text-sm text-gray-600">
        An overview of your animal listings and adoption applications.
      </p>

      {/* Statistics Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<PawPrint className="h-5 w-5 text-blue-600" />}
          label="Total Listings"
          value={animals.total ?? 0}
          sub={`${animals.available ?? 0} available`}
        />

        <StatCard
          icon={<Clock className="h-5 w-5 text-yellow-600" />}
          label="Pending Review"
          value={animals.pending ?? 0}
          sub="Awaiting review"
        />

        <StatCard
          icon={<HeartHandshake className="h-5 w-5 text-green-600" />}
          label="Adopted"
          value={animals.adopted ?? 0}
          sub="Successfully placed"
        />

        <StatCard
          icon={<FileText className="h-5 w-5 text-orange-600" />}
          label="New Applications"
          value={applications.pending ?? 0}
          sub={`${applications.total ?? 0} total applications`}
        />
      </div>

      {/* Dashboard Links */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">

        <Link
          to="/my-animals"
          className="rounded-lg border p-5 shadow-sm transition hover:shadow-md"
        >
          <h3 className="font-semibold text-dark">
            My Animal Listings
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Add new animals or view and delete your existing listings.
          </p>
        </Link>

        <Link
          to="/shelter-applications"
          className="rounded-lg border p-5 shadow-sm transition hover:shadow-md"
        >
          <h3 className="font-semibold text-dark">
            Adoption Applications
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Review incoming adoption applications and approve or reject them.
          </p>
        </Link>

        <Link
          to="/reports"
          className="rounded-lg border p-5 shadow-sm transition hover:shadow-md"
        >
          <h3 className="font-semibold text-dark">
            Rescue Reports
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            View stray and injured animal reports and update their statuses.
          </p>
        </Link>

        <Link
          to="/report-map"
          className="rounded-lg border p-5 shadow-sm transition hover:shadow-md"
        >
          <h3 className="font-semibold text-dark">
            Rescue Report Map
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            View reports on the map - red indicates urgent cases, while green indicates rescued animals.
          </p>
        </Link>

        {/* Contact & Location */}
        <Link
          to="/profile"
          className="rounded-lg border p-5 shadow-sm transition hover:shadow-md"
        >
          <h3 className="font-semibold text-dark">
            Contact & Location
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Set your phone number and location so your name appears in Emergency SOS.
          </p>
        </Link>

      </div>
    </section>
  );
}

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-gray-500">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>

      <p className="mt-2 text-2xl font-bold text-dark">
        {value}
      </p>

      <p className="mt-0.5 text-xs text-gray-400">
        {sub}
      </p>
    </div>
  );
}
