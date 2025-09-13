// src/pages/ProductPage.tsx
import { useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProductById, getRelated } from "../data/products";
import type { Product } from "../data/products";
import { useCart } from "../context/CartContext";

/** Brand palette */
const BRAND_DARK = "#111111"; // buttons / headings
const BRAND_ACCENT = "#EB5E28"; // accent / CTAs (warm metallic)
const PRICE = "#1F2937"; // slate-800

export default function ProductPage() {
  const { id } = useParams();
  const product = getProductById(id!);
  const navigate = useNavigate();
  const { addItem } = useCart();

  if (!product) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            Product not found.
          </div>
        </div>
      </div>
    );
  }

  const related = useMemo(() => getRelated(product), [product]);

  // --- size state (only for rings) ---
  const isRing = product.category === "ring";
  const [size, setSize] = useState<number | null>(null);
  const sizeRequired = isRing && size == null;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* Breadcrumbs */}
        <nav className="text-sm text-gray-500">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link
            to={product.category === "ring" ? "/rings" : "/gemstones"}
            className="capitalize hover:underline"
          >
            {product.category}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800">{shorten(product.name, 60)}</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* GALLERY */}
          <Gallery product={product} />

          {/* INFO + ACTIONS */}
          <section className="lg:col-span-7 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl md:text-3xl font-semibold leading-snug text-gray-900">
                {product.name}
              </h1>

              {/* share / favorite */}
              <div className="flex items-center gap-2 text-gray-400">
                <button className="hover:text-gray-700" title="Share">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M15 8l-6 4 6 4"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <circle
                      cx="18"
                      cy="7"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <circle
                      cx="6"
                      cy="12"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <circle
                      cx="18"
                      cy="17"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </button>
                <button className="hover:text-gray-700" title="Wishlist">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 21s-8-4.438-8-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.562-8 11-8 11Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* rating + brand */}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
              <span className="flex items-center gap-1 text-amber-500">
                <Stars value={product.rating ?? 0} />
                <span className="text-gray-500">
                  {product.ratingCount
                    ? `${product.ratingCount} Ratings`
                    : "No Ratings"}
                </span>
              </span>
              <span className="h-3 w-px bg-gray-300" />
              <span className="text-gray-500">
                Brand:{" "}
                <span className="text-gray-900">
                  {product.brand || "No Brand"}
                </span>
              </span>
              <span className="h-3 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                <Badge>925 Silver</Badge>
                <Badge>Hypoallergenic</Badge>
                <Badge>Made in PK</Badge>
              </div>
            </div>

            {/* promo strip (no border) */}
            <div className="mt-5 rounded-sm bg-gradient-to-r from-orange-50 to-amber-50 text-amber-800 px-4 py-3">
              Free shipping on orders over <b>Rs. 10,000</b>. Easy 7-day
              returns.
            </div>

            {/* price block */}
            <div className="mt-6">
              <div
                className="text-[30px] font-semibold"
                style={{ color: PRICE }}
              >
                Rs. {product.price.toLocaleString("en-PK")}
              </div>
              {product.oldPrice && (
                <div className="text-gray-500">
                  <span className="line-through">
                    Rs. {product.oldPrice.toLocaleString("en-PK")}
                  </span>
                  <span className="ml-2 text-emerald-600">
                    -
                    {Math.max(
                      0,
                      Math.round(100 - (product.price / product.oldPrice) * 100)
                    )}
                    %
                  </span>
                </div>
              )}
            </div>

            {/* size selector (rings only) */}
            {isRing && (
              <div className="mt-6">
                <div className="text-sm font-medium text-gray-800 mb-2">
                  Select Size
                </div>
                <SizeGrid selected={size} onSelect={setSize} />
                {sizeRequired && (
                  <div className="mt-2 text-xs text-red-600">
                    Please select a size.
                  </div>
                )}
              </div>
            )}

            {/* quantity + actions */}
            <div className="mt-6">
              <div className="text-sm text-gray-600 mb-2">Quantity</div>
              <QtyAndActions
                disabled={sizeRequired}
                onAdd={(qty) => {
                  const nameWithSize =
                    isRing && size
                      ? `${product.name} (Size ${size})`
                      : product.name;
                  addItem(
                    {
                      id: product.id,
                      name: nameWithSize,
                      price: product.price,
                      image: product.images[0],
                      category: product.category,
                    },
                    qty
                  );
                }}
                onBuyNow={(qty) => {
                  const nameWithSize =
                    isRing && size
                      ? `${product.name} (Size ${size})`
                      : product.name;
                  addItem(
                    {
                      id: product.id,
                      name: nameWithSize,
                      price: product.price,
                      image: product.images[0],
                      category: product.category,
                    },
                    qty
                  );
                  navigate("/cart");
                }}
              />
              {/* trust row */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <IconRow icon="truck">Fast shipping nationwide</IconRow>
                <IconRow icon="shield">Secure checkout</IconRow>
                <IconRow icon="refresh">7-day returns</IconRow>
              </div>
            </div>
          </section>

          {/* DETAILS */}
          <section className="lg:col-span-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold">
              Product details of {shorten(product.name)}
            </h2>
            <div className="mt-4 grid sm:grid-cols-2 gap-6">
              <div>
                {product.highlights && (
                  <ul className="list-disc pl-5 space-y-1 text-gray-800">
                    {product.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                )}
                {product.description && (
                  <p className="mt-4 text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                )}
              </div>
              <div className="sm:border-l sm:pl-6">
                <h3 className="font-medium mb-2">Specifications</h3>
                <table className="w-full text-sm">
                  <tbody>
                    {product.specs &&
                      Object.entries(product.specs).map(([k, v]) => (
                        <tr key={k} className="border-t">
                          <td className="py-2 text-gray-500 w-40">{k}</td>
                          <td className="py-2 text-gray-900">{v}</td>
                        </tr>
                      ))}
                    {product.sku && (
                      <tr className="border-t">
                        <td className="py-2 text-gray-500">SKU</td>
                        <td className="py-2 text-gray-900">{product.sku}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* REVIEWS + Q&A */}
          <section className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold">Ratings & Reviews</h2>
              <div className="mt-4 grid sm:grid-cols-2 gap-6">
                <div className="text-4xl font-bold">0/5</div>
                <div className="space-y-1">
                  {[5, 4, 3, 2, 1].map((r) => (
                    <div
                      key={r}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <span>{r} ★</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded" />
                      <span>0</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 text-gray-500">
                This product has no reviews yet.
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold">
                Questions about this product
              </h2>
              <div className="mt-3 flex gap-2">
                <input
                  className="flex-1 border px-3 py-2"
                  placeholder="Enter your question(s) here"
                />
                <button
                  className="px-4 py-2 text-white"
                  style={{ background: BRAND_ACCENT }}
                >
                  Ask Questions
                </button>
              </div>
              <div className="mt-6 text-gray-500">
                There are no questions yet.
              </div>
            </div>
          </section>

          {/* RELATED */}
          <section className="lg:col-span-12">
            <h2 className="text-lg font-semibold mb-3">You may also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {related.map((p) => (
                <Link
                  key={p.id}
                  to={`/product/${p.id}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow p-0"
                >
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-full h-40 object-cover rounded-t-lg"
                  />
                  <div className="p-3">
                    <div
                      className="text-sm font-medium line-clamp-2"
                      title={p.name}
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {p.name}
                    </div>
                    <div
                      className="mt-1 font-semibold"
                      style={{ color: PRICE }}
                    >
                      Rs. {p.price.toLocaleString("en-PK")}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ---------- Subcomponents ---------- */

function Gallery({ product }: { product: Product }) {
  const [idx, setIdx] = useState(0);
  return (
    <section className="lg:col-span-5 bg-white rounded-lg shadow-sm p-3">
      <div className="bg-gray-50 h-[380px] sm:h-[420px] grid place-items-center overflow-hidden rounded-md">
        <img
          src={product.images[idx]}
          alt={product.name}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="mt-3 flex items-center gap-2 overflow-x-auto">
        {product.images.map((src, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`w-16 h-16 shrink-0 overflow-hidden rounded-md ${
              i === idx ? "ring-2 ring-gray-900" : "ring-1 ring-transparent"
            }`}
            aria-label={`Thumbnail ${i + 1}`}
          >
            <img src={src} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </section>
  );
}

function Stars({ value = 0 }: { value?: number }) {
  const full = Math.floor(value);
  const arr = Array.from({ length: 5 }, (_, i) => i < full);
  return (
    <div className="flex items-center">
      {arr.map((f, i) => (
        <svg
          key={i}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          className={f ? "text-amber-500" : "text-gray-300"}
          fill="currentColor"
        >
          <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.171L12 18.897 4.664 23.168l1.402-8.171L.132 9.21l8.2-1.192z" />
        </svg>
      ))}
    </div>
  );
}

function QtyAndActions({
  disabled,
  onAdd,
  onBuyNow,
}: {
  disabled?: boolean;
  onAdd: (qty: number) => void;
  onBuyNow: (qty: number) => void;
}) {
  const [qty, setQty] = useState(1);
  return (
    <div>
      <div className="inline-flex items-center ring-1 ring-gray-200 rounded">
        <button
          className="w-9 h-9 grid place-items-center hover:bg-gray-50 rounded-l"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          aria-label="Decrease quantity"
          type="button"
        >
          –
        </button>
        <div className="w-12 text-center select-none">{qty}</div>
        <button
          className="w-9 h-9 grid place-items-center hover:bg-gray-50 rounded-r"
          onClick={() => setQty((q) => q + 1)}
          aria-label="Increase quantity"
          type="button"
        >
          +
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          className="px-6 py-3 font-semibold text-white disabled:opacity-60"
          style={{ background: BRAND_DARK }}
          onClick={() => onAdd(qty)}
          disabled={disabled}
          type="button"
        >
          Add to Cart
        </button>
        <button
          className="px-6 py-3 font-semibold text-white disabled:opacity-60"
          style={{ background: BRAND_ACCENT }}
          onClick={() => onBuyNow(qty)}
          disabled={disabled}
          type="button"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}

function SizeGrid({
  selected,
  onSelect,
}: {
  selected: number | null;
  onSelect: (v: number) => void;
}) {
  const sizes = Array.from({ length: 30 }, (_, i) => i + 11); // 11..40
  return (
    <div className="grid grid-cols-8 sm:grid-cols-10 gap-2">
      {sizes.map((s) => {
        const active = selected === s;
        return (
          <button
            key={s}
            type="button"
            onClick={() => onSelect(s)}
            className={`text-sm px-2 py-1 rounded-md transition ${
              active
                ? "bg-black text-white"
                : "bg-white text-gray-800 ring-1 ring-gray-200 hover:bg-gray-50"
            }`}
            aria-pressed={active}
            aria-label={`Select size ${s}`}
          >
            {s}
          </button>
        );
      })}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-xs bg-white text-gray-700 ring-1 ring-gray-200">
      {children}
    </span>
  );
}

function IconRow({
  icon,
  children,
}: {
  icon: "truck" | "shield" | "refresh";
  children: React.ReactNode;
}) {
  const path =
    icon === "truck"
      ? "M3 7h10v6H3zM13 9h4l3 3v1h-7zM5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
      : icon === "shield"
      ? "M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z"
      : "M3 12a9 9 0 1 1 2.64 6.36L3 21l.64-2.64A8.97 8.97 0 0 1 3 12Zm6-1h6v2H9v-2z";
  return (
    <div className="flex items-center gap-2">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        className="text-gray-400"
      >
        <path d={path} stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <span>{children}</span>
    </div>
  );
}

function shorten(s: string, n = 72) {
  return s.length > n ? s.slice(0, n) + "..." : s;
}
