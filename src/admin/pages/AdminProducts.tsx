import { useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

type Product = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  images: string[];
  category: "ring" | "gemstone" | "bracelet";
  brand: string;
  rating?: number;
  ratingCount?: number;
  stock?: number;
  description?: string;
};

const KEY = "admin-products";

function read(): Product[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
function write(ps: Product[]) {
  localStorage.setItem(KEY, JSON.stringify(ps));
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

export default function AdminProducts() {
  const [items, setItems] = useState<Product[]>(read());
  const [form, setForm] = useState<Omit<Product, "id">>({
    name: "",
    price: 0,
    oldPrice: undefined,
    images: [],
    category: "ring",
    brand: "Rehman Stones",
    rating: undefined,
    ratingCount: undefined,
    stock: 1,
    description: "",
  });

  const pickRef = useRef<HTMLInputElement | null>(null);
  const importRef = useRef<HTMLInputElement | null>(null);

  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<"all" | "ring" | "gemstone" | "bracelet">("all");
  const [sort, setSort] = useState<"newest" | "priceAsc" | "priceDesc" | "name">("newest");
  const [editing, setEditing] = useState<Product | null>(null);

  function openPicker() {
    pickRef.current?.click();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const imageUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) {
        toast.error("Please select only images");
        continue;
      }
      const dataUrl = await fileToDataUrl(file);
      imageUrls.push(dataUrl);
    }
    
    setForm((f) => ({ ...f, images: [...f.images, ...imageUrls] }));
    toast.success(`${imageUrls.length} image(s) added`);
  }

  async function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    const imageUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files allowed");
        continue;
      }
      const dataUrl = await fileToDataUrl(file);
      imageUrls.push(dataUrl);
    }
    
    setForm((f) => ({ ...f, images: [...f.images, ...imageUrls] }));
    toast.success(`${imageUrls.length} image(s) added`);
  }
  
  function removeImage(index: number) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  }

  function allowDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function add() {
    if (!form.name || form.images.length === 0 || !form.price) {
      toast.error("Please fill all required fields (name, images, price)");
      return;
    }
    const next = [{ id: crypto.randomUUID(), ...form }, ...items];
    setItems(next);
    write(next);
    toast.success("Product added");
    setForm({ 
      name: "", 
      price: 0, 
      oldPrice: undefined,
      images: [], 
      category: "ring", 
      brand: "Rehman Stones",
      rating: undefined,
      ratingCount: undefined,
      stock: 1,
      description: "",
    });
  }

  function remove(id: string) {
    const next = items.filter((p) => p.id !== id);
    setItems(next);
    write(next);
    toast.success("Product removed");
  }

  function onExport() {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function onImportClick() {
    importRef.current?.click();
  }

  function onImportChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fr = new FileReader();
    fr.onload = () => {
      try {
        const parsed = JSON.parse(String(fr.result));
        if (!Array.isArray(parsed)) throw new Error("Invalid format");
        const normalized: Product[] = parsed.map((p: any) => ({
          id: String(p.id ?? crypto.randomUUID()),
          name: String(p.name ?? "Unnamed"),
          price: Number(p.price ?? 0),
          oldPrice: p.oldPrice ? Number(p.oldPrice) : undefined,
          images: Array.isArray(p.images) ? p.images : p.image ? [p.image] : [],
          category: p.category === "gemstone" ? "gemstone" : p.category === "bracelet" ? "bracelet" : "ring",
          brand: String(p.brand ?? "Rehman Stones"),
          rating: p.rating ? Number(p.rating) : undefined,
          ratingCount: p.ratingCount ? Number(p.ratingCount) : undefined,
          stock: typeof p.stock === "number" ? p.stock : 0,
          description: String(p.description ?? ""),
        }));
        setItems(normalized);
        write(normalized);
        toast.success("Products imported");
      } catch {
        toast.error("Failed to import");
      } finally {
        e.currentTarget.value = "";
      }
    };
    fr.onerror = () => toast.error("Failed to read file");
    fr.readAsText(file);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = items.filter(
      (p) => (cat === "all" || p.category === cat) && (!q || p.name.toLowerCase().includes(q))
    );
    if (sort === "priceAsc") list.sort((a, b) => a.price - b.price);
    else if (sort === "priceDesc") list.sort((a, b) => b.price - a.price);
    else if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [items, query, cat, sort]);

  const [showPreview, setShowPreview] = useState(true);
  const [activeTab, setActiveTab] = useState<"add" | "view">("view");

  function openPreviewInNewTab() {
    // Store preview data in localStorage temporarily
    const previewData = {
      ...form,
      timestamp: Date.now(),
    };
    localStorage.setItem('admin-preview-product', JSON.stringify(previewData));
    
    // Open preview in new tab
    const previewUrl = `${window.location.origin}/admin/preview-product`;
    window.open(previewUrl, '_blank');
  }

  return (
    <section className="space-y-6">
      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("add")}
            className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "add"
                ? "bg-black text-white shadow-md"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add New Product
          </button>
          <button
            onClick={() => setActiveTab("view")}
            className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "view"
                ? "bg-black text-white shadow-md"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            View All Products
            <span className="bg-white text-black px-2 py-0.5 rounded-full text-xs font-bold">
              {items.length}
            </span>
          </button>
        </div>
      </div>

      {/* Add Product Section */}
      {activeTab === "add" && (
        <>
          {/* Header with actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Create New Product</h2>
              <p className="text-sm text-gray-500 mt-1">Fill in the details below to add a new product</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2 rounded-xl ring-1 ring-gray-300 hover:bg-gray-50 text-sm font-medium flex items-center gap-2"
              >
                <EyeIcon />
                {showPreview ? "Hide" : "Show"} Preview
              </button>
              <button
                onClick={openPreviewInNewTab}
                className="px-4 py-2 rounded-xl ring-1 ring-gray-300 hover:bg-gray-50 text-sm font-medium flex items-center gap-2"
              >
                <ExternalLinkIcon />
                Open in New Tab
              </button>
            </div>
          </div>

          <div className={`grid ${showPreview ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-6`}>
            {/* Add Product Form */}
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-4 sm:p-6 h-fit lg:sticky lg:top-6">
              <h3 className="font-bold text-xl mb-6">Product Details</h3>

          {/* Image Uploader */}
          <div className="space-y-3 mb-4">
            <label className="block text-sm font-medium text-gray-700">Product Images *</label>
            <div
              className={`rounded-xl border-2 border-dashed p-6 grid place-items-center cursor-pointer transition ${
                form.images.length > 0 ? "border-emerald-400 bg-emerald-50/40" : "border-gray-300 hover:bg-gray-50"
              }`}
              onClick={openPicker}
              onDrop={handleDrop}
              onDragOver={allowDrop}
            >
              <div className="text-center text-gray-600">
                <div className="mx-auto mb-3 w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-700 to-black text-white grid place-items-center">
                  <ImageIcon />
                </div>
                <div className="font-semibold">Click or drop images</div>
                <div className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB (multiple allowed)</div>
              </div>
              <input ref={pickRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFile} />
            </div>
            
            {/* Image Thumbnails */}
            {form.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {form.images.map((img, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(idx);
                      }}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fields */}
          <div className="space-y-4">
            <Input 
              label="Product Name *" 
              value={form.name} 
              onChange={(v) => setForm({ ...form, name: v })} 
              placeholder="E.g. Silver Band Ring" 
            />
            
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Price (PKR) *"
                type="number"
                value={String(form.price)}
                onChange={(v) => setForm({ ...form, price: Number(v) || 0 })}
                placeholder="0"
              />
              <Input
                label="Old Price (PKR)"
                type="number"
                value={String(form.oldPrice ?? "")}
                onChange={(v) => setForm({ ...form, oldPrice: v ? Number(v) : undefined })}
                placeholder="Optional"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  className="w-full rounded-xl ring-1 ring-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-black bg-white"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as "ring" | "gemstone" | "bracelet" })}
                >
                  <option value="ring">Ring</option>
                  <option value="bracelet">Bracelet</option>
                  <option value="gemstone">Gemstone</option>
                </select>
              </div>
              <Input
                label="Stock"
                type="number"
                value={String(form.stock ?? 0)}
                onChange={(v) => setForm({ ...form, stock: Number(v) || 0 })}
                placeholder="0"
              />
            </div>
            
            <Input 
              label="Brand" 
              value={form.brand} 
              onChange={(v) => setForm({ ...form, brand: v })} 
              placeholder="Rehman Stones" 
            />
            
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Rating (0-5)"
                type="number"
                value={String(form.rating ?? "")}
                onChange={(v) => setForm({ ...form, rating: v ? Math.min(5, Math.max(0, Number(v))) : undefined })}
                placeholder="4.5"
              />
              <Input
                label="Rating Count"
                type="number"
                value={String(form.ratingCount ?? "")}
                onChange={(v) => setForm({ ...form, ratingCount: v ? Number(v) : undefined })}
                placeholder="100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full rounded-xl ring-1 ring-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-black resize-none"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief product description..."
                rows={3}
              />
            </div>
          </div>

              <div className="mt-6 flex items-center gap-2">
                <button
                  onClick={() => {
                    add();
                    setActiveTab("view");
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-black text-white font-semibold hover:bg-gray-800 transition flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Add Product
                </button>
                <button
                  onClick={() => setForm({ 
                    name: "", 
                    price: 0, 
                    oldPrice: undefined,
                    images: [], 
                    category: "ring", 
                    brand: "Rehman Stones",
                    rating: undefined,
                    ratingCount: undefined,
                    stock: 1,
                    description: "",
                  })}
                  className="px-4 py-3 rounded-xl ring-1 ring-gray-300 hover:bg-gray-50 font-medium"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Live Preview - Product Page Style */}
            {showPreview && (
              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-4 sm:p-6 h-fit lg:sticky lg:top-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-xl">Live Preview</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Customer View</span>
                </div>
            
            <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
              {/* Product Image */}
              <div className="relative bg-gray-50 rounded-xl overflow-hidden border border-gray-200 aspect-square">
                {form.images.length > 0 ? (
                  <>
                    <img
                      src={form.images[0]}
                      alt={form.name || "Product"}
                      className="w-full h-full object-contain p-8"
                    />
                    {form.oldPrice && form.price && (
                      <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {Math.round(((form.oldPrice - form.price) / form.oldPrice) * 100)}% OFF
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <ImageIcon />
                      <p className="mt-2 text-sm">No image uploaded</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {form.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {form.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 flex-shrink-0"
                    >
                      <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {/* Product Details */}
              <div className="space-y-4">
                {/* Category & Brand */}
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold uppercase rounded-full">
                    {form.category}
                  </span>
                  {form.brand && (
                    <span className="text-sm text-gray-600">by {form.brand}</span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-black">
                  {form.name || "Product Name"}
                </h1>

                {/* Rating */}
                {(form.rating || form.ratingCount) && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${i < Math.floor(form.rating || 0) ? "text-yellow-500" : "text-gray-300"}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {form.rating ? form.rating.toFixed(1) : "0.0"} ({form.ratingCount || 0} reviews)
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="border-t border-b border-gray-200 py-4">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-black">
                      Rs. {form.price.toLocaleString("en-PK")}
                    </span>
                    {form.oldPrice && (
                      <>
                        <span className="text-xl text-gray-400 line-through">
                          Rs. {form.oldPrice.toLocaleString("en-PK")}
                        </span>
                        <span className="text-green-600 font-semibold text-sm">
                          Save Rs. {(form.oldPrice - form.price).toLocaleString("en-PK")}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Inclusive of all taxes</p>
                </div>

                {/* Size Selection (Rings only) */}
                {form.category === "ring" && (
                  <div>
                    <label className="font-semibold text-black block mb-3">Select Size</label>
                    <div className="grid grid-cols-10 gap-1">
                      {[...Array(10)].map((_, i) => {
                        const s = i + 11;
                        return (
                          <div
                            key={s}
                            className="h-8 rounded-md font-semibold text-xs bg-gray-100 text-gray-700 flex items-center justify-center"
                          >
                            {s}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Sizes 11-40 available</p>
                  </div>
                )}

                {/* Stock */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">Stock:</span>
                  <span className={form.stock && form.stock > 0 ? "text-green-600" : "text-red-600"}>
                    {form.stock || 0} units
                  </span>
                </div>

                {/* Description */}
                {form.description && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-black mb-2">Description</h4>
                    <p className="text-sm text-gray-700">{form.description}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <button
                    className="w-full py-3 bg-black text-white font-bold rounded-lg flex items-center justify-center gap-2"
                    disabled
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Add to Cart
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      className="py-2.5 bg-gray-800 text-white font-semibold rounded-lg"
                      disabled
                    >
                      Buy Now
                    </button>
                    <button
                      className="py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg"
                      disabled
                    >
                      ♥ Save
                    </button>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-200 mt-4">
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Free shipping on orders over Rs. 10,000</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>100% authentic & certified</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>7-day easy returns & exchanges</span>
                  </div>
                </div>
              </div>
            </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* View All Products Section */}
      {activeTab === "view" && (
        <>
          {/* Header with actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">All Products</h2>
              <p className="text-sm text-gray-500 mt-1">Total Products: {items.length}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onExport}
                className="px-4 py-2 rounded-xl ring-1 ring-gray-300 hover:bg-gray-50 text-sm font-medium flex items-center gap-2"
              >
                <DownloadIcon />
                Export
              </button>
              <button
                onClick={onImportClick}
                className="px-4 py-2 rounded-xl ring-1 ring-gray-300 hover:bg-gray-50 text-sm font-medium flex items-center gap-2"
              >
                <UploadIcon />
                Import
              </button>
              <input ref={importRef} type="file" accept="application/json" className="hidden" onChange={onImportChange} />
            </div>
          </div>

          <div className="space-y-4">
            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-4">
              <div className="grid sm:grid-cols-[1fr_auto_auto] gap-3">
                <div className="relative">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full rounded-xl ring-1 ring-gray-300 pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-black"
                  />
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <select
                  className="rounded-xl ring-1 ring-gray-300 px-4 py-2.5 bg-white outline-none focus:ring-2 focus:ring-black"
                  value={cat}
                  onChange={(e) => setCat(e.target.value as any)}
                >
                <option value="all">All Categories</option>
                <option value="ring">Rings</option>
                <option value="bracelet">Bracelets</option>
                <option value="gemstone">Gemstones</option>
                </select>
                <select
                  className="rounded-xl ring-1 ring-gray-300 px-4 py-2.5 bg-white outline-none focus:ring-2 focus:ring-black"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as any)}
                >
                  <option value="newest">Newest First</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="name">Name A–Z</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-12 text-center">
                <div className="text-gray-400 mb-2">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium">No products found</p>
                <p className="text-gray-500 text-sm mt-1">Add your first product or adjust filters</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((p) => (
                  <div key={p.id} className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden hover:shadow-md transition group">
                    <div className="aspect-square relative overflow-hidden bg-gray-100">
                      <img 
                        src={p.images?.[0] || ""} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                        alt={p.name} 
                      />
                      <div className="absolute top-2 right-2">
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            p.category === "ring" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {p.category}
                        </span>
                      </div>
                      {p.oldPrice && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                          {Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)}% OFF
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 line-clamp-2 mb-1">{p.name}</h4>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="text-lg font-bold text-gray-900">Rs. {p.price.toLocaleString("en-PK")}</div>
                          {p.oldPrice && (
                            <div className="text-xs text-gray-400 line-through">Rs. {p.oldPrice.toLocaleString("en-PK")}</div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">Stock: {p.stock ?? 0}</div>
                      </div>
                      {p.rating && (
                        <div className="flex items-center gap-1 mb-3">
                          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-xs text-gray-600">{p.rating} ({p.ratingCount})</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditing(p)}
                          className="flex-1 px-3 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => remove(p.id)}
                          className="px-3 py-2 rounded-lg ring-1 ring-gray-300 hover:bg-red-50 hover:ring-red-300 hover:text-red-600 text-sm font-medium"
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
        </>
      )}

      {/* Edit Modal */}
      {editing && (
        <EditModal
          product={editing}
          onClose={() => setEditing(null)}
          onSave={(upd) => {
            setItems((prev) => {
              const next = prev.map((it) => (it.id === upd.id ? upd : it));
              write(next);
              return next;
            });
            toast.success("Product updated");
            setEditing(null);
          }}
        />
      )}
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        className="w-full rounded-xl ring-1 ring-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-black"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
      />
    </div>
  );
}

function EditModal({ product, onClose, onSave }: { product: Product; onClose: () => void; onSave: (p: Product) => void }) {
  const [state, setState] = useState<Product>({ ...product });
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function pickImage() {
    fileRef.current?.click();
  }
  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const imageUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) {
        toast.error("Please select only images");
        continue;
      }
      const dataUrl = await fileToDataUrl(file);
      imageUrls.push(dataUrl);
    }
    
    setState((s) => ({ ...s, images: [...s.images, ...imageUrls] }));
  }
  
  function removeImage(index: number) {
    setState((s) => ({ ...s, images: s.images.filter((_, i) => i !== index) }));
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between z-10">
            <h3 className="text-xl font-bold">Edit Product</h3>
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
          <div className="p-6 space-y-4">
            <div
              className="rounded-xl border-2 border-dashed p-6 grid place-items-center cursor-pointer hover:bg-gray-50"
              onClick={pickImage}
            >
              <div className="text-center text-gray-600">
                <ImageIcon />
                <p className="mt-2 text-sm">Click to add more images</p>
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onPick} />
            </div>
            
            {state.images && state.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {state.images.map((img, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                    <img src={img} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(idx);
                      }}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Name" value={state.name} onChange={(v) => setState({ ...state, name: v })} />
              <Input label="Brand" value={state.brand} onChange={(v) => setState({ ...state, brand: v })} />
              <Input
                label="Price (PKR)"
                type="number"
                value={String(state.price)}
                onChange={(v) => setState({ ...state, price: Number(v) || 0 })}
              />
              <Input
                label="Old Price (PKR)"
                type="number"
                value={String(state.oldPrice ?? "")}
                onChange={(v) => setState({ ...state, oldPrice: v ? Number(v) : undefined })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  className="w-full rounded-xl ring-1 ring-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-black"
                  value={state.category}
                  onChange={(e) => setState({ ...state, category: e.target.value as any })}
                >
                  <option value="ring">Ring</option>
                  <option value="bracelet">Bracelet</option>
                  <option value="gemstone">Gemstone</option>
                </select>
              </div>
              <Input
                label="Stock"
                type="number"
                value={String(state.stock ?? 0)}
                onChange={(v) => setState({ ...state, stock: Number(v) || 0 })}
              />
              <Input
                label="Rating (0-5)"
                type="number"
                value={String(state.rating ?? "")}
                onChange={(v) => setState({ ...state, rating: v ? Math.min(5, Math.max(0, Number(v))) : undefined })}
              />
              <Input
                label="Rating Count"
                type="number"
                value={String(state.ratingCount ?? "")}
                onChange={(v) => setState({ ...state, ratingCount: v ? Number(v) : undefined })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full rounded-xl ring-1 ring-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-black resize-none"
                value={state.description || ""}
                onChange={(e) => setState({ ...state, description: e.target.value })}
                placeholder="Brief product description..."
                rows={3}
              />
            </div>
          </div>
          <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
            <button className="px-5 py-2.5 rounded-xl ring-1 ring-gray-300 hover:bg-gray-50 font-medium" onClick={onClose}>
              Cancel
            </button>
            <button className="px-5 py-2.5 rounded-xl bg-black text-white font-semibold hover:bg-gray-800" onClick={() => onSave(state)}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Icons */
function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L9 8m4-4v12" />
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

function EyeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}
