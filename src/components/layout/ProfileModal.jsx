import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Headphones,
  Heart,
  Key,
  Lock,
  LogOut,
  Mail,
  Music,
  Radio,
  Sparkles,
  Upload,
  User,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "@/context/PlayerContext";
import { useTheme } from "@/context/ThemeContext";
import ThemeToggleButton from "@/components/ui/ThemeToggleButton";

export default function ProfileModal({ isOpen, onClose }) {
  const {
    userProfile,
    currentUser,
    updateUserAvatar,
    updateUserName,
    changeUserPassword,
    sendPasswordReset,
    likedSongIds = [],
    customPlaylists = [],
    logoutUser,
    openAuthModal,
    isAuthenticated,
  } = usePlayer();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const emailPrefix = currentUser?.email ? currentUser.email.split("@")[0] : "Music Lover";
  const displayName =
    userProfile?.name && userProfile.name !== "Guest Listener"
      ? userProfile.name
      : currentUser?.displayName || emailPrefix;
  const displayEmail = userProfile?.email || currentUser?.email || "";
  const avatarSrc = userProfile?.avatar || currentUser?.photoURL || "";
  const initialLetter = displayName ? displayName.trim().charAt(0).toUpperCase() : "A";

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(displayName);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEditedName(displayName);
    }
  }, [displayName, isOpen]);

  // Change password states
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ text: "", type: "" }); // type: 'success' | 'error'

  if (!isOpen) return null;

  // Optimized image compression before Firestore cloud sync
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 320;
        const MAX_HEIGHT = 320;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85);
        try {
          await updateUserAvatar(compressedBase64);
        } catch (err) {
          console.warn("Avatar upload error:", err);
        } finally {
          setIsUploadingPhoto(false);
        }
      };
      img.src = uploadEvent.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveName = async () => {
    if (editedName.trim() && editedName.trim() !== userProfile.name) {
      try {
        await updateUserName(editedName.trim());
      } catch (err) {
        console.warn("Save name error:", err);
      }
    }
    setIsEditingName(false);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ text: "", type: "" });

    if (newPassword.length < 6) {
      setPasswordMsg({
        text: "Password must be at least 6 characters long.",
        type: "error",
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordMsg({
        text: "Passwords do not match.",
        type: "error",
      });
      return;
    }

    setPasswordLoading(true);
    try {
      await changeUserPassword(newPassword);
      setPasswordMsg({
        text: "Password updated successfully!",
        type: "success",
      });
      setNewPassword("");
      setConfirmNewPassword("");
      setTimeout(() => {
        setShowChangePassword(false);
        setPasswordMsg({ text: "", type: "" });
      }, 2500);
    } catch (err) {
      setPasswordMsg({
        text:
          err.code === "auth/requires-recent-login"
            ? "For security, please log in again before changing password."
            : err.message || "Failed to update password.",
        type: "error",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    setPasswordMsg({ text: "", type: "" });
    if (!userProfile.email) {
      setPasswordMsg({
        text: "No email address found for this account.",
        type: "error",
      });
      return;
    }

    setPasswordLoading(true);
    try {
      await sendPasswordReset(userProfile.email);
      setPasswordMsg({
        text: `Password reset email sent to ${userProfile.email}!`,
        type: "success",
      });
    } catch (err) {
      setPasswordMsg({
        text: err.message || "Failed to send reset email.",
        type: "error",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {/* Centered Modal Overlay */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 pb-24 sm:pb-4">
        {/* Dark Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className={`
            relative z-10 w-full max-w-[440px] max-h-[calc(100vh-120px)] overflow-y-auto spotify-scrollbar rounded-2xl border shadow-2xl transition-colors duration-200
            ${
              theme === "dark"
                ? "bg-[#181818] border-white/10 text-white"
                : "bg-[#faf8f5] border-stone-300 text-stone-900"
            }
          `}
        >
          {/* Header Banner */}
          <div className="relative h-24 sm:h-26 w-full overflow-hidden shrink-0 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            <div className="relative z-10 flex h-full items-start justify-between p-3.5">
              <div className="flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-md px-2.5 py-0.5 text-white shadow-sm">
                <Sparkles size={12} className="text-amber-400" />
                <span className="text-[10px] font-bold tracking-wider uppercase">
                  Audix Member
                </span>
              </div>

              <button
                onClick={onClose}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black/90 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Modal Main Content Body */}
          <div className="px-5 pb-5 pt-0">
            {/* Avatar on Left & Upload + Theme Controls on Right */}
            <div className="-mt-10 mb-3 flex items-end justify-between">
              {/* Profile Avatar (Real Uploaded or Stylish Initial) */}
              <div className="relative group">
                <div className="h-20 w-20 rounded-full overflow-hidden shadow-xl ring-4 ring-black/70 border-2 border-red-500 bg-[#222] flex items-center justify-center">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt={displayName}
                      className="h-full w-full object-cover object-center"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-red-600 via-rose-600 to-amber-600 flex items-center justify-center text-white font-black text-2xl drop-shadow-md">
                      {initialLetter}
                    </div>
                  )}

                  {isUploadingPhoto && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    </div>
                  )}
                </div>
              </div>

              {/* Controls on Right */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className={`
                    flex items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-bold transition shadow-sm cursor-pointer disabled:opacity-50
                    ${
                      theme === "dark"
                        ? "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                        : "bg-[#ece7de] hover:bg-[#e4ded3] text-stone-800 border border-stone-300/80"
                    }
                  `}
                  title="Upload profile photo (syncs across devices)"
                >
                  <Upload size={12} className="text-red-500" />
                  <span>{avatarSrc ? "Change Photo" : "Upload Photo"}</span>
                </button>

                <ThemeToggleButton variant="circle" start="center" />

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* User Title, Email & Real Info */}
            <div className="mb-3">
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                      className={`
                        w-full rounded-lg border px-2.5 py-1 text-sm font-bold outline-none
                        ${
                          theme === "dark"
                            ? "bg-black/50 border-white/20 text-white"
                            : "bg-white border-stone-300 text-stone-900"
                        }
                      `}
                      autoFocus
                    />
                    <button
                      onClick={handleSaveName}
                      className="rounded-lg bg-red-500 px-3 py-1 text-xs font-bold text-white hover:bg-red-400 cursor-pointer shrink-0"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <h2
                    onClick={() => {
                      setEditedName(displayName);
                      setIsEditingName(true);
                    }}
                    className="cursor-pointer text-xl font-black hover:underline leading-tight tracking-tight flex items-center gap-2 group"
                    title="Click to edit name"
                  >
                    <span>{displayName}</span>
                    <span className="text-[11px] font-normal opacity-0 group-hover:opacity-70 transition-opacity">
                      ✏️
                    </span>
                  </h2>
                )}
              </div>

              {/* Real Email Display */}
              <div className="flex items-center gap-1.5 mt-1 text-[12px] opacity-75">
                <Mail size={12} className="text-red-500" />
                <span className="font-medium">{displayEmail || "No email attached"}</span>
              </div>
            </div>

            {/* Real Stats Grid (Playlists & Liked Songs) */}
            <div className="mb-3 grid grid-cols-2 gap-2 text-center">
              <div
                className={`
                rounded-xl p-2 transition
                ${theme === "dark" ? "bg-white/[0.04]" : "bg-[#f4f0e8]"}
              `}
              >
                <p className="text-base font-bold">{customPlaylists.length}</p>
                <p className="text-[10px] text-[#a7a7a7] font-semibold uppercase tracking-wider">
                  Playlists Created
                </p>
              </div>

              <div
                onClick={() => {
                  onClose();
                  navigate("/playlist/liked");
                }}
                className={`
                cursor-pointer rounded-xl p-2 transition hover:scale-[1.02]
                ${
                  theme === "dark"
                    ? "bg-white/[0.04] hover:bg-red-500/10"
                    : "bg-[#f4f0e8] hover:bg-red-50"
                }
              `}
              >
                <p className="text-base font-bold text-red-500">
                  {likedSongIds.length}
                </p>
                <p className="text-[10px] text-[#a7a7a7] font-semibold uppercase tracking-wider">
                  Liked Songs
                </p>
              </div>
            </div>

            {/* Change Password Collapsible Section */}
            {isAuthenticated && (
              <div
                className={`
                  rounded-xl border p-3 mb-3 transition-colors
                  ${
                    theme === "dark"
                      ? "bg-white/[0.03] border-white/10"
                      : "bg-[#f4f0e8] border-stone-300/80"
                  }
                `}
              >
                <button
                  type="button"
                  onClick={() => setShowChangePassword((v) => !v)}
                  className="w-full flex items-center justify-between text-left text-xs font-bold transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Key size={14} className="text-red-500" />
                    Security & Password
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      showChangePassword ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showChangePassword && (
                  <form onSubmit={handleUpdatePassword} className="mt-3 space-y-2.5">
                    {passwordMsg.text && (
                      <div
                        className={`
                          rounded-lg p-2 text-[11px] font-semibold text-center
                          ${
                            passwordMsg.type === "success"
                              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-500"
                              : "bg-red-500/10 border border-red-500/30 text-red-500"
                          }
                        `}
                      >
                        {passwordMsg.text}
                      </div>
                    )}

                    <div>
                      <label className="block text-[10.5px] font-bold mb-1">
                        New Password
                      </label>
                      <div
                        className={`
                          flex h-8 items-center rounded-lg border px-2 transition-all
                          ${
                            theme === "dark"
                              ? "bg-[#222] border-white/10 text-white focus-within:border-red-500"
                              : "bg-white border-stone-300 text-stone-900 focus-within:border-red-500"
                          }
                        `}
                      >
                        <Lock size={12} className="mr-1.5 opacity-50 shrink-0" />
                        <input
                          type={showNewPass ? "text" : "password"}
                          placeholder="Min 6 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-transparent text-[11px] font-medium outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass((v) => !v)}
                          className="p-1 opacity-60 hover:opacity-100 cursor-pointer"
                        >
                          {showNewPass ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold mb-1">
                        Confirm New Password
                      </label>
                      <div
                        className={`
                          flex h-8 items-center rounded-lg border px-2 transition-all
                          ${
                            theme === "dark"
                              ? "bg-[#222] border-white/10 text-white focus-within:border-red-500"
                              : "bg-white border-stone-300 text-stone-900 focus-within:border-red-500"
                          }
                        `}
                      >
                        <Lock size={12} className="mr-1.5 opacity-50 shrink-0" />
                        <input
                          type={showConfirmPass ? "text" : "password"}
                          placeholder="Re-enter new password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="w-full bg-transparent text-[11px] font-medium outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPass((v) => !v)}
                          className="p-1 opacity-60 hover:opacity-100 cursor-pointer"
                        >
                          {showConfirmPass ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleSendResetEmail}
                        disabled={passwordLoading}
                        className="text-[10.5px] font-semibold text-red-500 hover:underline cursor-pointer disabled:opacity-50"
                      >
                        Send reset email
                      </button>

                      <button
                        type="submit"
                        disabled={passwordLoading || !newPassword}
                        className="rounded-full bg-red-500 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-red-400 disabled:opacity-50 cursor-pointer"
                      >
                        {passwordLoading ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Preferences */}
            <div
              className={`
              space-y-1.5 rounded-xl p-2.5 mb-3
              ${
                theme === "dark"
                  ? "bg-white/[0.03] border border-white/5"
                  : "bg-[#f4f0e8] border border-stone-300/70"
              }
            `}
            >
              <div className="flex items-center justify-between text-[11.5px]">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Headphones size={13} className="text-red-500" />
                  Streaming Quality
                </span>
                <span className="font-semibold text-[11px] opacity-80">
                  {userProfile.audioQuality || "Very High (320 kbps)"}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11.5px]">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Radio size={13} className="text-rose-400" />
                  Languages
                </span>
                <span className="font-semibold text-red-400 text-[10.5px]">
                  Telugu, English, Tamil, Hindi, Malayalam, Kannada
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onClose();
                  navigate("/playlist/liked");
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-500 py-2 text-xs font-bold text-white shadow-md shadow-red-500/25 transition hover:bg-red-400 active:scale-98 cursor-pointer"
              >
                <Heart size={13} fill="currentColor" />
                View Liked Songs ({likedSongIds.length})
              </button>

              <button
                onClick={onClose}
                className={`
                  rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer
                  ${
                    theme === "dark"
                      ? "bg-white/10 hover:bg-white/20 text-white"
                      : "bg-stone-200 hover:bg-stone-300 text-stone-800"
                  }
                `}
              >
                Done
              </button>
            </div>

            {/* Log Out / Switch Account Button */}
            <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  logoutUser();
                }}
                className="flex items-center gap-1.5 text-[11.5px] font-bold text-red-400 hover:text-red-500 transition cursor-pointer"
              >
                <LogOut size={13} />
                Log out
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  openAuthModal("login");
                }}
                className="text-[11.5px] font-semibold opacity-60 hover:opacity-100 hover:underline transition cursor-pointer"
              >
                Switch Account
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

