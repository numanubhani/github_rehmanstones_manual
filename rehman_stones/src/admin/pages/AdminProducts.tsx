import { useRef, useState } from "react";
import toast from "react-hot-toast";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string; // dataURL
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
      toast.error("Only image files are allowed");
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

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Inventory / Products</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Add product card */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6">
          <h3 className="font-medium">Add product</h3>

          {/* Image uploader */}
          <div
            className={`mt-4 rounded-xl border-2 border-dashed p-4 grid place-items-center cursor-pointer transition
              ${
                form.image
                  ? "border-emerald-300 bg-emerald-50/40"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            onClick={openPicker}
            onDrop={handleDrop}
            onDragOver={allowDrop}
            title="Click or drop an image here"
          >
            {form.image ? (
              <img
                src={form.image}
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
                <div className="font-medium">Upload product image</div>
                <div className="text-xs text-gray-500">
                  PNG/JPG, up to a few MB
                </div>
              </div>
            )}
            <input
              ref={pickRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
          </div>

          {/* Fields */}
          <div className="mt-4 grid gap-3">
            <Input
              label="Name"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
            />
            <Input
              label="Price (PKR)"
              type="number"
              value={String(form.price)}
              onChange={(v) => setForm({ ...form, price: Number(v) || 0 })}
            />
            <div>
              <label className="block text-sm text-gray-600">Category</label>
              <select
                className="mt-1 w-full rounded-lg ring-1 ring-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-black"
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value as "ring" | "gemstone",
                  })
                }
              >
                <option value="ring">ring</option>
                <option value="gemstone">gemstone</option>
              </select>
            </div>
            <Input
              label="Stock"
              type="number"
              value={String(form.stock ?? 0)}
              onChange={(v) => setForm({ ...form, stock: Number(v) || 0 })}
            />
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={add}
              className="px-4 py-2 rounded-lg text-white"
              style={{ background: "#111111" }}
            >
              Add
            </button>
            <button
              onClick={() =>
                setForm({
                  name: "",
                  price: 0,
                  image: "",
                  category: "ring",
                  stock: 1,
                })
              }
              className="px-3 py-2 rounded-lg ring-1 ring-gray-300 hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </div>

        {/* List card */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-6">
          <h3 className="font-medium">Your admin products ({items.length})</h3>

          <div className="mt-4 grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((p) => (
              <div
                key={p.id}
                className="rounded-xl ring-1 ring-gray-200 p-3 bg-white"
              >
                <img
                  src={p.image}
                  className="w-full h-32 object-cover rounded-lg bg-gray-100"
                />
                <div className="mt-2 font-medium line-clamp-2">{p.name}</div>
                <div className="text-xs text-gray-600">
                  Rs. {p.price.toLocaleString("en-PK")} — {p.category}
                  {typeof p.stock === "number" ? ` • Stock: ${p.stock}` : ""}
                </div>
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => remove(p.id)}
                    className="text-sm px-3 py-1.5 rounded-lg ring-1 ring-gray-300 hover:bg-gray-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-gray-500 text-sm">
                No admin products yet. Add your first one on the left.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-600">{label}</label>
      <input
        className="mt-1 w-full rounded-lg ring-1 ring-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-black"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
      />
    </div>
  );
}
