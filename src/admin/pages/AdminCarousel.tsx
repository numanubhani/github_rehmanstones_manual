import { useEffect, useRef, useState } from "react";
import { saveSlides } from "../../utils/slides";
import toast from "react-hot-toast";

type Slide = { 
  id: string; 
  image: string; 
  headline: string; 
  subhead: string;
  type?: "image" | "video"; // Add type field
};

const KEY = "admin-slides";

function read(): Slide[] {
  try {
    const data = localStorage.getItem(KEY);
    if (!data) return [];
    
    const slides = JSON.parse(data);
    // Ensure all slides have a type property (backward compatibility)
    const validSlides = slides.map((s: Slide) => ({
      ...s,
      type: s.type || "image" // Default to "image" if type is missing
    }));
    
    console.log(`Loaded ${validSlides.length} slides from storage`);
    return validSlides;
  } catch (error) {
    console.error("Error reading slides:", error);
    // Clear corrupted data
    localStorage.removeItem(KEY);
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
    type: "image",
  });
  const [editing, setEditing] = useState<Slide | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [storageUsage, setStorageUsage] = useState(0);
  const [useUrl, setUseUrl] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Calculate storage usage
  useEffect(() => {
    try {
      const data = JSON.stringify(slides);
      const sizeInMB = new Blob([data]).size / 1024 / 1024;
      setStorageUsage(sizeInMB);
    } catch {
      setStorageUsage(0);
    }
  }, [slides]);

  useEffect(() => {
    // Don't save if slides array is empty and localStorage is already empty
    if (slides.length === 0 && !localStorage.getItem(KEY)) {
      return;
    }
    
    try {
      const data = JSON.stringify(slides);
      // Check size (localStorage limit varies by browser, aiming for 50MB)
      const sizeInMB = new Blob([data]).size / 1024 / 1024;
      
      console.log(`Attempting to save ${slides.length} slides (${sizeInMB.toFixed(2)}MB)`);
      
      if (sizeInMB > 50) {
        toast.error("Storage limit reached (50MB)! Please use smaller images/videos or reduce the number of slides.");
        return;
      }
      
      localStorage.setItem(KEY, data);
      saveSlides(slides);
      console.log(`Successfully saved ${slides.length} slides`);
    } catch (error: any) {
      if (error.name === 'QuotaExceededError') {
        toast.error("Browser storage quota exceeded! Your browser limits localStorage. Please use the URL option for large videos.");
        console.error("Storage quota exceeded. Current slides size is too large for browser.");
        // Remove the last added slide if quota exceeded
        if (slides.length > 0) {
          setSlides(slides.slice(0, -1));
          toast.error("Last slide removed due to browser storage limits. Use URL option for large files.");
        }
      } else {
        toast.error("Failed to save slides");
        console.error("Error saving slides:", error);
      }
    }
  }, [slides]);

  function onPickClick() {
    inputRef.current?.click();
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    
    if (!isImage && !isVideo) {
      toast.error("Please select an image or video");
      return;
    }
    
    // Check file size - increased limits
    const maxSize = isVideo ? 30 : 10; // MB (30MB for videos, 10MB for images)
    const fileSizeMB = file.size / 1024 / 1024;
    
    if (fileSizeMB > maxSize) {
      toast.error(`File too large! ${isVideo ? 'Videos' : 'Images'} should be under ${maxSize}MB. Current: ${fileSizeMB.toFixed(2)}MB`);
      return;
    }
    
    const dataUrl = await fileToDataUrl(file);
    const encodedSizeMB = new Blob([dataUrl]).size / 1024 / 1024;
    console.log(`File size: ${fileSizeMB.toFixed(2)}MB, Encoded size: ${encodedSizeMB.toFixed(2)}MB`);
    
    // Warning if encoded size is large
    if (encodedSizeMB > 20) {
      toast(`Large file (${encodedSizeMB.toFixed(2)}MB). This may hit browser storage limits. URL option recommended.`, { 
        icon: '⚠️',
        duration: 5000 
      });
    } else if (encodedSizeMB > 10) {
      toast(`File size: ${encodedSizeMB.toFixed(2)}MB. May affect performance.`, { icon: '📊' });
    }
    
    setF((x) => ({ 
      ...x, 
      image: dataUrl,
      type: isVideo ? "video" : "image"
    }));
    toast.success(`${isVideo ? 'Video' : 'Image'} ready (${encodedSizeMB.toFixed(2)}MB encoded)`);
  }

  async function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    
    if (!isImage && !isVideo) {
      toast.error("Only images and videos allowed");
      return;
    }
    
    // Check file size - increased limits
    const maxSize = isVideo ? 10 : 5; // MB
    const fileSizeMB = file.size / 1024 / 1024;
    
    if (fileSizeMB > maxSize) {
      toast.error(`File too large! ${isVideo ? 'Videos' : 'Images'} should be under ${maxSize}MB. Current: ${fileSizeMB.toFixed(2)}MB`);
      return;
    }
    
    const dataUrl = await fileToDataUrl(file);
    const encodedSizeMB = new Blob([dataUrl]).size / 1024 / 1024;
    
    if (encodedSizeMB > 8) {
      toast.error(`Encoded file too large! After encoding: ${encodedSizeMB.toFixed(2)}MB. This might cause storage issues. Consider using URL option instead.`);
      return;
    }
    
    if (encodedSizeMB > 6) {
      toast(`Warning: Large file (${encodedSizeMB.toFixed(2)}MB). May cause performance issues.`, { icon: '⚠️' });
    }
    
    setF((x) => ({ 
      ...x, 
      image: dataUrl,
      type: isVideo ? "video" : "image"
    }));
    toast.success(`${isVideo ? 'Video' : 'Image'} ready (${encodedSizeMB.toFixed(2)}MB encoded)`);
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
  }

  function add() {
    if (!f.image) return toast.error("Please upload an image or video");
    const s = { id: crypto.randomUUID(), ...f };
    setSlides([s, ...slides]);
    setF({ image: "", headline: "", subhead: "", type: "image" });
    toast.success("Slide added");
  }

  function del(id: string) {
    setSlides(slides.filter((s) => s.id !== id));
    toast.success("Slide deleted");
  }

  function updateSlide(updated: Slide) {
    setSlides(slides.map((s) => (s.id === updated.id ? updated : s)));
    toast.success("Slide updated");
    setEditing(null);
  }

  function handleDragStart(index: number) {
    setDraggedIndex(index);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>, index: number) {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === index) return;

    const newSlides = [...slides];
    const draggedSlide = newSlides[draggedIndex];
    
    // Remove from old position
    newSlides.splice(draggedIndex, 1);
    // Insert at new position
    newSlides.splice(index, 0, draggedSlide);
    
    setSlides(newSlides);
    setDraggedIndex(index);
  }

  function handleDragEnd() {
    setDraggedIndex(null);
    toast.success("Slides reordered");
  }

  return (
    <section className="space-y-6">
      {/* Error Banner - shown when storage issues detected */}
      {slides.length === 0 && localStorage.getItem(KEY) && (
        <div className="bg-red-50 rounded-xl p-5 ring-1 ring-red-200 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500 text-white grid place-items-center flex-shrink-0">
            ⚠️
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-red-900 mb-1">Storage Error Detected</h4>
            <p className="text-sm text-red-700 mb-3">
              Your carousel data may be corrupted or too large. Click below to reset.
            </p>
            <button
              onClick={() => {
                localStorage.removeItem(KEY);
                window.location.reload();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 text-sm"
            >
              Reset Carousel Data
            </button>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 rounded-xl p-5 ring-1 ring-blue-100 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500 text-white grid place-items-center flex-shrink-0">
          <InfoIcon />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-blue-900 mb-1">Home Carousel Management</h4>
          <p className="text-sm text-blue-700">
            Manage slides shown on the home page hero carousel. Add images or videos with optional headlines and subheadings.
          </p>
          <div className="mt-3 grid sm:grid-cols-2 gap-2">
            <div className="bg-white/50 rounded-lg p-3 border border-blue-200">
              <p className="text-xs font-semibold text-blue-900 mb-1">📁 Upload Files</p>
              <p className="text-xs text-blue-700">
                Images up to 10MB, Videos up to 30MB. Total storage: 50MB.
              </p>
            </div>
            <div className="bg-white/50 rounded-lg p-3 border border-blue-200">
              <p className="text-xs font-semibold text-blue-900 mb-1">🔗 Use URLs (For Very Large Files)</p>
              <p className="text-xs text-blue-700">
                No size limits! Bypass browser storage restrictions entirely.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(320px,400px)_1fr] gap-6">
        {/* Add Slide Form */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-4 sm:p-6 h-fit lg:sticky lg:top-6">
          <h3 className="font-bold text-lg mb-4">Add New Slide</h3>

          {/* Toggle between Upload and URL */}
          <div className="mb-4 flex items-center gap-2 bg-gray-50 rounded-lg p-1">
            <button
              onClick={() => setUseUrl(false)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                !useUrl ? "bg-white shadow-sm text-black" : "text-gray-600"
              }`}
            >
              Upload File
            </button>
            <button
              onClick={() => setUseUrl(true)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                useUrl ? "bg-white shadow-sm text-black" : "text-gray-600"
              }`}
            >
              Use URL
            </button>
          </div>

          {/* Upload or URL Input */}
          {useUrl ? (
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Media URL</label>
                <input
                  type="url"
                  className="w-full rounded-xl ring-1 ring-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-black"
                  value={f.image}
                  onChange={(e) => setF({ ...f, image: e.target.value })}
                  placeholder="https://example.com/image.jpg or video.mp4"
                />
                <p className="text-xs text-gray-500 mt-1">Enter image or video URL (no file size limits!)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Media Type</label>
                <select
                  className="w-full rounded-xl ring-1 ring-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-black bg-white"
                  value={f.type}
                  onChange={(e) => setF({ ...f, type: e.target.value as "image" | "video" })}
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>
              {/* Preview for URL */}
              {f.image && (
                <div className="aspect-video relative overflow-hidden rounded-xl bg-gray-100 border border-gray-200">
                  {f.type === "video" ? (
                    <video src={f.image} className="w-full h-full object-cover" controls />
                  ) : (
                    <img src={f.image} className="w-full h-full object-cover" alt="Preview" />
                  )}
                </div>
              )}
            </div>
          ) : (
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              className={`rounded-xl border-2 border-dashed p-6 grid place-items-center cursor-pointer transition ${
                f.image ? "border-emerald-400 bg-emerald-50/40" : "border-gray-300 hover:bg-gray-50"
              }`}
              onClick={onPickClick}
            >
            {f.image ? (
              (f.type === "video") ? (
                <video key={f.image} src={f.image} className="w-full max-h-64 object-contain rounded-lg" controls />
              ) : (
                <img src={f.image} alt="Preview" className="w-full max-h-64 object-contain rounded-lg" />
              )
            ) : (
              <div className="text-center text-gray-600">
                <div className="mx-auto mb-3 w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-700 to-black text-white grid place-items-center">
                  <MediaIcon />
                </div>
                <div className="font-semibold">Click or drop image/video</div>
                <div className="text-xs text-gray-500 mt-1">
                  <div>Images: PNG, JPG (max 10MB)</div>
                  <div>Videos: MP4, WebM (max 30MB)</div>
                  <div className="text-blue-600 mt-1">💡 URL option available for even larger files</div>
                </div>
              </div>
            )}

            <input ref={inputRef} type="file" accept="image/*,video/*" className="hidden" onChange={onFileChange} />
            </div>
          )}

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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-lg">Carousel Slides ({slides.length})</h3>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-500">
                    Storage: {storageUsage.toFixed(2)}MB / 50MB
                  </div>
                  <div className="flex-1 max-w-[200px] h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        storageUsage > 40 ? 'bg-red-500' : 
                        storageUsage > 25 ? 'bg-amber-500' : 
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min((storageUsage / 50) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                {slides.length > 1 && (
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                    Drag to reorder
                  </div>
                )}
              </div>
            </div>
            {slides.length > 0 && (
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to delete all slides?")) {
                    setSlides([]);
                    localStorage.removeItem(KEY);
                    toast.success("All slides deleted");
                  }
                }}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 ring-1 ring-red-200"
              >
                Clear All
              </button>
            )}
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
              {slides.map((s, index) => (
                <div 
                  key={s.id} 
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden hover:shadow-md transition group cursor-move ${
                    draggedIndex === index ? 'opacity-50 scale-95' : ''
                  }`}
                >
                  <div className="aspect-video relative overflow-hidden bg-gray-100">
                    {(s.type === "video") ? (
                      <video key={s.id} src={s.image} className="w-full h-full object-cover" muted loop playsInline />
                    ) : (
                      <img src={s.image} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" alt="" />
                    )}
                    {(s.headline || s.subhead) && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col items-center justify-center text-white p-4">
                        {s.headline && <div className="font-bold text-lg text-center line-clamp-2">{s.headline}</div>}
                        {s.subhead && <div className="text-sm text-center line-clamp-2 opacity-90 mt-1">{s.subhead}</div>}
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-2">
                      {/* Slide Number */}
                      <div className="bg-black/70 text-white px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                        #{index + 1}
                      </div>
                      {/* Video Badge */}
                      {s.type === "video" && (
                        <div className="bg-blue-600/90 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                          </svg>
                          Video
                        </div>
                      )}
                    </div>
                    
                    {/* Drag Handle */}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                      Drag
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">
                        {s.headline || s.subhead ? (
                          <div className="line-clamp-1">{s.headline || s.subhead}</div>
                        ) : (
                          <span className="italic">No text overlay</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditing(s)}
                          className="flex-1 px-3 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => del(s.id)}
                          className="px-3 py-2 rounded-lg ring-1 ring-gray-300 hover:bg-red-50 hover:ring-red-300 hover:text-red-600 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <EditSlideModal
          slide={editing}
          onClose={() => setEditing(null)}
          onSave={updateSlide}
        />
      )}
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

function MediaIcon() {
  return (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
      />
    </svg>
  );
}

function EditSlideModal({
  slide,
  onClose,
  onSave,
}: {
  slide: Slide;
  onClose: () => void;
  onSave: (s: Slide) => void;
}) {
  const [state, setState] = useState<Slide>({ ...slide });
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [useUrl, setUseUrl] = useState(!state.image.startsWith('data:'));

  async function pickImage() {
    fileRef.current?.click();
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    
    if (!isImage && !isVideo) {
      toast.error("Please select an image or video");
      return;
    }
    
    // Check file size - increased limits
    const maxSize = isVideo ? 30 : 10; // MB (30MB for videos, 10MB for images)
    const fileSizeMB = file.size / 1024 / 1024;
    
    if (fileSizeMB > maxSize) {
      toast.error(`File too large! ${isVideo ? 'Videos' : 'Images'} should be under ${maxSize}MB. Current: ${fileSizeMB.toFixed(2)}MB`);
      return;
    }
    
    const dataUrl = await fileToDataUrl(file);
    const encodedSizeMB = new Blob([dataUrl]).size / 1024 / 1024;
    
    if (encodedSizeMB > 20) {
      toast(`Large file (${encodedSizeMB.toFixed(2)}MB). This may hit browser storage limits. URL option recommended.`, { 
        icon: '⚠️',
        duration: 5000 
      });
    } else if (encodedSizeMB > 10) {
      toast(`File size: ${encodedSizeMB.toFixed(2)}MB. May affect performance.`, { icon: '📊' });
    }
    
    setState((s) => ({ 
      ...s, 
      image: dataUrl,
      type: isVideo ? "video" : "image"
    }));
    toast.success(`${isVideo ? 'Video' : 'Image'} updated (${encodedSizeMB.toFixed(2)}MB encoded)`);
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between z-10 rounded-t-2xl">
            <h3 className="text-xl font-bold">Edit Carousel Slide</h3>
            <button
              className="w-10 h-10 grid place-items-center rounded-xl ring-1 ring-gray-300 hover:bg-gray-50"
              onClick={onClose}
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Toggle between Upload and URL */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
              <button
                onClick={() => setUseUrl(false)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  !useUrl ? "bg-white shadow-sm text-black" : "text-gray-600"
                }`}
              >
                Upload File
              </button>
              <button
                onClick={() => setUseUrl(true)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  useUrl ? "bg-white shadow-sm text-black" : "text-gray-600"
                }`}
              >
                Use URL
              </button>
            </div>

            {/* Media Upload or URL */}
            {useUrl ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Media URL</label>
                  <input
                    type="url"
                    className="w-full rounded-xl ring-1 ring-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-black"
                    value={state.image}
                    onChange={(e) => setState({ ...state, image: e.target.value })}
                    placeholder="https://example.com/image.jpg or video.mp4"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter image or video URL (no file size limits!)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Media Type</label>
                  <select
                    className="w-full rounded-xl ring-1 ring-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-black bg-white"
                    value={state.type}
                    onChange={(e) => setState({ ...state, type: e.target.value as "image" | "video" })}
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slide Media (Image or Video)</label>
                <div
                  className="rounded-xl border-2 border-dashed border-gray-300 p-6 grid place-items-center cursor-pointer hover:bg-gray-50 transition"
                  onClick={pickImage}
                >
                  {state.image ? (
                    (state.type === "video") ? (
                      <video key={state.image} src={state.image} className="w-full max-h-64 object-contain rounded-lg" controls />
                    ) : (
                      <img src={state.image} className="w-full max-h-64 object-contain rounded-lg" alt="Slide preview" />
                    )
                  ) : (
                    <div className="text-center text-gray-600">
                      <MediaIcon />
                      <p className="mt-2 text-sm">Click to change media</p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={onPick} />
                </div>
                {state.type === "video" && (
                  <p className="text-xs text-gray-500 mt-2">💡 Videos will autoplay and loop on the carousel</p>
                )}
              </div>
            )}

            {/* Text Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Headline (Optional)</label>
                <input
                  className="w-full rounded-xl ring-1 ring-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-black"
                  value={state.headline}
                  onChange={(e) => setState({ ...state, headline: e.target.value })}
                  placeholder="Main heading..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subheading (Optional)</label>
                <input
                  className="w-full rounded-xl ring-1 ring-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-black"
                  value={state.subhead}
                  onChange={(e) => setState({ ...state, subhead: e.target.value })}
                  placeholder="Description..."
                />
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
              <div className="aspect-video relative overflow-hidden rounded-xl bg-gray-100 border border-gray-200">
                {(state.type === "video") ? (
                  <video key={state.image} src={state.image} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                ) : (
                  <img src={state.image} className="w-full h-full object-cover" alt="Preview" />
                )}
                {(state.headline || state.subhead) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col items-center justify-center text-white p-4">
                    {state.headline && (
                      <div className="font-bold text-2xl text-center mb-2">{state.headline}</div>
                    )}
                    {state.subhead && (
                      <div className="text-lg text-center opacity-90">{state.subhead}</div>
                    )}
                  </div>
                )}
                {state.type === "video" && (
                  <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                    Video
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 rounded-b-2xl">
            <button
              className="px-5 py-2.5 rounded-xl ring-1 ring-gray-300 hover:bg-gray-50 font-medium"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-5 py-2.5 rounded-xl bg-black text-white font-semibold hover:bg-gray-800"
              onClick={() => onSave(state)}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
