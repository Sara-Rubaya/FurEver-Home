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

  const linkClass = ({ isActive }) =>
    isActive
      ? "text-primary font-semibold"
      : "text-gray-700 hover:text-primary transition-colors";

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/animals", label: "Browse Animals" },
    { to: "/report", label: "Report Animal" },
    { to: "/donate", label: "Donate" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-dark">
          <FaPaw className="text-primary" />
          FurEver Home
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
          {isAuthenticated && (user.role === "shelter" || user.role === "admin") && (
            <NavLink to="/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
          )}
          
        </nav>

        {/* Desktop auth buttons */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-50 to-purple-50 px-4 py-2 text-sm font-medium text-violet-700 shadow-sm ring-1 ring-violet-100">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
                <span>
                  Hi, <span className="font-semibold text-gray-900">{user.name}</span>
                </span>
              </span>
              <button
                onClick={handleLogout}
                className="rounded-md bg-primary px-4 py-2 text-center text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="text-2xl text-dark md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="flex flex-col gap-4 border-t px-4 py-4 md:hidden">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={linkClass}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          {isAuthenticated && (user.role === "shelter" || user.role === "admin") && (
            <NavLink to="/dashboard" className={linkClass} onClick={() => setMenuOpen(false)}>
              Dashboard
            </NavLink>
          )}
          
          <hr />
          {isAuthenticated ? (
            <button onClick={handleLogout} className="text-left text-gray-700">
              Logout ({user.name})
            </button>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="text-gray-700">
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="rounded-md bg-primary px-4 py-2 text-center text-white"
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