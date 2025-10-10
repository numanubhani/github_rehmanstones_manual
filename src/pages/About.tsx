// src/pages/About.tsx

export default function About() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Rehman Stones</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your trusted source for authentic 925 silver jewelry and certified gemstones,
            handcrafted with passion and precision.
          </p>
        </div>

        {/* Story section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
          <div className="prose max-w-none text-gray-700 space-y-4">
            <p>
              Rehman Stones began with a simple vision: to bring authentic, high-quality
              silver jewelry and certified gemstones to customers who value craftsmanship
              and tradition. What started as a small family business has grown into a
              trusted name in the industry.
            </p>
            <p>
              Every piece in our collection is carefully crafted from genuine 925 sterling
              silver, ensuring durability, elegance, and hypoallergenic properties. Our
              gemstones are sourced from certified suppliers and come with authenticity
              guarantees.
            </p>
            <p>
              We believe that jewelry is more than just an accessory—it's a statement of
              identity, a symbol of tradition, and a treasure that can be passed down
              through generations. That's why we're committed to excellence in every
              detail.
            </p>
          </div>
        </div>

        {/* Values section */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <ValueCard
            icon="shield"
            title="Authenticity"
            description="Every product is made from genuine 925 sterling silver and comes with certification."
          />
          <ValueCard
            icon="heart"
            title="Craftsmanship"
            description="Handcrafted by skilled artisans who take pride in their work and attention to detail."
          />
          <ValueCard
            icon="star"
            title="Quality"
            description="We never compromise on quality. Every piece undergoes rigorous quality checks."
          />
        </div>

        {/* What we offer */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">What We Offer</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-black text-white grid place-items-center text-sm">
                  1
                </span>
                925 Silver Jewelry
              </h3>
              <p className="text-gray-600 text-sm pl-10">
                Pure sterling silver rings with various designs—from classic bands to
                intricate engravings. Hypoallergenic and nickel-free.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-black text-white grid place-items-center text-sm">
                  2
                </span>
                Certified Gemstones
              </h3>
              <p className="text-gray-600 text-sm pl-10">
                Natural gemstones including Aqeeq, Dure-e-Najaf, Amethyst, and more. Each
                stone comes with certification.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-black text-white grid place-items-center text-sm">
                  3
                </span>
                Custom Designs
              </h3>
              <p className="text-gray-600 text-sm pl-10">
                We offer custom engraving and personalization services for your special
                pieces.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-black text-white grid place-items-center text-sm">
                  4
                </span>
                Nationwide Delivery
              </h3>
              <p className="text-gray-600 text-sm pl-10">
                Fast and secure shipping across Pakistan. Free delivery on orders over Rs.
                10,000.
              </p>
            </div>
          </div>
        </div>

        {/* Why choose us */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-sm p-8 text-white">
          <h2 className="text-2xl font-semibold mb-6">Why Choose Rehman Stones?</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                className="text-green-400 mt-1 shrink-0"
                fill="currentColor"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              <span className="text-sm">100% Authentic Products</span>
            </div>
            <div className="flex items-start gap-3">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                className="text-green-400 mt-1 shrink-0"
                fill="currentColor"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              <span className="text-sm">Certified Gemstones</span>
            </div>
            <div className="flex items-start gap-3">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                className="text-green-400 mt-1 shrink-0"
                fill="currentColor"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              <span className="text-sm">7-Day Easy Returns</span>
            </div>
            <div className="flex items-start gap-3">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                className="text-green-400 mt-1 shrink-0"
                fill="currentColor"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              <span className="text-sm">Secure Payment Options</span>
            </div>
            <div className="flex items-start gap-3">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                className="text-green-400 mt-1 shrink-0"
                fill="currentColor"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              <span className="text-sm">Responsive Customer Support</span>
            </div>
            <div className="flex items-start gap-3">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                className="text-green-400 mt-1 shrink-0"
                fill="currentColor"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              <span className="text-sm">Made in Pakistan</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ValueCard({
  icon,
  title,
  description,
}: {
  icon: "shield" | "heart" | "star";
  title: string;
  description: string;
}) {
  const paths = {
    shield: "M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z",
    heart:
      "M12 21s-8-4.438-8-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.562-8 11-8 11Z",
    star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 text-center">
      <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-black text-white grid place-items-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d={paths[icon]} stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

