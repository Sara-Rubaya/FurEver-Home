
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaPaw, FaBars, FaTimes } from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/animals", label: "Browse Animals" },
    { to: "/report", label: "Report Animal" },
    { to: "/vets", label: "Vet Near Me" },
  ];

  // Role-based navigation links
  const roleLinks = [...navLinks];

  if (
    isAuthenticated &&
    user &&
    (user.role === "shelter" || user.role === "admin")
  ) {
    roleLinks.push({ to: "/dashboard", label: "Dashboard" });
    roleLinks.push({ to: "/report-map", label: "Report Map" });
  }

  // Active navigation link styling
  const linkClass = ({ isActive }) =>
    isActive
      ? "font-semibold text-[#DC2626]"
      : "text-[#7F1D1D]/80 transition-colors duration-200 hover:text-[#F97316]";

  return (
    <header className="sticky top-0 z-50 border-b border-[#FDBA74]/50 bg-[#FFF7ED]/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-bold text-[#7F1D1D]"
        >
          <FaPaw className="text-2xl text-[#F97316]" />
          <span>FurEver Home</span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {roleLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={linkClass}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop auth buttons */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#FDBA74]/60 bg-[#FFE4C7] px-4 py-2 text-sm font-medium text-[#7F1D1D]">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#DC2626] text-sm font-bold text-white">
                  {user.name?.charAt(0).toUpperCase()}
                </span>

                <span>
                  Hi, <span className="font-semibold">{user.name}</span>
                </span>
              </span>

              <button
                onClick={handleLogout}
                className="rounded-lg bg-[#7F1D1D] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#DC2626] hover:shadow-md"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[#7F1D1D] transition-colors hover:text-[#F97316]"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-lg bg-[#DC2626] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#7F1D1D] hover:shadow-md"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="text-2xl text-[#7F1D1D] transition-colors hover:text-[#F97316] md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="flex flex-col gap-4 border-t border-[#FDBA74]/50 bg-[#FFF7ED] px-5 py-5 shadow-lg md:hidden">

          {roleLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={linkClass}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}

          <hr className="border-[#FDBA74]/60" />

          {isAuthenticated ? (
            <>
              <div className="rounded-lg bg-[#FFE4C7] px-4 py-3 text-sm font-medium text-[#7F1D1D]">
                Hi, {user.name}
              </div>

              <button
                onClick={handleLogout}
                className="rounded-lg bg-[#7F1D1D] px-4 py-2.5 text-left font-semibold text-white transition-colors hover:bg-[#DC2626]"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="font-medium text-[#7F1D1D] transition-colors hover:text-[#F97316]"
              >
                Login
              </Link>

              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg bg-[#DC2626] px-4 py-2.5 text-center font-semibold text-white transition-colors hover:bg-[#7F1D1D]"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
