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
    toast.success("Settings saved successfully");
  }

  return (
    <section className="space-y-6">
      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
        {/* Settings Form */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6">
          <h3 className="font-bold text-lg mb-6">Site Configuration</h3>

          <div className="space-y-6">
            {/* Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <div className="font-semibold text-gray-900">Welcome Modal</div>
                <div className="text-sm text-gray-500">Show welcome popup to visitors</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={cfg.showWelcomeModal}
                  onChange={(e) => setCfg((c) => ({ ...c, showWelcomeModal: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Modal Title</label>
              <input
                className="w-full rounded-xl ring-1 ring-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                value={cfg.title}
                onChange={(e) => setCfg((c) => ({ ...c, title: e.target.value }))}
                placeholder="Enter title..."
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Modal Message</label>
              <textarea
                className="w-full rounded-xl ring-1 ring-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-black min-h-[120px] resize-none"
                value={cfg.message}
                onChange={(e) => setCfg((c) => ({ ...c, message: e.target.value }))}
                placeholder="Enter message..."
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={save}
                className="flex-1 px-6 py-3 rounded-xl bg-black text-white font-semibold hover:bg-gray-800 transition flex items-center justify-center gap-2"
              >
                <SaveIcon />
                Save Changes
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem(KEY);
                  setCfg({
                    showWelcomeModal: false,
                    title: "Welcome to Rehman Stones",
                    message: "Handcrafted rings & certified gemstones.",
                  });
                  toast.success("Reset to defaults");
                }}
                className="flex-1 px-6 py-3 rounded-xl ring-1 ring-gray-300 hover:bg-gray-50 font-medium"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6 h-fit sticky top-6">
          <h3 className="font-bold text-lg mb-4">Live Preview</h3>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 min-h-[200px] flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 mb-2">{cfg.title || "Title"}</div>
                <div className="text-gray-600">{cfg.message || "Message"}</div>
                <button className="mt-4 px-6 py-2 rounded-xl bg-black text-white text-sm font-medium">
                  Got it
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            This is how the welcome modal will appear to visitors when enabled.
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-xl p-5 ring-1 ring-blue-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 text-white grid place-items-center flex-shrink-0">
              <InfoIcon />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">About Settings</h4>
              <p className="text-sm text-blue-700">
                Configure site-wide settings like welcome modals, announcements, and default content.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 rounded-xl p-5 ring-1 ring-amber-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white grid place-items-center flex-shrink-0">
              <WarningIcon />
            </div>
            <div>
              <h4 className="font-semibold text-amber-900 mb-1">Important Note</h4>
              <p className="text-sm text-amber-700">
                Changes take effect immediately. Test in a private/incognito window to see the visitor experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SaveIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );
}
