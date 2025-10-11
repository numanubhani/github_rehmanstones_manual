// src/components/Footer.tsx
import { Link } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Footer() {
  const [email, setEmail] = useState("");

  function handleNewsletterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    
    // Store newsletter signup in localStorage (in real app, send to backend)
    const subscribers = JSON.parse(localStorage.getItem("newsletter_subscribers") || "[]");
    if (subscribers.includes(email)) {
      toast.error("You're already subscribed!");
      return;
    }
    subscribers.push(email);
    localStorage.setItem("newsletter_subscribers", JSON.stringify(subscribers));
    
    toast.success("Thanks for subscribing to our newsletter!");
    setEmail("");
  }

  return (
    <footer className="bg-black text-gray-400 relative overflow-hidden mt-20">
      {/* Subtle top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand section */}
          <div>
            <h3 className="text-white text-2xl font-black mb-4 tracking-wide">
              RS
            </h3>
            <p className="text-sm leading-relaxed mb-6 text-gray-500">
              Your trusted source for genuine 925 silver jewelry and certified
              gemstones. Handcrafted with excellence.
            </p>
            <div className="flex gap-3">
              <SocialLink
                href="https://facebook.com"
                icon="facebook"
                label="Facebook"
              />
              <SocialLink
                href="https://instagram.com"
                icon="instagram"
                label="Instagram"
              />
              <SocialLink
                href="https://twitter.com"
                icon="twitter"
                label="Twitter"
              />
              <SocialLink
                href="https://youtube.com"
                icon="youtube"
                label="YouTube"
              />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <FooterLink to="/about">About Us</FooterLink>
              <FooterLink to="/contact">Contact Us</FooterLink>
              <FooterLink to="/faq">FAQ</FooterLink>
              <FooterLink to="/track">Track Order</FooterLink>
              <FooterLink to="/orders">Order History</FooterLink>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Policies</h4>
            <ul className="space-y-3 text-sm">
              <FooterLink to="/privacy-policy">Privacy Policy</FooterLink>
              <FooterLink to="/terms">Terms & Conditions</FooterLink>
              <FooterLink to="/return-policy">Return Policy</FooterLink>
              <FooterLink to="/shipping-policy">Shipping Policy</FooterLink>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Newsletter</h4>
            <p className="text-sm mb-6 text-gray-500 leading-relaxed">
              Subscribe to get special offers and exclusive deals.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white text-sm outline-none focus:border-white transition-all placeholder:text-gray-600"
                required
              />
              <button
                type="submit"
                className="w-full px-4 py-3 bg-white hover:bg-gray-200 text-black rounded-lg font-bold text-sm transition-all duration-300"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Payment methods & contact info */}
        <div className="border-t border-gray-900 pt-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-sm space-y-2">
              <div className="flex items-center gap-3">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-gray-600"
                >
                  <path
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                <a
                  href="mailto:info@rehmanstones.com"
                  className="hover:text-white transition-colors"
                >
                  info@rehmanstones.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-gray-600"
                >
                  <path
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                <a href="tel:+923148426575" className="hover:text-white transition-colors">
                  +92 314 8426575
                </a>
              </div>
            </div>

            <div className="text-sm">
              <div className="text-gray-600 mb-3 text-xs uppercase tracking-wider font-semibold">Payment Methods</div>
              <div className="flex items-center gap-3">
                <span className="px-4 py-2 bg-gray-900 rounded-lg text-xs border border-gray-800 font-medium">
                  Cash on Delivery
                </span>
                <span className="px-4 py-2 bg-gray-900 rounded-lg text-xs border border-gray-800 font-medium">
                  Bank Transfer
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-900 pt-8 text-center">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} Rehman Stones. All rights reserved.
          </p>
          <p className="mt-3 flex items-center justify-center gap-2 text-gray-600 text-sm">
            <span>Made in Pakistan</span>
            <span className="text-base">🇵🇰</span>
            <span>with</span>
            <span className="text-red-500">❤</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Helper components ---------- */

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link to={to} className="hover:text-white transition-colors duration-200 inline-block">
        {children}
      </Link>
    </li>
  );
}

function SocialLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: "facebook" | "instagram" | "twitter" | "youtube";
  label: string;
}) {
  const paths = {
    facebook: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z",
    instagram:
      "M16 2H8a6 6 0 00-6 6v8a6 6 0 006 6h8a6 6 0 006-6V8a6 6 0 00-6-6zM12 15a3 3 0 110-6 3 3 0 010 6zm4.5-9a.5.5 0 110-1 .5.5 0 010 1z",
    twitter:
      "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z",
    youtube:
      "M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z M9.75 15.02l.01-6.02L15.5 12l-5.75 3.02z",
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-10 h-10 rounded-lg bg-gray-900 hover:bg-white hover:text-black border border-gray-800 hover:border-white grid place-items-center transition-all duration-300 hover:scale-105"
      aria-label={label}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d={paths[icon]} />
      </svg>
    </a>
  );
}

