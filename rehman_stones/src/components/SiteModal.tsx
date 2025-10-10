import { useEffect, useState } from "react";

type SiteConfig = {
  showWelcomeModal: boolean;
  title: string;
  message: string;
};
const KEY = "site-config";
const SEEN = "site-modal-seen"; // per session

export default function SiteModal() {
  const [open, setOpen] = useState(false);
  const [cfg, setCfg] = useState<SiteConfig | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const x = JSON.parse(raw) as SiteConfig;
      setCfg(x);
      if (x.showWelcomeModal && !sessionStorage.getItem(SEEN)) {
        setOpen(true);
        sessionStorage.setItem(SEEN, "1");
      }
    } catch {}
  }, []);

  if (!open || !cfg) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 grid place-items-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg p-5">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-semibold">{cfg.title}</h3>
          <button
            className="w-8 h-8 grid place-items-center rounded hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>
        <div className="mt-2 text-gray-700">{cfg.message}</div>
        <div className="mt-4 text-right">
          <button
            className="px-4 py-2 bg-black text-white rounded"
            onClick={() => setOpen(false)}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
