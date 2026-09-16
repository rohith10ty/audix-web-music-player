import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Mail,
  User,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { useTheme } from "@/context/ThemeContext";

const LANGUAGES = [
  "Telugu",
  "Tamil",
  "Hindi",
  "English",
  "Malayalam",
  "Kannada",
  "Punjabi",
];

function getFirebaseErrorMessage(err) {
  if (!err) return "An unknown error occurred.";
  const code = err.code || "";
  if (code === "auth/email-already-in-use")
    return "This email is already registered. Please log in.";
  if (
    code === "auth/invalid-credential" ||
    code === "auth/wrong-password" ||
    code === "auth/user-not-found"
  )
    return "Invalid email or password.";
  if (code === "auth/weak-password")
    return "Password should be at least 6 characters.";
  if (code === "auth/invalid-email")
    return "Please enter a valid email address.";
  if (code === "auth/popup-closed-by-user")
    return "Google sign-in popup was closed.";
  if (code === "auth/network-request-failed")
    return "Network error. Please check your connection.";
  return err.message || "Authentication failed. Please try again.";
}

export default function AuthModal({ isOpen, onClose, initialMode = "login" }) {
  const { theme } = useTheme();
  const { loginWithEmail, signUpWithEmail, loginWithGoogle } = usePlayer();

  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("Telugu");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || "login");
      setErrorMsg("");
      setSuccessMsg("");
      setPassword("");
      setConfirmPassword("");
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setErrorMsg("");
    setSuccessMsg("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    setIsLoading(true);
    try {
      await loginWithGoogle();
      setSuccessMsg("Signed in with Google successfully!");
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      setErrorMsg(getFirebaseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    setErrorMsg("");

    if (!email.trim()) {
      setErrorMsg("Please enter your email");
      return;
    }
    if (!password.trim()) {
      setErrorMsg("Please enter your password");
      return;
    }

    setIsLoading(true);
    try {
      await loginWithEmail(email.trim(), password);
      setSuccessMsg("Welcome back! Logged in successfully.");
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      setErrorMsg(getFirebaseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e?.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Please enter your name");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please re-enter.");
      return;
    }

    setIsLoading(true);
    try {
      await signUpWithEmail(name.trim(), email.trim(), password);
      setSuccessMsg("Account created! Enjoy unlimited music.");
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      setErrorMsg(getFirebaseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 pb-24 sm:pb-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window Container - Scrollable & Compact */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className={`
            relative z-10 w-full max-w-[420px] max-h-[85vh] sm:max-h-[88vh] overflow-y-auto spotify-scrollbar rounded-2xl border shadow-2xl transition-colors duration-200
            ${
              theme === "dark"
                ? "bg-[#181818] border-white/10 text-white"
                : "bg-[#faf8f5] border-stone-300 text-stone-900"
            }
          `}
        >
          {/* Top Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 px-5 py-3.5 text-white shrink-0">
            <button
              onClick={onClose}
              className="absolute right-3.5 top-3.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/60 cursor-pointer"
            >
              <X size={14} />
            </button>

            <div className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="Audix Logo"
                className="h-8 w-8 object-contain drop-shadow-md shrink-0"
              />
              <div>
                <h3 className="text-sm sm:text-base font-black tracking-tight leading-tight">Audix</h3>
                <p className="text-[10.5px] sm:text-[11px] font-semibold text-white/90">
                  {mode === "login"
                    ? "Log in to sync your library across devices"
                    : "Create an account for personal playlists & favorites"}
                </p>
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="mt-2.5 flex rounded-lg bg-black/25 p-0.5 backdrop-blur-md">
              <button
                type="button"
                onClick={() => handleModeSwitch("login")}
                className={`
                  flex-1 rounded-md py-1 text-center text-[11.5px] font-bold transition cursor-pointer
                  ${
                    mode === "login"
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-white/80 hover:text-white"
                  }
                `}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch("signup")}
                className={`
                  flex-1 rounded-md py-1 text-center text-[11.5px] font-bold transition cursor-pointer
                  ${
                    mode === "signup"
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-white/80 hover:text-white"
                  }
                `}
              >
                Sign Up Free
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-5 pt-3.5">
            {/* Notification messages */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-2.5 rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-[11px] font-semibold text-red-500 text-center"
              >
                {errorMsg}
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-2.5 flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 text-[11px] font-bold text-emerald-500"
              >
                <Check size={14} />
                {successMsg}
              </motion.div>
            )}

            {/* 1-Click Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className={`
                w-full flex items-center justify-center gap-2.5 rounded-full py-2 px-4 text-xs font-bold transition shadow-sm hover:scale-[1.01] active:scale-98 cursor-pointer disabled:opacity-50 border
                ${
                  theme === "dark"
                    ? "bg-[#222] hover:bg-[#2a2a2a] text-white border-white/15"
                    : "bg-white hover:bg-stone-50 text-stone-900 border-stone-300"
                }
              `}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative my-2.5 flex items-center justify-center">
              <div
                className={`
                absolute inset-0 flex items-center
                ${theme === "dark" ? "border-white/10" : "border-stone-300"}
              `}
              >
                <div className="w-full border-t border-inherit" />
              </div>
              <span
                className={`
                relative px-2.5 text-[9.5px] font-semibold uppercase tracking-wider
                ${
                  theme === "dark"
                    ? "bg-[#181818] text-[#888]"
                    : "bg-[#faf8f5] text-stone-400"
                }
              `}
              >
                or with email
              </span>
            </div>

            {/* FORM */}
            <form
              onSubmit={mode === "login" ? handleLogin : handleSignup}
              className="space-y-2"
            >
              {mode === "signup" && (
                <div>
                  <label className="mb-0.5 block text-[10.5px] font-bold">
                    What should we call you?
                  </label>
                  <div
                    className={`
                    flex h-8.5 items-center rounded-lg border px-2.5 transition-all
                    ${
                      theme === "dark"
                        ? "bg-[#222] border-white/10 text-white focus-within:border-red-500"
                        : "bg-[#ece7de] border-stone-300 text-stone-900 focus-within:border-red-500 focus-within:bg-white"
                    }
                  `}
                  >
                    <User size={13} className="mr-2 opacity-50 shrink-0" />
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent text-[11px] font-medium outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-0.5 block text-[10.5px] font-bold">
                  Email Address
                </label>
                <div
                  className={`
                  flex h-8.5 items-center rounded-lg border px-2.5 transition-all
                  ${
                    theme === "dark"
                      ? "bg-[#222] border-white/10 text-white focus-within:border-red-500"
                      : "bg-[#ece7de] border-stone-300 text-stone-900 focus-within:border-red-500 focus-within:bg-white"
                  }
                `}
                >
                  <Mail size={13} className="mr-2 opacity-50 shrink-0" />
                  <input
                    type="email"
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-[11px] font-medium outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-0.5 block text-[10.5px] font-bold">Password</label>
                <div
                  className={`
                  flex h-8.5 items-center rounded-lg border px-2.5 transition-all
                  ${
                    theme === "dark"
                      ? "bg-[#222] border-white/10 text-white focus-within:border-red-500"
                      : "bg-[#ece7de] border-stone-300 text-stone-900 focus-within:border-red-500 focus-within:bg-white"
                  }
                `}
                >
                  <Lock size={13} className="mr-2 opacity-50 shrink-0" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password (min 6 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent text-[11px] font-medium outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="p-1 opacity-60 hover:opacity-100 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>

              {mode === "signup" && (
                <div>
                  <label className="mb-0.5 block text-[10.5px] font-bold">
                    Confirm Password
                  </label>
                  <div
                    className={`
                    flex h-8.5 items-center rounded-lg border px-2.5 transition-all
                    ${
                      theme === "dark"
                        ? "bg-[#222] border-white/10 text-white focus-within:border-red-500"
                        : "bg-[#ece7de] border-stone-300 text-stone-900 focus-within:border-red-500 focus-within:bg-white"
                    }
                  `}
                  >
                    <Lock size={13} className="mr-2 opacity-50 shrink-0" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-transparent text-[11px] font-medium outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="p-1 opacity-60 hover:opacity-100 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>
              )}

              {mode === "signup" && (
                <div>
                  <label className="mb-0.5 block text-[10.5px] font-bold">
                    Primary Music Language
                  </label>
                  <div
                    className={`
                    flex h-8.5 items-center rounded-lg border px-2.5 transition-all
                    ${
                      theme === "dark"
                        ? "bg-[#222] border-white/10 text-white focus-within:border-red-500"
                        : "bg-[#ece7de] border-stone-300 text-stone-900 focus-within:border-red-500 focus-within:bg-white"
                    }
                  `}
                  >
                    <Globe size={13} className="mr-2 opacity-50 shrink-0" />
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className={`
                        w-full bg-transparent text-[11px] font-medium outline-none cursor-pointer
                        ${theme === "dark" ? "bg-[#222] text-white" : "bg-white text-stone-900"}
                      `}
                    >
                      {LANGUAGES.map((lang) => (
                        <option
                          key={lang}
                          value={lang}
                          className={theme === "dark" ? "bg-[#222] text-white" : "bg-white text-stone-900"}
                        >
                          {lang}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {mode === "login" && (
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-1.5 text-[10.5px] font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="accent-red-500 rounded"
                    />
                    Remember me
                  </label>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={isLoading}
                className="mt-2.5 flex h-9 w-full items-center justify-center rounded-full bg-red-500 font-bold text-xs text-white shadow-md shadow-red-500/25 transition hover:bg-red-600 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : mode === "login" ? (
                  "Log In"
                ) : (
                  "Create Account"
                )}
              </motion.button>
            </form>

            <div className="mt-2.5 text-center">
              <p
                className={`text-[10.5px] ${
                  theme === "dark" ? "text-[#a7a7a7]" : "text-stone-500"
                }`}
              >
                {mode === "login" ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => handleModeSwitch("signup")}
                      className="font-bold text-red-500 hover:underline cursor-pointer"
                    >
                      Sign up for free
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => handleModeSwitch("login")}
                      className="font-bold text-red-500 hover:underline cursor-pointer"
                    >
                      Log in here
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

