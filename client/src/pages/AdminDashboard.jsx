
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Trash2,
  BadgeCheck,
  Search,
  PawPrint,
  ArrowUpRight,
  CheckCircle2,
  RefreshCw,
  UserRound,
  Heart,
  XCircle,
  LayoutDashboard,
  ChevronRight,
  Mail,
} from "lucide-react";

import { useAuth } from "../context/AuthContext.jsx";
import { API_URL } from "../api.js";

// Color Palette
const COLORS = {
  burgundy: "#7F1D1D",
  red: "#DC2626",
  orange: "#F97316",
  softOrange: "#FDBA74",
  cream: "#FFE4C7",
  background: "#FFF7ED",
};

// Role Colors
const ROLE_COLORS = {
  adopter: "bg-orange-50 text-orange-700 ring-orange-200",
  shelter: "bg-[#FFE4C7] text-[#9A3412] ring-[#FDBA74]",
  admin: "bg-[#7F1D1D]/10 text-[#7F1D1D] ring-[#7F1D1D]/20",
};

export default function AdminDashboard() {
  const { token, user: currentUser } = useAuth();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Authentication Headers
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // Fetch Dashboard Data
  const fetchData = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      setError("");

      const [statsRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/stats`, {
          headers: authHeaders,
        }),

        fetch(`${API_URL}/api/admin/users`, {
          headers: authHeaders,
        }),
      ]);

      if (!statsRes.ok || !usersRes.ok) {
        throw new Error("Failed to load dashboard data.");
      }

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();

      setStats(statsData);

      setUsers(
        Array.isArray(usersData)
          ? usersData
          : Array.isArray(usersData.users)
          ? usersData.users
          : []
      );
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Search and Filter Users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase());

      const matchesRole =
        roleFilter === "all" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  // Verify Shelter
  const handleVerify = async (id) => {
    try {
      setActionLoadingId(id);

      const res = await fetch(
        `${API_URL}/api/admin/users/${id}/verify`,
        {
          method: "PATCH",
          headers: authHeaders,
        }
      );

      if (!res.ok) {
        throw new Error("Shelter verification failed.");
      }

      await fetchData(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Change User Role
  const handleRoleChange = async (id, role) => {
    try {
      setActionLoadingId(id);

      const res = await fetch(
        `${API_URL}/api/admin/users/${id}/role`,
        {
          method: "PATCH",
          headers: authHeaders,
          body: JSON.stringify({ role }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update user role.");
      }

      await fetchData(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete User
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(id);

      const res = await fetch(
        `${API_URL}/api/admin/users/${id}`,
        {
          method: "DELETE",
          headers: authHeaders,
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete user.");
      }

      await fetchData(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-[#FFF7ED]">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFE4C7]">
          <Loader2 className="h-8 w-8 animate-spin text-[#DC2626]" />
        </div>

        <p className="text-sm font-semibold text-[#7F1D1D]">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  // Error Screen
  if (error || !stats) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#FFF7ED] px-4 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
          <XCircle className="h-9 w-9 text-[#DC2626]" />
        </div>

        <h2 className="text-xl font-bold text-[#7F1D1D]">
          Unable to load dashboard
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          {error || "Dashboard data is unavailable."}
        </p>

        <button
          onClick={() => fetchData()}
          className="mt-6 flex items-center gap-2 rounded-xl bg-[#DC2626] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#7F1D1D]"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  // Statistics Data
  const statCards = [
    {
      label: "Total Users",
      value: stats.users?.total ?? 0,
      sub: `${stats.users?.adopters ?? 0} adopters · ${stats.users?.shelters ?? 0} shelters`,
      icon: Users,
      iconBg: "bg-orange-50",
      iconColor: "text-[#F97316]",
      border: "border-orange-100",
    },
    {
      label: "Unverified Shelters",
      value: stats.unverifiedShelters ?? 0,
      sub: "Awaiting verification",
      icon: ShieldCheck,
      iconBg: "bg-red-50",
      iconColor: "text-[#DC2626]",
      border: "border-red-100",
    },
    {
      label: "Pending Reports",
      value: stats.reports?.pending ?? 0,
      sub: `${stats.reports?.total ?? 0} total reports`,
      icon: AlertTriangle,
      iconBg: "bg-orange-50",
      iconColor: "text-[#F97316]",
      border: "border-orange-100",
    },
    {
      label: "Animals Rescued",
      value: stats.reports?.rescued ?? 0,
      sub: `${stats.reports?.inProgress ?? 0} in progress`,
      icon: Heart,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      border: "border-green-100",
    },
  ];

  const currentUserId = String(
    currentUser?.id || currentUser?._id || ""
  );

  return (
    <section className="min-h-screen bg-[#FFF7ED] px-4 py-8 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-400">
          <LayoutDashboard size={16} />

          <span>Dashboard</span>

          <ChevronRight size={15} />

          <span className="font-semibold text-[#DC2626]">
            Admin Panel
          </span>
        </div>

        {/* ================= WELCOME BANNER ================= */}

        <div className="relative mb-9 overflow-hidden rounded-[28px] bg-gradient-to-r from-[#7F1D1D] via-[#DC2626] to-[#F97316] p-7 text-white shadow-xl shadow-orange-200/50 sm:p-10">

          <div className="relative z-10 max-w-2xl">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-xs font-bold tracking-wider backdrop-blur-md">
              <ShieldCheck size={16} />
              ADMIN CONTROL CENTER
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Welcome back,
              <br />

              <span className="text-[#FFE4C7]">
                {currentUser?.name || "Admin"}!
              </span>
            </h1>

            <p className="mt-4 max-w-lg text-sm leading-7 text-white/90 sm:text-base">
              Manage your platform, monitor rescue activities,
              verify shelters and help animals find their
              forever homes.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">

              <Link
                to="/reports"
                className="inline-flex items-center gap-2 rounded-xl bg-[#FFF7ED] px-5 py-3 text-sm font-bold text-[#7F1D1D] shadow-md transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl"
              >
                <PawPrint size={17} />
                View Rescue Reports
                <ArrowUpRight size={16} />
              </Link>

              <button
                onClick={() => fetchData()}
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                <RefreshCw size={16} />
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

        <div className="mb-8">

          <div className="mb-5">
            <h2 className="text-2xl font-extrabold text-[#7F1D1D]">
              Dashboard Overview
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Monitor your platform's performance and activities.
            </p>
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

        {/* ================= USER MANAGEMENT ================= */}

        <div className="mt-10">

          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

            <div>
              <h2 className="text-2xl font-extrabold text-[#7F1D1D]">
                User Management
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Manage users, permissions and shelter verification.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-[#FFE4C7] bg-white px-4 py-2">
              <Users size={16} className="text-[#F97316]" />

              <span className="text-sm font-bold text-[#7F1D1D]">
                {filteredUsers.length} Users
              </span>
            </div>

          </div>

          {/* SEARCH & FILTER */}

          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#FFE4C7] bg-white p-4 shadow-sm sm:flex-row">

            <div className="relative flex-1">

              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F97316]"
              />

              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-[#FFE4C7] bg-[#FFF7ED] py-3 pl-11 pr-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#F97316] focus:bg-white focus:ring-4 focus:ring-orange-100"
              />

            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-[#FFE4C7] bg-[#FFF7ED] px-5 py-3 text-sm font-semibold text-[#7F1D1D] outline-none transition focus:border-[#F97316]"
            >
              <option value="all">All Roles</option>
              <option value="adopter">Adopters</option>
              <option value="shelter">Shelters</option>
              <option value="admin">Admins</option>
            </select>

          </div>

          {/* ================= USERS TABLE ================= */}

          <div className="overflow-hidden rounded-2xl border border-[#FFE4C7] bg-white shadow-sm">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px] text-left">

                <thead className="bg-[#FFF7ED]">

                  <tr className="border-b border-[#FFE4C7] text-xs font-bold uppercase tracking-wider text-[#7F1D1D]">

                    <th className="px-6 py-5">
                      User Information
                    </th>

                    <th className="px-6 py-5">
                      Role
                    </th>

                    <th className="px-6 py-5">
                      Verification
                    </th>

                    <th className="px-6 py-5">
                      Account
                    </th>

                    <th className="px-6 py-5 text-center">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-[#FFE4C7]/70">

                  {filteredUsers.length === 0 ? (

                    <tr>
                      <td colSpan="5" className="py-16 text-center">

                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF7ED]">
                          <Search
                            size={25}
                            className="text-[#F97316]"
                          />
                        </div>

                        <h3 className="mt-4 font-bold text-[#7F1D1D]">
                          No users found
                        </h3>

                        <p className="mt-1 text-sm text-gray-400">
                          Try changing your search or filter.
                        </p>

                      </td>
                    </tr>

                  ) : (

                    filteredUsers.map((u) => {

                      const isCurrentUser =
                        String(u._id) === currentUserId;

                      const isBusy =
                        actionLoadingId === u._id;

                      return (

                        <tr
                          key={u._id}
                          className="transition duration-200 hover:bg-[#FFF7ED]/70"
                        >

                          {/* USER INFORMATION */}

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-3">

                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FFE4C7] to-[#FDBA74] text-[#7F1D1D]">
                                <UserRound size={22} />
                              </div>

                              <div>

                                <p className="font-bold text-gray-800">
                                  {u.name || "Unnamed User"}

                                  {isCurrentUser && (
                                    <span className="ml-2 rounded-full bg-[#FFE4C7] px-2 py-0.5 text-[9px] font-bold text-[#7F1D1D]">
                                      YOU
                                    </span>
                                  )}
                                </p>

                                <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                                  <Mail size={12} />
                                  {u.email}
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* USER ROLE */}

                          <td className="px-6 py-5">

                            <select
                              value={u.role}
                              disabled={isBusy || isCurrentUser}
                              onChange={(e) =>
                                handleRoleChange(
                                  u._id,
                                  e.target.value
                                )
                              }
                              className={`rounded-full px-3 py-2 text-xs font-bold ring-1 ring-inset outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${ROLE_COLORS[u.role] || "bg-gray-100 text-gray-600"}`}
                            >

                              <option value="adopter">
                                Adopter
                              </option>

                              <option value="shelter">
                                Shelter
                              </option>

                              <option value="admin">
                                Admin
                              </option>

                            </select>

                          </td>

                          {/* SHELTER VERIFICATION */}

                          <td className="px-6 py-5">

                            {u.role === "shelter" ? (

                              u.isVerified ? (

                                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-2 text-xs font-bold text-green-700">
                                  <CheckCircle2 size={14} />
                                  Verified
                                </span>

                              ) : (

                                <button
                                  onClick={() => handleVerify(u._id)}
                                  disabled={isBusy}
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#FFE4C7] px-3 py-2 text-xs font-bold text-[#9A3412] transition hover:bg-[#FDBA74] disabled:opacity-50"
                                >

                                  {isBusy ? (
                                    <Loader2
                                      size={14}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <ShieldCheck size={14} />
                                  )}

                                  Verify Shelter

                                </button>

                              )

                            ) : (

                              <span className="text-xs text-gray-400">
                                Not Applicable
                              </span>

                            )}

                          </td>

                          {/* ACCOUNT STATUS */}

                          <td className="px-6 py-5">

                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600">
                              <span className="h-2 w-2 rounded-full bg-green-500" />
                              Active
                            </span>

                          </td>

                          {/* ACTIONS */}

                          <td className="px-6 py-5">

                            <div className="flex items-center justify-center">

                              <button
                                onClick={() => handleDelete(u._id)}
                                disabled={isBusy || isCurrentUser}
                                title={
                                  isCurrentUser
                                    ? "You cannot delete your own account"
                                    : "Delete user"
                                }
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#DC2626] transition hover:bg-[#DC2626] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                              >

                                {isBusy ? (
                                  <Loader2
                                    size={18}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Trash2 size={18} />
                                )}

                              </button>

                            </div>

                          </td>

                        </tr>

                      );

                    })

                  )}

                </tbody>

              </table>

            </div>

            {/* TABLE FOOTER */}

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#FFE4C7] bg-[#FFF7ED] px-6 py-4">

              <p className="text-xs font-medium text-gray-500">
                Showing {filteredUsers.length} of {users.length} users
              </p>

              <p className="flex items-center gap-1.5 text-xs font-bold text-[#7F1D1D]">
                <PawPrint size={14} />
                FurEver Home Admin Panel
              </p>

            </div>

          </div>

        </div>

        {/* ================= BOTTOM BANNER ================= */}

        <div className="mt-9 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#FFE4C7] bg-gradient-to-r from-[#FFF7ED] to-[#FFE4C7] p-6 sm:flex-row">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#DC2626] shadow-sm">
              <PawPrint size={25} />
            </div>

            <div>

              <h3 className="font-extrabold text-[#7F1D1D]">
                Every Paw Deserves a Home!
              </h3>

              <p className="mt-1 text-xs leading-5 text-gray-600">
                Thank you for helping animals find loving families.
              </p>

            </div>

          </div>

          <Link
            to="/reports"
            className="inline-flex items-center gap-2 rounded-xl bg-[#DC2626] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#7F1D1D] hover:shadow-lg"
          >
            Manage Reports
            <ArrowUpRight size={17} />
          </Link>

        </div>

        {/* FOOTER */}

        

      </div>

    </section>
  );
}
