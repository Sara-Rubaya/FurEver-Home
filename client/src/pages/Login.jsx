
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { DotLottiePlayer } from "@dotlottie/react-player";
import { useAuth } from "../context/AuthContext.jsx";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Save token + user through AuthContext
      login(data.user, data.token);

      navigate("/");
    } catch (err) {
      setError(err.message || "Something went wrong");
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
                  src="/Employee%20content.lottie"
                  loop
                  autoplay
                />
              </div>

              {/* Welcome Text */}
              <h3 className="mt-2 text-sm font-semibold text-slate-900 sm:mt-4 sm:text-lg md:text-2xl">
                Welcome Back to FurEver Home
              </h3>

              <p className="mx-auto mt-1 hidden max-w-sm text-xs leading-5 text-slate-500 sm:mt-2 sm:block md:text-sm md:leading-6">
                Sign in to continue helping rescued animals find loving and
                forever homes.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE - LOGIN FORM */}
          <div className="p-3 sm:p-5 md:p-8 lg:p-10">
            {/* Heading */}
            <div className="text-center">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl md:text-2xl">
                Welcome Back
              </h2>

              <p className="mt-1 text-[9px] leading-4 text-slate-500 sm:text-xs">
                Login to your FurEver Home account
              </p>
            </div>

            {/* Server Error */}
            {error && (
              <p className="mt-3 rounded-lg bg-rose-50 px-2 py-1.5 text-[10px] text-rose-600 sm:mt-4 sm:px-3 sm:py-2 sm:text-xs">
                {error}
              </p>
            )}

            {/* Login Form */}
            <form
              onSubmit={handleSubmit}
              className="mt-4 space-y-2.5 sm:mt-6 sm:space-y-4"
            >
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
                    name="email"
                    required
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-7 pr-2 text-[11px] text-slate-800 placeholder-slate-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-orange-100 sm:rounded-xl sm:py-2.5 sm:pl-10 sm:pr-3 sm:text-sm"
                  />
                </div>
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
                    name="password"
                    required
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-7 pr-8 text-[11px] text-slate-800 placeholder-slate-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-orange-100 sm:rounded-xl sm:py-2.5 sm:pl-10 sm:pr-10 sm:text-sm"
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
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-[11px] font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 sm:rounded-xl sm:py-3 sm:text-sm"
              >
                {loading ? (
                  <span>Logging in...</span>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-3 text-center text-[10px] text-slate-500 sm:mt-6 sm:text-xs">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-primary hover:underline"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

