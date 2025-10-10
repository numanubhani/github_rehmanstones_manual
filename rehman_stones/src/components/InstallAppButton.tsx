// src/components/InstallAppButton.tsx
import useA2HS from "../hooks/useA2HS";

export default function InstallAppButton({
  className = "",
}: {
  className?: string;
}) {
  const { canInstall, install, installed } = useA2HS();

  if (installed || !canInstall) return null;

  return (
    <button
      onClick={install}
      className={`px-3 py-2 rounded-lg bg-black text-white text-sm hover:opacity-90 active:opacity-80 ${className}`}
    >
      Install App
    </button>
  );
}
