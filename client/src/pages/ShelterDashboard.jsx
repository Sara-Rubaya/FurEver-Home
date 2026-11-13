
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  PawPrint,
  Clock,
  HeartHandshake,
  FileText,
  Loader2,
  ShieldCheck,
  ArrowUpRight,
  RefreshCw,
  LayoutDashboard,
  ChevronRight,
  MapPin,
  UserRound,
  CheckCircle2,
  XCircle,
  Heart,
  Plus,
  ClipboardList,
} from "lucide-react";

import { useAuth } from "../context/AuthContext.jsx";
import { API_URL } from "../api.js";

export default function ShelterDashboard() {
  const { token, user } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Fetch Shelter Statistics
  const fetchStats = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      if (!token) {
        throw new Error(
          "Authentication required. Please log in again."
        );
      }

      const res = await fetch(
        `${API_URL}/api/shelter/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to load dashboard statistics."
        );
      }

      setStats(data);
    } catch (err) {
      console.error("Dashboard stats error:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Loading Screen
  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-[#FFF7ED]">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFE4C7]">
          <Loader2 className="h-8 w-8 animate-spin text-[#DC2626]" />
        </div>

        <p className="text-sm font-semibold text-[#7F1D1D]">
          Loading your shelter dashboard...
        </p>
      </div>
    );
  }

  // Error Screen
  if (error) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#FFF7ED] px-4 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
          <XCircle className="h-9 w-9 text-[#DC2626]" />
        </div>

        <h2 className="text-xl font-extrabold text-[#7F1D1D]">
          Unable to Load Dashboard
        </h2>

        <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
          {error}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => fetchStats()}
            className="flex items-center gap-2 rounded-xl bg-[#DC2626] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#7F1D1D]"
          >
            <RefreshCw size={16} />
            Try Again
          </button>

          <Link
            to="/login"
            className="rounded-xl border border-[#FFE4C7] bg-white px-5 py-3 text-sm font-bold text-[#7F1D1D] transition hover:bg-[#FFE4C7]"
          >
            Login Again
          </Link>
        </div>
      </div>
    );
  }

  const animals = stats?.animals || {};
  const applications = stats?.applications || {};

  // Statistics Cards
  const statCards = [
    {
      label: "Total Listings",
      value: animals.total ?? 0,
      sub: `${animals.available ?? 0} available`,
      icon: PawPrint,
      iconBg: "bg-orange-50",
      iconColor: "text-[#F97316]",
      border: "border-orange-100",
    },
    {
      label: "Pending Review",
      value: animals.pending ?? 0,
      sub: "Awaiting review",
      icon: Clock,
      iconBg: "bg-red-50",
      iconColor: "text-[#DC2626]",
      border: "border-red-100",
    },
    {
      label: "Successfully Adopted",
      value: animals.adopted ?? 0,
      sub: "Animals found loving homes",
      icon: HeartHandshake,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      border: "border-green-100",
    },
    {
      label: "New Applications",
      value: applications.pending ?? 0,
      sub: `${applications.total ?? 0} total applications`,
      icon: FileText,
      iconBg: "bg-orange-50",
      iconColor: "text-[#F97316]",
      border: "border-orange-100",
    },
  ];

  // Dashboard Navigation Cards
  const dashboardLinks = [
    {
      title: "My Animal Listings",
      description:
        "Add new animals, manage existing listings and keep your animal profiles updated.",
      path: "/my-animals",
      icon: PawPrint,
      iconBg: "bg-orange-50",
      iconColor: "text-[#F97316]",
      tag: "Manage Animals",
    },
    {
      title: "Adoption Applications",
      description:
        "Review incoming adoption requests and approve or reject applications.",
      path: "/shelter-applications",
      icon: ClipboardList,
      iconBg: "bg-red-50",
      iconColor: "text-[#DC2626]",
      tag: "Review Requests",
    },
    {
      title: "Rescue Reports",
      description:
        "View stray and injured animal reports and update their rescue statuses.",
      path: "/reports",
      icon: HeartHandshake,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      tag: "View Reports",
    },
    {
      title: "Rescue Report Map",
      description:
        "Explore animal rescue locations. Identify urgent cases and rescued animals.",
      path: "/report-map",
      icon: MapPin,
      iconBg: "bg-orange-50",
      iconColor: "text-[#F97316]",
      tag: "Explore Map",
    },
    {
      title: "Contact & Location",
      description:
        "Update your phone number and location to appear in Emergency SOS.",
      path: "/profile",
      icon: UserRound,
      iconBg: "bg-red-50",
      iconColor: "text-[#DC2626]",
      tag: "Edit Profile",
    },
  ];

  return (
    <section className="min-h-screen bg-[#FFF7ED] px-4 py-8 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* ================= BREADCRUMB ================= */}

        <div className="mb-6 flex items-center gap-2 text-sm text-gray-400">
          <LayoutDashboard size={16} />

          <span>Dashboard</span>

          <ChevronRight size={15} />

          <span className="font-semibold text-[#DC2626]">
            Shelter Panel
          </span>
        </div>

        {/* ================= WELCOME BANNER ================= */}

        <div className="relative mb-9 overflow-hidden rounded-[28px] bg-gradient-to-r from-[#7F1D1D] via-[#DC2626] to-[#F97316] p-7 text-white shadow-xl shadow-orange-200/50 sm:p-10">

          <div className="relative z-10 max-w-2xl">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-xs font-bold tracking-wider backdrop-blur-md">
              <ShieldCheck size={16} />
              SHELTER CONTROL CENTER
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Welcome back,
              <br />

              <span className="text-[#FFE4C7]">
                {user?.name || "Shelter"}!
              </span>
            </h1>

            <p className="mt-4 max-w-lg text-sm leading-7 text-white/90 sm:text-base">
              Manage your animal listings, review adoption
              applications and make a difference in the lives
              of animals waiting for a loving home.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">

              <Link
                to="/my-animals"
                className="inline-flex items-center gap-2 rounded-xl bg-[#FFF7ED] px-5 py-3 text-sm font-bold text-[#7F1D1D] shadow-md transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl"
              >
                <Plus size={18} />
                Manage Animals
                <ArrowUpRight size={16} />
              </Link>

              <button
                onClick={() => fetchStats(false)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20 disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh Data
              </button>

            </div>

          </div>

          {/* Decorative Shapes */}

          <div className="absolute -right-16 -top-20 hidden h-80 w-80 items-center justify-center rounded-full bg-white/10 lg:flex">
            <div className="flex h-56 w-56 items-center justify-center rounded-full bg-white/10">
              <PawPrint
                size={120}
                className="text-white/80"
              />
            </div>
          </div>

          <div className="absolute -bottom-20 right-52 h-52 w-52 rounded-full bg-white/10" />

          <div className="absolute bottom-10 right-20 hidden rotate-12 text-white/20 lg:block">
            <Heart size={75} />
          </div>

        </div>

        {/* ================= STATISTICS ================= */}

        <div className="mb-10">

          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

            <div>
              <h2 className="text-2xl font-extrabold text-[#7F1D1D]">
                Shelter Overview
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Track your animal listings and adoption activities.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#FFE4C7] bg-white px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />

              <span className="text-xs font-bold text-[#7F1D1D]">
                Dashboard Active
              </span>
            </div>

          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

            {statCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.label}
                  className={`group rounded-2xl border ${card.border} bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
                >

                  <div className="flex items-center justify-between">

                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg}`}>
                      <Icon
                        size={24}
                        className={card.iconColor}
                      />
                    </div>

                    <ArrowUpRight
                      size={20}
                      className="text-gray-300 transition group-hover:text-[#DC2626]"
                    />

                  </div>

                  <p className="mt-5 text-sm font-semibold text-gray-500">
                    {card.label}
                  </p>

                  <h3 className="mt-1 text-3xl font-extrabold tracking-tight text-[#7F1D1D]">
                    {card.value}
                  </h3>

                  <p className="mt-2 text-xs font-medium text-gray-400">
                    {card.sub}
                  </p>

                </div>
              );
            })}

          </div>
        </div>

        {/* ================= QUICK ACTIONS ================= */}

        <div className="mb-5">

          <h2 className="text-2xl font-extrabold text-[#7F1D1D]">
            Manage Your Shelter
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Everything you need to manage your shelter in one place.
          </p>

        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {dashboardLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                to={item.path}
                key={item.title}
                className="group relative overflow-hidden rounded-2xl border border-[#FFE4C7] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#FDBA74] hover:shadow-xl"
              >

                {/* Top Decoration */}

                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#FFF7ED] transition duration-300 group-hover:scale-150" />

                <div className="relative z-10">

                  <div className="flex items-center justify-between">

                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.iconBg} transition duration-300 group-hover:scale-110`}>
                      <Icon
                        size={27}
                        className={item.iconColor}
                      />
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF7ED] text-[#DC2626] transition duration-300 group-hover:bg-[#DC2626] group-hover:text-white">
                      <ArrowUpRight size={19} />
                    </div>

                  </div>

                  <h3 className="mt-6 text-lg font-extrabold text-[#7F1D1D] transition group-hover:text-[#DC2626]">
                    {item.title}
                  </h3>

                  <p className="mt-2 min-h-[60px] text-sm leading-6 text-gray-500">
                    {item.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-[#FFE4C7] pt-4">

                    <span className="text-xs font-bold text-[#DC2626]">
                      {item.tag}
                    </span>

                    <ChevronRight
                      size={17}
                      className="text-[#F97316] transition group-hover:translate-x-1"
                    />

                  </div>

                </div>

              </Link>
            );
          })}

        </div>

        {/* ================= BOTTOM BANNER ================= */}

        <div className="mt-9 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#FFE4C7] bg-gradient-to-r from-[#FFF7ED] to-[#FFE4C7] p-6 sm:flex-row">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#DC2626] shadow-sm">
              <HeartHandshake size={26} />
            </div>

            <div>

              <h3 className="font-extrabold text-[#7F1D1D]">
                Every Animal Deserves Love!
              </h3>

              <p className="mt-1 text-xs leading-5 text-gray-600">
                Your care can give every animal a second chance at life.
              </p>

            </div>

          </div>

          <Link
            to="/shelter-applications"
            className="inline-flex items-center gap-2 rounded-xl bg-[#DC2626] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#7F1D1D] hover:shadow-lg"
          >
            View Applications
            <ArrowUpRight size={17} />
          </Link>

        </div>

        {/* ================= FOOTER ================= */}

        

      </div>

    </section>
  );
}
