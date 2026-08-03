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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-center items-center p-4 relative transition-colors duration-200 overflow-hidden">
      {/* Decorative Brand Ambient Glowing Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#FFC500]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#0B1B3D]/15 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card Form */}
        <div className="p-8 md:p-10 pt-7 md:pt-8 rounded-3xl bg-white border border-slate-200/80 shadow-2xl shadow-[#0B1B3D]/10">
          {/* Apricart Brand Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0B1B3D] via-[#0F2654] to-[#1A3875] text-[#FFC500] font-black text-2xl shadow-lg shadow-[#0B1B3D]/30 flex items-center justify-center mb-3 border border-[#FFC500]/30 cursor-pointer"
            >
              A
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#0B1B3D]">
              Apricart <span className="text-[#FFC500] font-black">KSA</span>
            </h1>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
              Admin Portal Sign In
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Email Field */}
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-colors duration-200">
                <AtSignIcon className={emailFocused ? "text-[#0B1B3D]" : "text-slate-400"} />
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
                    ? "border-[#0B1B3D] ring-2 ring-[#0B1B3D]/10"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              />
              <label
                htmlFor="email"
                className={`absolute left-10 pointer-events-none transition-all duration-200 px-1 bg-white rounded ${
                  isEmailFloating
                    ? "-top-2.5 text-xs font-bold text-[#0B1B3D] z-10"
                    : "top-3.5 text-sm font-medium text-slate-400"
                }`}
              >
                Email Address
              </label>
            </div>

            {/* Password Field Header & Input */}
            <div className="space-y-1.5">
              <div className="flex justify-end">
                <a
                  href="#forgot"
                  onClick={(e) => e.preventDefault()}
                  className="text-xs font-semibold text-slate-500 hover:text-[#0B1B3D] transition-colors cursor-pointer"
                >
                  Forgot Password?
                </a>
              </div>

              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-colors duration-200">
                  <LockIcon className={passwordFocused ? "text-[#0B1B3D]" : "text-slate-400"} />
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
                      ? "border-[#0B1B3D] ring-2 ring-[#0B1B3D]/10"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                />
                <label
                  htmlFor="password"
                  className={`absolute left-10 pointer-events-none transition-all duration-200 px-1 bg-white rounded ${
                    isPasswordFloating
                      ? "-top-2.5 text-xs font-bold text-[#0B1B3D] z-10"
                      : "top-3.5 text-sm font-medium text-slate-400"
                  }`}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0B1B3D] transition-colors cursor-pointer p-1"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Apricart Brand Submit Button */}
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              type="submit"
              disabled={submitting}
              className="w-full mt-4 py-3.5 px-6 rounded-2xl bg-[#0B1B3D] hover:bg-[#07132B] text-white font-bold text-base shadow-lg shadow-[#0B1B3D]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group border border-slate-800"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRightIcon className="w-5 h-5 text-[#FFC500] group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}



