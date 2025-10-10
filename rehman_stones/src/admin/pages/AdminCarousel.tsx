import { useEffect, useRef, useState } from "react";
import { saveSlides } from "../../utils/slides";
import toast from "react-hot-toast";

type Slide = { id: string; image: string; headline: string; subhead: string };

const KEY = "admin-slides";

function read(): Slide[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

export default function AdminCarousel() {
  const [slides, setSlides] = useState<Slide[]>(read());
  const [f, setF] = useState<Omit<Slide, "id">>({
    image: "",
    headline: "",
    subhead: "",
  });
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // persist to both local key (for admin page reloads) and the site utility
    localStorage.setItem(KEY, JSON.stringify(slides));
    saveSlides(slides);
  }, [slides]);

  function onPickClick() {
    inputRef.current?.click();
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image.");
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setF((x) => ({ ...x, image: dataUrl }));
    toast.success("Image ready");
  }

  async function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed.");
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setF((x) => ({ ...x, image: dataUrl }));
    toast.success("Image ready");
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
  }

  function add() {
    if (!f.image) return toast.error("Please upload an image");
    const s = { id: crypto.randomUUID(), ...f };
    setSlides([s, ...slides]);
    setF({ image: "", headline: "", subhead: "" });
    toast.success("Slide added");
  }

  function del(id: string) {
    setSlides(slides.filter((s) => s.id !== id));
    toast.success("Slide deleted");
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Carousel Management</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6">
          <h3 className="font-medium">Add slide</h3>

          {/* Upload */}
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            className={`mt-4 rounded-xl border-2 border-dashed p-4 grid place-items-center cursor-pointer transition
              ${
                f.image
                  ? "border-emerald-300 bg-emerald-50/40"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            onClick={onPickClick}
            title="Click or drop an image here"
          >
            {f.image ? (
              <img
                src={f.image}
                alt="Preview"
                className="w-full max-h-56 object-contain rounded-lg bg-white"
              />
            ) : (
              <div className="text-center text-gray-600">
                <div className="mx-auto mb-2 w-10 h-10 rounded-lg bg-gray-900/90 text-white grid place-items-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 5v14M5 12h14"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div className="font-medium">Upload slide image</div>
                <div className="text-xs text-gray-500">
                  PNG/JPG, up to a few MB
                </div>
              </div>
            )}

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />
          </div>

          {/* Fields */}
          <div className="mt-4 grid gap-3">
            <L
              label="Headline"
              v={f.headline}
              s={(v) => setF({ ...f, headline: v })}
            />
            <L
              label="Subhead"
              v={f.subhead}
              s={(v) => setF({ ...f, subhead: v })}
            />
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={add}
              className="px-4 py-2 rounded-lg text-white"
              style={{ background: "#111111" }}
            >
              Add Slide
            </button>
            <button
              onClick={() => setF({ image: "", headline: "", subhead: "" })}
              className="px-3 py-2 rounded-lg ring-1 ring-gray-300 hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </div>

        {/* List card */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6">
          <h3 className="font-medium">Slides ({slides.length})</h3>

          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            {slides.map((s) => (
              <div
                key={s.id}
                className="rounded-xl ring-1 ring-gray-200 p-3 bg-white"
              >
                <img
                  src={s.image}
                  className="w-full h-32 object-cover rounded-lg bg-gray-100"
                />
                <div className="mt-2 text-sm font-medium">
                  {s.headline || "—"}
                </div>
                <div className="text-xs text-gray-600">{s.subhead || "—"}</div>
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => del(s.id)}
                    className="text-sm px-3 py-1.5 rounded-lg ring-1 ring-gray-300 hover:bg-gray-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {slides.length === 0 && (
              <div className="text-gray-500 text-sm">
                No custom slides. Home uses defaults.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function L({
  label,
  v,
  s,
}: {
  label: string;
  v: string;
  s: (x: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-600">{label}</label>
      <input
        className="mt-1 w-full rounded-lg ring-1 ring-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-black"
        value={v}
        onChange={(e) => s(e.target.value)}
      />
    </div>
  );
}
