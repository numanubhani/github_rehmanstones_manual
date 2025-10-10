import { useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: "ring" | "gemstone";
  stock?: number;
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
    image: "",
    category: "ring",
    stock: 1,
  });

  const pickRef = useRef<HTMLInputElement | null>(null);
  const importRef = useRef<HTMLInputElement | null>(null);

  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<"all" | "ring" | "gemstone">("all");
  const [sort, setSort] = useState<"newest" | "priceAsc" | "priceDesc" | "name">("newest");
  const [editing, setEditing] = useState<Product | null>(null);

  function openPicker() {
    pickRef.current?.click();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image");
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setForm((f) => ({ ...f, image: dataUrl }));
    toast.success("Image ready");
  }

  async function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files allowed");
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setForm((f) => ({ ...f, image: dataUrl }));
    toast.success("Image ready");
  }

  function allowDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function add() {
    if (!form.name || !form.image || !form.price) {
      toast.error("Please fill all required fields");
      return;
    }
    const next = [{ id: crypto.randomUUID(), ...form }, ...items];
    setItems(next);
    write(next);
    toast.success("Product added");
    setForm({ name: "", price: 0, image: "", category: "ring", stock: 1 });
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
          image: String(p.image ?? ""),
          category: p.category === "gemstone" ? "gemstone" : "ring",
          stock: typeof p.stock === "number" ? p.stock : 0,
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

  return (
    <section className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm text-gray-500 font-medium">Total Products: {items.length}</div>
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

      <div className="grid lg:grid-cols-[minmax(320px,400px)_1fr] gap-6">
        {/* Add Product Form */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-4 sm:p-6 h-fit lg:sticky lg:top-6">
          <h3 className="font-bold text-lg mb-4">Add New Product</h3>

          {/* Image Uploader */}
          <div
            className={`rounded-xl border-2 border-dashed p-6 grid place-items-center cursor-pointer transition ${
              form.image ? "border-emerald-400 bg-emerald-50/40" : "border-gray-300 hover:bg-gray-50"
            }`}
            onClick={openPicker}
            onDrop={handleDrop}
            onDragOver={allowDrop}
          >
            {form.image ? (
              <img src={form.image} alt="Preview" className="w-full max-h-64 object-contain rounded-lg" />
            ) : (
              <div className="text-center text-gray-600">
                <div className="mx-auto mb-3 w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-700 to-black text-white grid place-items-center">
                  <ImageIcon />
                </div>
                <div className="font-semibold">Click or drop image</div>
                <div className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</div>
              </div>
            )}
            <input ref={pickRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>

          {/* Fields */}
          <div className="mt-4 space-y-3">
            <Input label="Product Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="E.g. Silver Ring" />
            <Input
              label="Price (PKR)"
              type="number"
              value={String(form.price)}
              onChange={(v) => setForm({ ...form, price: Number(v) || 0 })}
              placeholder="0"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                className="w-full rounded-xl ring-1 ring-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-black bg-white"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as "ring" | "gemstone" })}
              >
                <option value="ring">Ring</option>
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

          <div className="mt-6 flex items-center gap-2">
            <button
              onClick={add}
              className="flex-1 px-4 py-3 rounded-xl bg-black text-white font-semibold hover:bg-gray-800 transition"
            >
              Add Product
            </button>
            <button
              onClick={() => setForm({ name: "", price: 0, image: "", category: "ring", stock: 1 })}
              className="px-4 py-3 rounded-xl ring-1 ring-gray-300 hover:bg-gray-50 font-medium"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Products List */}
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
                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" alt={p.name} />
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          p.category === "ring" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {p.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 line-clamp-2 mb-1">{p.name}</h4>
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-lg font-bold text-gray-900">Rs. {p.price.toLocaleString("en-PK")}</div>
                      <div className="text-xs text-gray-500">Stock: {p.stock ?? 0}</div>
                    </div>
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
      </div>

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
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image");
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setState((s) => ({ ...s, image: dataUrl }));
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
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
              {state.image ? (
                <img src={state.image} className="w-full max-h-64 object-contain rounded-lg" alt="" />
              ) : (
                <div className="text-center text-gray-600">Upload image</div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Name" value={state.name} onChange={(v) => setState({ ...state, name: v })} />
              <Input
                label="Price (PKR)"
                type="number"
                value={String(state.price)}
                onChange={(v) => setState({ ...state, price: Number(v) || 0 })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  className="w-full rounded-xl ring-1 ring-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-black"
                  value={state.category}
                  onChange={(e) => setState({ ...state, category: e.target.value as any })}
                >
                  <option value="ring">Ring</option>
                  <option value="gemstone">Gemstone</option>
                </select>
              </div>
              <Input
                label="Stock"
                type="number"
                value={String(state.stock ?? 0)}
                onChange={(v) => setState({ ...state, stock: Number(v) || 0 })}
              />
            </div>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
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
