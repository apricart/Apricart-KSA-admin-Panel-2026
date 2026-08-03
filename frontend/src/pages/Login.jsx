import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  AtSignIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowRightIcon,
} from "../components/icons";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  // Force Light Mode on Login Page always
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Invalid email or password."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isEmailFloating = emailFocused || email.length > 0;
  const isPasswordFloating = passwordFocused || password.length > 0;

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col justify-center items-center p-4 relative transition-colors duration-200">
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {/* Card Form */}
        <div className="p-7 md:p-9 pt-6 md:pt-7 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50">
          {/* Header (Shifted Up away from input fields) */}
          <div className="space-y-0.5 mb-7">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
              Sign In
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Enter your credentials to access your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold"
              >
                {error}
              </motion.div>
            )}

            {/* Email Field with Floating Label */}
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-colors duration-200">
                <AtSignIcon className={emailFocused ? "text-slate-900" : "text-slate-400"} />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                autoComplete="username"
                required
                className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 !bg-white text-slate-900 text-sm font-medium focus:outline-none transition-all duration-200 ${
                  emailFocused
                    ? "border-slate-900"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              />
              <label
                htmlFor="email"
                className={`absolute left-10 pointer-events-none transition-all duration-200 px-1 bg-white rounded ${
                  isEmailFloating
                    ? "-top-2.5 text-xs font-bold text-slate-900 z-10"
                    : "top-3.5 text-sm font-medium text-slate-400"
                }`}
              >
                Email Address
              </label>
            </div>

            {/* Password Field Header (Forgot Password Link) */}
            <div className="space-y-1.5">
              <div className="flex justify-end">
                <a
                  href="#forgot"
                  onClick={(e) => e.preventDefault()}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Forgot Password?
                </a>
              </div>

              {/* Password Field with Floating Label */}
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-colors duration-200">
                  <LockIcon className={passwordFocused ? "text-slate-900" : "text-slate-400"} />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  autoComplete="current-password"
                  required
                  className={`w-full pl-11 pr-11 py-3.5 rounded-2xl border-2 !bg-white text-slate-900 text-sm font-medium focus:outline-none transition-all duration-200 ${
                    passwordFocused
                      ? "border-slate-900"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                />
                <label
                  htmlFor="password"
                  className={`absolute left-10 pointer-events-none transition-all duration-200 px-1 bg-white rounded ${
                    isPasswordFloating
                      ? "-top-2.5 text-xs font-bold text-slate-900 z-10"
                      : "top-3.5 text-sm font-medium text-slate-400"
                  }`}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer p-1"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="w-full mt-4 py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-base shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}



