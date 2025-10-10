import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type SiteConfig = {
  showWelcomeModal: boolean;
  title: string;
  message: string;
};
const KEY = "site-config";

function read(): SiteConfig {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {} as any;
  }
}
function write(cfg: SiteConfig) {
  localStorage.setItem(KEY, JSON.stringify(cfg));
}

export default function AdminSettings() {
  const [cfg, setCfg] = useState<SiteConfig>({
    showWelcomeModal: false,
    title: "Welcome to Rehman Stones",
    message: "Handcrafted rings & certified gemstones.",
  });

  useEffect(() => {
    const x = read();
    if (x && typeof x === "object") {
      setCfg({ ...cfg, ...x });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function save() {
    write(cfg);
    toast.success("Saved");
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Admin Settings</h1>

      <div className="rounded-lg ring-1 ring-gray-200 p-4 grid sm:grid-cols-2 gap-4">
        <div>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={cfg.showWelcomeModal}
              onChange={(e) =>
                setCfg((c) => ({ ...c, showWelcomeModal: e.target.checked }))
              }
            />
            <span>Show Welcome Modal on site</span>
          </label>

          <div className="mt-3">
            <label className="block text-sm text-gray-600">Title</label>
            <input
              className="mt-1 border rounded px-3 py-2 w-full"
              value={cfg.title}
              onChange={(e) => setCfg((c) => ({ ...c, title: e.target.value }))}
            />
          </div>

          <div className="mt-3">
            <label className="block text-sm text-gray-600">Message</label>
            <textarea
              className="mt-1 border rounded px-3 py-2 w-full min-h-[80px]"
              value={cfg.message}
              onChange={(e) =>
                setCfg((c) => ({ ...c, message: e.target.value }))
              }
            />
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={save}
              className="px-4 py-2 bg-black text-white rounded"
            >
              Save
            </button>
            <button
              onClick={() => {
                localStorage.removeItem(KEY);
                setCfg({
                  showWelcomeModal: false,
                  title: "Welcome to Rehman Stones",
                  message: "Handcrafted rings & certified gemstones.",
                });
                toast("Reset to defaults");
              }}
              className="px-3 py-2 border rounded"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded p-4">
          <div className="text-sm text-gray-600 mb-2">Preview</div>
          <div className="rounded-lg border bg-white p-4">
            <div className="text-lg font-semibold">{cfg.title}</div>
            <div className="text-gray-700 mt-1">{cfg.message}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
