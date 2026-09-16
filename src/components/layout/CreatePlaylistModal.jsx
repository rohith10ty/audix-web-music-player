import { AnimatePresence, motion } from "framer-motion";
import { Music, Plus, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "@/context/PlayerContext";
import { useTheme } from "@/context/ThemeContext";

const COVERS = [
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=700&q=85",
];

export default function CreatePlaylistModal({ isOpen, onClose }) {
  const { createCustomPlaylist } = usePlayer();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState(COVERS[0]);

  if (!isOpen) return null;

  const handleCreate = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newPlaylist = createCustomPlaylist({
      title: title.trim(),
      description: description.trim() || "A custom playlist curated by you.",
      image: selectedImage,
    });

    onClose();
    setTitle("");
    setDescription("");
    navigate(`/playlist/${newPlaylist.id}`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className={`
            relative z-10 w-full max-w-[460px] max-h-[85vh] sm:max-h-[88vh] overflow-y-auto spotify-scrollbar rounded-2xl
            border p-5 sm:p-6 shadow-2xl transition-colors
            ${
              theme === "dark"
                ? "bg-[#181818] border-white/10 text-white"
                : "bg-[#faf8f5] border-stone-300 text-stone-900"
            }
          `}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 text-red-400">
                <Music size={18} />
              </div>
              <h2 className="text-lg font-bold">Create New Playlist</h2>
            </div>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full opacity-70 hover:opacity-100 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#a7a7a7] mb-1">
                Playlist Name
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Telugu Top Hits"
                className={`
                  w-full rounded-lg border px-3 py-2 text-sm font-semibold outline-none transition
                  ${
                    theme === "dark"
                      ? "bg-[#242424] border-white/10 text-white placeholder:text-[#777] focus:border-red-500"
                      : "bg-[#f4f0e8] border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-red-500"
                  }
                `}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#a7a7a7] mb-1">
                Description (optional)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Give your playlist a vibe or catchy description..."
                className={`
                  w-full resize-none rounded-lg border px-3 py-1.5 text-xs outline-none transition
                  ${
                    theme === "dark"
                      ? "bg-[#242424] border-white/10 text-white placeholder:text-[#777] focus:border-red-500"
                      : "bg-[#f4f0e8] border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-red-500"
                  }
                `}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#a7a7a7] mb-1.5">
                Choose Cover Art
              </label>
              <div className="flex gap-2">
                {COVERS.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`
                      relative h-12 w-12 sm:h-13 sm:w-13 overflow-hidden rounded-lg border-2 transition hover:scale-105 cursor-pointer
                      ${
                        selectedImage === img
                          ? "border-red-500 ring-2 ring-red-500/40"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }
                    `}
                  >
                    <img
                      src={img}
                      alt="Cover choice"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2.5 pt-2 border-t border-white/[0.06]">
              <button
                type="button"
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
                Cancel
              </button>

              <button
                type="submit"
                disabled={!title.trim()}
                className="flex items-center gap-1.5 rounded-full bg-red-500 px-5 py-2 text-xs font-bold text-white shadow-lg transition hover:bg-red-400 disabled:opacity-50 cursor-pointer"
              >
                <Plus size={15} />
                Create Playlist
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
