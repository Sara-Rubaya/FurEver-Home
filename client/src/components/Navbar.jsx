
import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FaPaw,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaMapMarkerAlt,
  FaStethoscope,
  FaHeart,
  FaSignOutAlt,
  FaHeartbeat,
  FaTachometerAlt,
  FaMap,
  FaDonate,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";

const pill = ({ isActive }) =>
  `whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
    isActive
      ? "bg-gradient-to-r from-[#DC2626] to-[#F97316] text-white shadow-md shadow-orange-300/60"
      : "text-[#7F1D1D] hover:bg-[#FFEDD5] hover:text-[#EA580C]"
  }`;

function Dropdown({ name, label, links, active, toggle, close }) {
  const open = active === name;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => toggle(name)}
        aria-expanded={open}
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
          open
            ? "bg-[#FEE2E2] text-[#DC2626]"
            : "text-[#7F1D1D] hover:bg-[#FFEDD5] hover:text-[#EA580C]"
        }`}
      >
        {label}
        <FaChevronDown
          className={`text-xs transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`absolute right-0 top-full z-50 mt-4 w-72 origin-top-right rounded-2xl border border-[#FED7AA] bg-white/95 p-2 shadow-2xl shadow-orange-900/10 backdrop-blur-xl transition-all duration-200 ${
          open
            ? "visible translate-y-0 scale-100 opacity-100"
            : "invisible -translate-y-2 scale-95 opacity-0"
        }`}
      >
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            onClick={close}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl p-3 transition-colors ${
                isActive ? "bg-[#FEE2E2]" : "hover:bg-[#FFF7ED]"
              }`
            }
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFEDD5] to-[#FED7AA] text-[#EA580C] transition-transform group-hover:scale-110">
              {l.icon}
            </span>

            <span>
              <span className="block text-sm font-semibold text-[#7F1D1D]">
                {l.label}
              </span>
              <span className="block text-xs text-[#9A3412]/70">
                {l.desc}
              </span>
            </span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}

function MobileGroup({ name, label, links, active, toggle, close }) {
  const open = active === name;

  return (
    <>
      <button
        type="button"
        onClick={() => toggle(name)}
        className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-[#7F1D1D] hover:bg-[#FFEDD5]"
      >
        {label}
        <FaChevronDown
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="ml-4 flex flex-col gap-1 border-l-2 border-[#FDBA74] pl-3">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={close}
              className={pill}
            >
              <span className="flex items-center gap-2">
                {l.icon}
                {l.label}
              </span>
            </NavLink>
          ))}
        </div>
      )}
    </>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  const ref = useRef(null);

  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  // Scroll and outside-click handling
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);

    const onClick = (e) => {
      if (!ref.current?.contains(e.target)) {
        setActive(null);
      }
    };

    window.addEventListener("scroll", onScroll);
    document.addEventListener("mousedown", onClick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  const close = () => {
    setActive(null);
    setMenuOpen(false);
  };

  const toggle = (name) => {
    setActive((prev) => (prev === name ? null : name));
  };

  const handleLogout = () => {
    logout();
    close();
    navigate("/");
  };

  // Main navigation
  const mainLinks = [
    { to: "/", label: "Home" },
    { to: "/animals", label: "Browse Animals" },
    { to: "/report", label: "Report Animal" },
    { to: "/donate", label: "Donate" },
  ];

  // Vet services
  const vetLinks = [
    {
      to: "/vets",
      label: "Vet Near Me",
      desc: "Find nearby clinics on map",
      icon: <FaMapMarkerAlt />,
    },
    {
      to: "/vet-directory",
      label: "Vet Directory",
      desc: "Browse all trusted vets",
      icon: <FaStethoscope />,
    },
  ];

  // User account links
  const accountLinks = isAuthenticated
    ? [
        {
          to: "/health-passports",
          label: "Health Passports",
          desc: "Vaccination & health records",
          icon: <FaHeartbeat />,
        },
        {
          to: "/my-donations",
          label: "My Donations",
          desc: "Your giving history",
          icon: <FaHeart />,
        },
      ]
    : [];

  // Shelter and Admin management links
  const managementLinks =
    isAuthenticated &&
    (user?.role === "shelter" || user?.role === "admin")
      ? [
          {
            to: "/dashboard",
            label: "Dashboard",
            desc: "Overview & analytics",
            icon: <FaTachometerAlt />,
          },
          {
            to: "/report-map",
            label: "Report Map",
            desc: "Live animal reports",
            icon: <FaMap />,
          },
          {
            to: "/shelter-donations",
            label: "Shelter Donations",
            desc: "Track received funds",
            icon: <FaDonate />,
          },
        ]
      : [];

  const dd = { active, toggle, close };

  return (
    <header
      ref={ref}
      className="sticky top-0 z-50 px-3 pt-3 lg:px-6"
    >
      <div
        className={`mx-auto max-w-[1400px] rounded-2xl border border-white/60 bg-[#FFF7ED]/75 backdrop-blur-xl transition-all duration-300 ${
          scrolled
            ? "shadow-xl shadow-orange-900/15"
            : "shadow-md shadow-orange-900/5"
        }`}
      >
        <div className="flex items-center justify-between gap-4 px-4 py-2.5 lg:px-6">

          {/* Logo */}
          <Link
            to="/"
            onClick={close}
            className="group flex shrink-0 items-center gap-3"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#F97316] to-[#DC2626] text-xl text-white shadow-lg shadow-orange-400/40 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110">
              <FaPaw />
            </span>

            <span className="leading-tight">
              <span className="block text-xl font-extrabold tracking-tight text-[#7F1D1D]">
                Fur<span className="text-[#F97316]">Ever</span> Home
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-[#9A3412]/70">
                Adopt · Rescue · Care
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 xl:flex">
            {mainLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={pill}
              >
                {l.label}
              </NavLink>
            ))}

            <Dropdown
              name="vet"
              label="Vet Services"
              links={vetLinks}
              {...dd}
            />

            {isAuthenticated && (
              <Dropdown
                name="account"
                label="My Space"
                links={accountLinks}
                {...dd}
              />
            )}

            {managementLinks.length > 0 && (
              <Dropdown
                name="management"
                label="Management"
                links={managementLinks}
                {...dd}
              />
            )}
          </nav>

          {/* Desktop Authentication */}
          <div className="hidden shrink-0 items-center gap-3 xl:flex">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2.5 rounded-full border border-[#FDBA74]/60 bg-white/70 py-1.5 pl-1.5 pr-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#DC2626] to-[#F97316] font-bold text-white ring-2 ring-white">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </span>

                  <span className="leading-tight">
                    <span className="block max-w-[100px] truncate text-sm font-semibold text-[#7F1D1D]">
                      {user?.name}
                    </span>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[#EA580C]">
                      {user?.role}
                    </span>
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-full bg-[#7F1D1D] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#DC2626] hover:shadow-lg hover:shadow-red-300/50"
                >
                  <FaSignOutAlt />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-full px-5 py-2.5 text-sm font-semibold text-[#7F1D1D] transition hover:bg-[#FFEDD5]"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="rounded-full bg-gradient-to-r from-[#DC2626] to-[#F97316] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-300/60 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="rounded-xl p-2.5 text-xl text-[#7F1D1D] transition hover:bg-[#FFEDD5] xl:hidden"
            onClick={() => {
              setMenuOpen((prev) => !prev);
              setActive(null);
            }}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="max-h-[75vh] overflow-y-auto border-t border-[#FDBA74]/40 px-4 py-4 xl:hidden">
            <nav className="flex flex-col gap-1">
              {mainLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={close}
                  className={pill}
                >
                  {l.label}
                </NavLink>
              ))}

              <hr className="my-2 border-[#FDBA74]/40" />

              <MobileGroup
                name="m-vet"
                label="Vet Services"
                links={vetLinks}
                {...dd}
              />

              {isAuthenticated && (
                <MobileGroup
                  name="m-acc"
                  label="My Space"
                  links={accountLinks}
                  {...dd}
                />
              )}

              {managementLinks.length > 0 && (
                <MobileGroup
                  name="m-mgmt"
                  label="Management"
                  links={managementLinks}
                  {...dd}
                />
              )}
            </nav>

            <hr className="my-4 border-[#FDBA74]/40" />

            {/* Mobile Authentication */}
            {isAuthenticated ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 rounded-xl bg-white/70 p-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#DC2626] to-[#F97316] font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </span>

                  <div className="text-sm font-semibold text-[#7F1D1D]">
                    <p>Hi, {user?.name}</p>
                    <p className="text-xs capitalize text-[#9A3412]">
                      {user?.role}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#7F1D1D] px-4 py-3 font-semibold text-white transition hover:bg-[#DC2626]"
                >
                  <FaSignOutAlt />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  to="/login"
                  onClick={close}
                  className="rounded-xl border border-[#FDBA74] px-4 py-3 text-center font-semibold text-[#7F1D1D] hover:bg-[#FFEDD5]"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={close}
                  className="rounded-xl bg-gradient-to-r from-[#DC2626] to-[#F97316] px-4 py-3 text-center font-semibold text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
