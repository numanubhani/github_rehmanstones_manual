// src/pages/FAQ.tsx
import { useState } from "react";

type FAQItem = {
  question: string;
  answer: string;
  category: "General" | "Orders" | "Shipping" | "Returns" | "Products";
};

const FAQS: FAQItem[] = [
  // General
  {
    category: "General",
    question: "What is Rehman Stones?",
    answer:
      "Rehman Stones is a trusted online retailer specializing in authentic 925 sterling silver jewelry and certified gemstones. We offer handcrafted rings, pendants, and natural stones sourced from certified suppliers.",
  },
  {
    category: "General",
    question: "Are your products authentic?",
    answer:
      "Yes! All our jewelry is made from genuine 925 sterling silver (92.5% pure silver). Our gemstones come with authenticity certificates from certified gemological labs. We guarantee authenticity or your money back.",
  },
  {
    category: "General",
    question: "Do you have a physical store?",
    answer:
      "We primarily operate online for the best prices. However, you can visit our office in Lahore by appointment. Contact us at +92 300 1234567 to schedule a visit.",
  },
  {
    category: "General",
    question: "How can I contact customer support?",
    answer:
      "You can reach us via email at info@rehmanstones.com, call us at +92 300 1234567, or WhatsApp at the same number. Our support hours are Monday-Friday, 9 AM - 8 PM, and Saturday 10 AM - 6 PM.",
  },

  // Orders
  {
    category: "Orders",
    question: "How do I place an order?",
    answer:
      "Browse our products, select your desired item, choose size (for rings), add to cart, and proceed to checkout. Enter your shipping details, select payment method, and confirm your order. You'll receive an email confirmation immediately.",
  },
  {
    category: "Orders",
    question: "What payment methods do you accept?",
    answer:
      "We accept Cash on Delivery (COD) and online bank transfers. For bank transfers, you'll receive our account details at checkout. Please upload your payment receipt for verification.",
  },
  {
    category: "Orders",
    question: "Can I cancel or modify my order?",
    answer:
      "Yes, but only before it ships. Contact us immediately at +92 300 1234567 or info@rehmanstones.com. Once shipped, you'll need to follow our return process.",
  },
  {
    category: "Orders",
    question: "Do you offer custom or personalized jewelry?",
    answer:
      "Yes! We offer engraving services and custom designs. Contact us with your requirements, and we'll provide a quote. Custom orders typically take 7-10 business days.",
  },
  {
    category: "Orders",
    question: "How do I track my order?",
    answer:
      "You'll receive a tracking number via email and SMS once your order ships. Visit our Track Order page and enter your Order ID to see real-time delivery status.",
  },

  // Shipping
  {
    category: "Shipping",
    question: "Do you ship nationwide?",
    answer:
      "Yes! We ship to all cities and towns across Pakistan using trusted courier services like TCS, Leopards, and M&P Express.",
  },
  {
    category: "Shipping",
    question: "What are the shipping charges?",
    answer:
      "Orders over Rs. 10,000 qualify for FREE shipping. Orders under Rs. 10,000 cost Rs. 200 for major cities and Rs. 300 for remote areas.",
  },
  {
    category: "Shipping",
    question: "How long does delivery take?",
    answer:
      "Major cities (Lahore, Karachi, Islamabad, etc.): 2-4 business days. Other cities: 3-6 business days. Remote areas: 5-8 business days. Peak seasons may cause delays.",
  },
  {
    category: "Shipping",
    question: "What if I'm not home for delivery?",
    answer:
      "The courier will attempt delivery twice. If both attempts fail, you can pick up from the courier office or request redelivery (additional charges may apply).",
  },

  // Returns
  {
    category: "Returns",
    question: "What is your return policy?",
    answer:
      "We offer a 7-day return policy. Items must be unworn, in original packaging with tags, and not customized. Contact us within 7 days of delivery to initiate a return.",
  },
  {
    category: "Returns",
    question: "How do I return an item?",
    answer:
      "Email info@rehmanstones.com with your order number and return reason. We'll provide return instructions. Pack securely and ship using a trackable method. Refunds are processed within 3-5 days of receiving the item.",
  },
  {
    category: "Returns",
    question: "Who pays for return shipping?",
    answer:
      "If returning due to our error (wrong item, damaged, defective), we cover shipping. For change of mind or size issues, customer covers return shipping costs.",
  },
  {
    category: "Returns",
    question: "Can I exchange an item?",
    answer:
      "Yes! Follow the same return process. If exchanging for a different price, we'll refund or charge the difference.",
  },

  // Products
  {
    category: "Products",
    question: "What is 925 sterling silver?",
    answer:
      "925 sterling silver contains 92.5% pure silver and 7.5% other metals (usually copper) for durability. It's the international standard for silver jewelry and is hypoallergenic.",
  },
  {
    category: "Products",
    question: "How do I choose my ring size?",
    answer:
      "We offer sizes 11-40. Visit a local jeweler for professional sizing, or measure a ring that fits using our size guide. Contact us if you need assistance.",
  },
  {
    category: "Products",
    question: "Are your gemstones natural or synthetic?",
    answer:
      "All our gemstones are 100% natural, not synthetic or lab-created. Each stone comes with a certificate of authenticity from a certified gemological laboratory.",
  },
  {
    category: "Products",
    question: "How do I care for my silver jewelry?",
    answer:
      "Store in a cool, dry place away from moisture. Clean with a soft cloth. Avoid chemicals, perfumes, and lotions. For deep cleaning, use mild soap and warm water. Dry thoroughly.",
  },
  {
    category: "Products",
    question: "Why does silver tarnish?",
    answer:
      "Silver tarnishes when exposed to air, moisture, and sulfur. This is natural and doesn't affect quality. Regular wearing and proper storage reduce tarnishing. Tarnish can be easily removed with a silver polishing cloth.",
  },
  {
    category: "Products",
    question: "Do you offer gift wrapping?",
    answer:
      "All orders come in elegant packaging suitable for gifting. Premium gift wrapping is available for an additional Rs. 200. Select this option at checkout.",
  },
];

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const categories = ["All", "General", "Orders", "Shipping", "Returns", "Products"];

  const filteredFAQs =
    activeCategory === "All"
      ? FAQS
      : FAQS.filter((faq) => faq.category === activeCategory);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our products, orders, shipping, and
            more.
          </p>
        </div>

        {/* Category filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setOpenIndex(null);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeCategory === cat
                    ? "bg-black text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ list */}
        <div className="bg-white rounded-xl shadow-sm">
          {filteredFAQs.map((faq, index) => (
            <FAQAccordion
              key={index}
              question={faq.question}
              answer={faq.answer}
              category={faq.category}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              isLast={index === filteredFAQs.length - 1}
            />
          ))}
        </div>

        {/* Still have questions */}
        <div className="mt-12 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-semibold mb-3">Still have questions?</h2>
          <p className="text-gray-300 mb-6">
            Can't find what you're looking for? Our customer support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/contact"
              className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Contact Us
            </a>
            <a
              href="https://wa.me/923148426575"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function FAQAccordion({
  question,
  answer,
  category,
  isOpen,
  onToggle,
  isLast,
}: {
  question: string;
  answer: string;
  category: string;
  isOpen: boolean;
  onToggle: () => void;
  isLast: boolean;
}) {
  return (
    <div className={`${!isLast ? "border-b" : ""}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 px-6 py-5 text-left hover:bg-gray-50 transition"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-gray-500 uppercase">
              {category}
            </span>
          </div>
          <div className="font-semibold text-gray-900">{question}</div>
        </div>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          className={`shrink-0 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 pb-5">
          <p className="text-gray-700 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

