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
      toast.error("Please select an image");
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
      toast.error("Only images allowed");
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
      {/* Info Banner */}
      <div className="bg-blue-50 rounded-xl p-5 ring-1 ring-blue-100 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500 text-white grid place-items-center flex-shrink-0">
          <InfoIcon />
        </div>
        <div>
          <h4 className="font-semibold text-blue-900 mb-1">Home Carousel Management</h4>
          <p className="text-sm text-blue-700">
            Manage slides shown on the home page hero carousel. Add images with optional headlines and subheadings.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(320px,400px)_1fr] gap-6">
        {/* Add Slide Form */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-4 sm:p-6 h-fit lg:sticky lg:top-6">
          <h3 className="font-bold text-lg mb-4">Add New Slide</h3>

          {/* Upload */}
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            className={`rounded-xl border-2 border-dashed p-6 grid place-items-center cursor-pointer transition ${
              f.image ? "border-emerald-400 bg-emerald-50/40" : "border-gray-300 hover:bg-gray-50"
            }`}
            onClick={onPickClick}
          >
            {f.image ? (
              <img src={f.image} alt="Preview" className="w-full max-h-64 object-contain rounded-lg" />
            ) : (
              <div className="text-center text-gray-600">
                <div className="mx-auto mb-3 w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-700 to-black text-white grid place-items-center">
                  <ImageIcon />
                </div>
                <div className="font-semibold">Click or drop image</div>
                <div className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</div>
              </div>
            )}

            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
          </div>

          {/* Fields */}
          <div className="mt-4 space-y-3">
            <Input label="Headline (Optional)" v={f.headline} s={(v) => setF({ ...f, headline: v })} placeholder="Main heading..." />
            <Input label="Subheading (Optional)" v={f.subhead} s={(v) => setF({ ...f, subhead: v })} placeholder="Description..." />
          </div>

          <div className="mt-6 flex items-center gap-2">
            <button
              onClick={add}
              className="flex-1 px-4 py-3 rounded-xl bg-black text-white font-semibold hover:bg-gray-800 transition"
            >
              Add Slide
            </button>
            <button
              onClick={() => setF({ image: "", headline: "", subhead: "" })}
              className="px-4 py-3 rounded-xl ring-1 ring-gray-300 hover:bg-gray-50 font-medium"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Slides List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Carousel Slides ({slides.length})</h3>
          </div>

          {slides.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-12 text-center">
              <div className="text-gray-400 mb-2">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">No slides yet</p>
              <p className="text-gray-500 text-sm mt-1">Add your first slide to customize the home carousel</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {slides.map((s) => (
                <div key={s.id} className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden hover:shadow-md transition group">
                  <div className="aspect-video relative overflow-hidden bg-gray-100">
                    <img src={s.image} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" alt="" />
                    {(s.headline || s.subhead) && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col items-center justify-center text-white p-4">
                        {s.headline && <div className="font-bold text-lg text-center line-clamp-2">{s.headline}</div>}
                        {s.subhead && <div className="text-sm text-center line-clamp-2 opacity-90 mt-1">{s.subhead}</div>}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {s.headline || s.subhead ? (
                          <div className="line-clamp-1">{s.headline || s.subhead}</div>
                        ) : (
                          <span className="italic">No text overlay</span>
                        )}
                      </div>
                      <button
                        onClick={() => del(s.id)}
                        className="px-3 py-1.5 rounded-lg ring-1 ring-gray-300 hover:bg-red-50 hover:ring-red-300 hover:text-red-600 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Input({ label, v, s, placeholder }: { label: string; v: string; s: (x: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        className="w-full rounded-xl ring-1 ring-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-black"
        value={v}
        onChange={(e) => s(e.target.value)}
        placeholder={placeholder}
      />
    </div>
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

function ImageIcon() {
  return (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}
