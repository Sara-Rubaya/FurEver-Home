import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { DotLottiePlayer } from "@dotlottie/react-player";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Backend URL
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("adopter");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const passwordChecks = {
    length: password.length >= 6,
    number: /\d/.test(password),
    letter: /[a-zA-Z]/.test(password),
  };

  const validate = () => {
    const next = {};

    if (!name.trim()) {
      next.name = "Full name is required.";
    }

    if (!email.trim()) {
      next.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(email)) {
      next.email = "Enter a valid email address.";
    }

    if (!password) {
      next.password = "Password is required.";
    } else if (
      !passwordChecks.length ||
      !passwordChecks.number ||
      !passwordChecks.letter
    ) {
      next.password = "Password doesn't meet the requirements below.";
    }

    if (!confirmPassword) {
      next.confirmPassword = "Please confirm your password.";
    } else if (confirmPassword !== password) {
      next.confirmPassword = "Passwords do not match.";
    }

    setErrors(next);

    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/");
    } catch (err) {
      setServerError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto flex min-h-[80vh] w-full max-w-6xl items-center justify-center px-2 py-6 sm:px-4 sm:py-10">
      {/* Main Card */}
      <div className="w-full overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-xl shadow-orange-900/5">
        {/* Always 2 Columns */}
        <div className="grid grid-cols-2">
          {/* LEFT SIDE - LOTTIE */}
          <div className="flex min-h-[500px] items-center justify-center p-3 sm:p-6 md:p-10">
            <div className="w-full max-w-md text-center">
              {/* Lottie Animation */}
              <div className="mx-auto h-32 w-32 sm:h-48 sm:w-48 md:h-64 md:w-64 lg:h-72 lg:w-72">
                <DotLottiePlayer
                  src="/Login%20Leady.lottie"
                  loop
                  autoplay
                />
              </div>

              {/* Welcome Text */}
              <h3 className="mt-2 text-sm font-semibold text-slate-900 sm:mt-4 sm:text-lg md:text-2xl">
                Welcome to FurEver Home
              </h3>

              <p className="mx-auto mt-1 hidden max-w-sm text-xs leading-5 text-slate-500 sm:mt-2 sm:block md:text-sm md:leading-6">
                Help rescued animals find loving and forever homes.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE - REGISTER FORM */}
          <div className="p-3 sm:p-5 md:p-8 lg:p-10">
            {/* Heading */}
            <div className="text-center">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl md:text-2xl">
                Create Account
              </h2>

              <p className="mt-1 text-[9px] leading-4 text-slate-500 sm:text-xs">
                Join FurEver Home to help rescued animals find loving
                families
              </p>
            </div>

            {/* Server Error */}
            {serverError && (
              <p className="mt-3 rounded-lg bg-rose-50 px-2 py-1.5 text-[10px] text-rose-600 sm:mt-4 sm:px-3 sm:py-2 sm:text-xs">
                {serverError}
              </p>
            )}

            {/* Registration Form */}
            <form
              onSubmit={handleSubmit}
              noValidate
              className="mt-4 space-y-2.5 sm:mt-6 sm:space-y-4"
            >
              {/* FULL NAME */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-[10px] font-medium text-slate-600 sm:text-xs"
                >
                  Full Name
                </label>

                <div className="relative mt-1">
                  <User className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400 sm:left-3 sm:h-4 sm:w-4" />

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                    className={`w-full rounded-lg border bg-white py-2 pl-7 pr-2 text-[11px] text-slate-800 placeholder-slate-400 outline-none transition focus:ring-2 sm:rounded-xl sm:py-2.5 sm:pl-10 sm:pr-3 sm:text-sm ${
                      errors.name
                        ? "border-rose-300 focus:ring-rose-100"
                        : "border-slate-200 focus:border-primary focus:ring-orange-100"
                    }`}
                  />
                </div>

                {errors.name && (
                  <p className="mt-1 text-[9px] text-rose-600 sm:text-[11px]">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-[10px] font-medium text-slate-600 sm:text-xs"
                >
                  Email Address
                </label>

                <div className="relative mt-1">
                  <Mail className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400 sm:left-3 sm:h-4 sm:w-4" />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={`w-full rounded-lg border bg-white py-2 pl-7 pr-2 text-[11px] text-slate-800 placeholder-slate-400 outline-none transition focus:ring-2 sm:rounded-xl sm:py-2.5 sm:pl-10 sm:pr-3 sm:text-sm ${
                      errors.email
                        ? "border-rose-300 focus:ring-rose-100"
                        : "border-slate-200 focus:border-primary focus:ring-orange-100"
                    }`}
                  />
                </div>

                {errors.email && (
                  <p className="mt-1 text-[9px] text-rose-600 sm:text-[11px]">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* ROLE */}
              <div>
                <label
                  htmlFor="role"
                  className="block text-[10px] font-medium text-slate-600 sm:text-xs"
                >
                  I want to join as
                </label>

                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-[11px] text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-orange-100 sm:rounded-xl sm:px-3 sm:py-2.5 sm:text-sm"
                >
                  <option value="adopter">Adopter</option>
                  <option value="shelter">Shelter / Rescuer</option>
                </select>
              </div>

              {/* PASSWORD */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-[10px] font-medium text-slate-600 sm:text-xs"
                >
                  Password
                </label>

                <div className="relative mt-1">
                  <Lock className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400 sm:left-3 sm:h-4 sm:w-4" />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    className={`w-full rounded-lg border bg-white py-2 pl-7 pr-8 text-[11px] text-slate-800 placeholder-slate-400 outline-none transition focus:ring-2 sm:rounded-xl sm:py-2.5 sm:pl-10 sm:pr-10 sm:text-sm ${
                      errors.password
                        ? "border-rose-300 focus:ring-rose-100"
                        : "border-slate-200 focus:border-primary focus:ring-orange-100"
                    }`}
                  />

                  {/* Show / Hide Password */}
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 sm:right-3"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />
                    ) : (
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                  </button>
                </div>

                {/* Password Requirements */}
                {password.length > 0 && (
                  <div className="mt-1 space-y-0.5 sm:mt-2 sm:space-y-1">
                    {[
                      {
                        ok: passwordChecks.length,
                        label: "At least 6 characters",
                      },
                      {
                        ok: passwordChecks.letter,
                        label: "Contains a letter",
                      },
                      {
                        ok: passwordChecks.number,
                        label: "Contains a number",
                      },
                    ].map((c) => (
                      <p
                        key={c.label}
                        className={`flex items-center gap-1 text-[8px] sm:gap-1.5 sm:text-[11px] ${
                          c.ok ? "text-primary" : "text-slate-400"
                        }`}
                      >
                        <Check
                          className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${
                            c.ok ? "opacity-100" : "opacity-30"
                          }`}
                        />
                        {c.label}
                      </p>
                    ))}
                  </div>
                )}

                {errors.password && (
                  <p className="mt-1 text-[9px] text-rose-600 sm:text-[11px]">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-[10px] font-medium text-slate-600 sm:text-xs"
                >
                  Confirm Password
                </label>

                <div className="relative mt-1">
                  <Lock className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400 sm:left-3 sm:h-4 sm:w-4" />

                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    className={`w-full rounded-lg border bg-white py-2 pl-7 pr-2 text-[11px] text-slate-800 placeholder-slate-400 outline-none transition focus:ring-2 sm:rounded-xl sm:py-2.5 sm:pl-10 sm:pr-3 sm:text-sm ${
                      errors.confirmPassword
                        ? "border-rose-300 focus:ring-rose-100"
                        : "border-slate-200 focus:border-primary focus:ring-orange-100"
                    }`}
                  />
                </div>

                {errors.confirmPassword && (
                  <p className="mt-1 text-[9px] text-rose-600 sm:text-[11px]">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-[11px] font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 sm:rounded-xl sm:py-3 sm:text-sm"
              >
                {loading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-3 text-center text-[10px] text-slate-500 sm:mt-6 sm:text-xs">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-primary hover:underline"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}