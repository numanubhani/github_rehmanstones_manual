// src/pages/ShippingPolicy.tsx

export default function ShippingPolicy() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Shipping Policy</h1>
        <p className="text-gray-600 mb-8">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
          <Section title="Shipping Coverage">
            <p>
              We currently ship to all cities and towns across Pakistan. We use trusted
              courier services to ensure your jewelry reaches you safely and on time.
            </p>
          </Section>

          <Section title="Shipping Costs">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="font-semibold text-lg mb-2">Free Shipping</div>
                <p className="text-sm text-gray-700">
                  Orders over <strong>Rs. 10,000</strong> qualify for FREE nationwide
                  shipping.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="font-semibold text-lg mb-2">Standard Shipping</div>
                <p className="text-sm text-gray-700">
                  Orders under Rs. 10,000: <strong>Rs. 200</strong> (major cities) |{" "}
                  <strong>Rs. 300</strong> (remote areas)
                </p>
              </div>
            </div>
          </Section>

          <Section title="Delivery Timeframes">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-24 shrink-0 font-medium">Major Cities</div>
                <div className="text-gray-700">
                  2-4 business days (Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad,
                  Multan, Peshawar, Quetta)
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-24 shrink-0 font-medium">Other Cities</div>
                <div className="text-gray-700">3-6 business days</div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-24 shrink-0 font-medium">Remote Areas</div>
                <div className="text-gray-700">5-8 business days</div>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              *Business days exclude weekends and public holidays. Delivery times may vary
              during peak seasons or due to unforeseen circumstances.
            </p>
          </Section>

          <Section title="Order Processing">
            <p>
              Orders are processed Monday through Saturday (excluding public holidays):
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Orders placed before 2 PM are processed the same day</li>
              <li>Orders placed after 2 PM are processed the next business day</li>
              <li>Orders placed on Sunday are processed on Monday</li>
              <li>You'll receive a confirmation email when your order ships</li>
            </ul>
          </Section>

          <Section title="Order Tracking">
            <p>
              Once your order ships, you'll receive:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Email notification with tracking number</li>
              <li>Tracking link to monitor your delivery status</li>
              <li>SMS updates at key delivery milestones</li>
              <li>
                You can also track your order on our website using your Order ID on the{" "}
                <a href="/track" className="text-blue-600 hover:underline">
                  Track Order
                </a>{" "}
                page
              </li>
            </ul>
          </Section>

          <Section title="Shipping Partners">
            <p>
              We work with reliable courier services including:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>TCS</li>
              <li>Leopards Courier</li>
              <li>M&P Express</li>
              <li>Pakistan Post (for remote areas)</li>
            </ul>
            <p className="mt-3 text-sm text-gray-600">
              The courier service is selected based on your location to ensure fastest
              delivery.
            </p>
          </Section>

          <Section title="Delivery Process">
            <p>Our delivery process:</p>
            <ol className="list-decimal pl-6 space-y-2 mt-3">
              <li>
                Courier will contact you via phone/SMS before delivery (ensure correct
                contact info)
              </li>
              <li>Package must be signed for by an adult</li>
              <li>If you're not available, courier will attempt redelivery</li>
              <li>After 2 failed attempts, the package returns to us</li>
              <li>You can request to hold the package at the courier office for pickup</li>
            </ol>
          </Section>

          <Section title="Damaged or Lost Packages">
            <p>
              All shipments are insured. If your package:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>
                <strong>Arrives damaged:</strong> Do not accept delivery. Contact us
                immediately with photos. We'll send a replacement at no cost.
              </li>
              <li>
                <strong>Is lost in transit:</strong> If tracking shows no movement for 5+
                days beyond estimated delivery, contact us. We'll investigate and send a
                replacement or full refund.
              </li>
            </ul>
          </Section>

          <Section title="Failed Delivery">
            <p>
              If delivery fails due to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>
                <strong>Incorrect address:</strong> You'll need to pay reshipment charges
              </li>
              <li>
                <strong>Refusal to accept:</strong> Return shipping charges will be deducted
                from refund
              </li>
              <li>
                <strong>Customer unavailable (2+ attempts):</strong> Package returns to us;
                contact us to reship (additional charges apply)
              </li>
            </ul>
          </Section>

          <Section title="International Shipping">
            <p>
              We currently ship only within Pakistan. International shipping may be
              available in the future. Contact us for special requests.
            </p>
          </Section>

          <Section title="Contact Us">
            <p>
              Questions about shipping? Contact us:
            </p>
            <div className="mt-3 pl-4 space-y-1 text-sm">
              <div>Email: info@rehmanstones.com</div>
              <div>Phone: +92 314 8426575</div>
              <div>WhatsApp: +92 314 8426575</div>
              <div>Hours: Monday-Friday, 9 AM - 8 PM</div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-3">{title}</h2>
      <div className="text-gray-700 leading-relaxed">{children}</div>
    </div>
  );
}

