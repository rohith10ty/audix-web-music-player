import { useTheme } from "@/context/ThemeContext";

export default function Footer() {
  const { theme } = useTheme();

  return (
    <footer className="mt-14 mb-4 border-t border-black/[0.06] dark:border-white/[0.06] pt-6 pb-2 text-center text-xs">
      <p
        className={`max-w-xl mx-auto leading-relaxed font-normal ${
          theme === "dark" ? "text-[#888888]" : "text-stone-500"
        }`}
      >
        Audix is a free, non-commercial open-source web application for educational & personal demonstration. All audio streams, images & metadata belong to their respective copyright holders.
      </p>
      <p className="mt-2.5 font-medium">
        <span className={theme === "dark" ? "text-[#888888]" : "text-stone-500"}>
          DMCA / Content Removal & Contact:{" "}
        </span>
        <a
          href="mailto:rohith.10ty@gmail.com"
          className="text-red-500 hover:underline font-bold"
        >
          rohith.10ty@gmail.com
        </a>
      </p>
    </footer>
  );
}
