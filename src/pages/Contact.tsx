// src/pages/Contact.tsx
import { useState } from "react";
import toast from "react-hot-toast";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  function handleChange(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      // Save to localStorage (in real app, send to backend/email service)
      const messages = JSON.parse(localStorage.getItem("contact_messages") || "[]");
      messages.push({
        ...form,
        date: new Date().toISOString(),
        id: Date.now().toString(),
      });
      localStorage.setItem("contact_messages", JSON.stringify(messages));

      toast.success("Message sent! We'll get back to you soon.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have a question or need assistance? We're here to help. Reach out to us
            anytime!
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-6">
            <ContactCard
              icon="phone"
              title="Phone"
              lines={["+92 314 8426575"]}
              action={{ label: "Call Now", href: "tel:+923148426575" }}
            />
            <ContactCard
              icon="email"
              title="Email"
              lines={["info@rehmanstones.com", "support@rehmanstones.com"]}
              action={{ label: "Send Email", href: "mailto:info@rehmanstones.com" }}
            />
            <ContactCard
              icon="location"
              title="Address"
              lines={[
                "Rehman Stones",
                "19-A Model Town",
                "Lahore, Punjab 54000",
                "Pakistan",
              ]}
            />
            <ContactCard
              icon="whatsapp"
              title="WhatsApp"
              lines={["+92 314 8426575"]}
              action={{
                label: "Chat on WhatsApp",
                href: "https://wa.me/923148426575",
              }}
            />

            {/* Business hours */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white">
              <h3 className="font-semibold text-lg mb-3">Business Hours</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span>9:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span>10:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span>Closed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-semibold mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black"
                      placeholder="03xx-xxxxxxx"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      value={form.subject}
                      onChange={(e) => handleChange("subject", e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black"
                      placeholder="How can we help?"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    required
                    value={form.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    rows={6}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-60 transition"
                >
                  {submitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Map placeholder */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-4">
          <div className="w-full h-80 bg-gray-200 rounded-lg grid place-items-center">
            <div className="text-center text-gray-500">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                className="mx-auto mb-3 text-gray-400"
              >
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              <p className="font-medium">Map Location</p>
              <p className="text-sm mt-1">19-A Model Town, Lahore, Pakistan</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactCard({
  icon,
  title,
  lines,
  action,
}: {
  icon: "phone" | "email" | "location" | "whatsapp";
  title: string;
  lines: string[];
  action?: { label: string; href: string };
}) {
  const iconPaths = {
    phone:
      "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
    email:
      "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    location:
      "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z",
    whatsapp:
      "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gray-100 grid place-items-center shrink-0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d={iconPaths[icon]}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg mb-2">{title}</h3>
          <div className="space-y-1 text-sm text-gray-600">
            {lines.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
          {action && (
            <a
              href={action.href}
              target={action.href.startsWith("http") ? "_blank" : undefined}
              rel={action.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="inline-block mt-3 text-sm font-medium text-black hover:underline"
            >
              {action.label} →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

